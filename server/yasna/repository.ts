import { asc } from "drizzle-orm";
import { yasnaLessons, yasnaMechanics, yasnaNotes, yasnaPoints, yasnas } from "../../drizzle/schema";
import { getDb } from "../db";
import {
  DEFAULT_YASNA_ID,
  MECHANIC_GROUPS,
  MECHANICS,
  YASNA_DATA,
  type Mechanic,
  type MechanicGroup,
  type YasnaLesson,
  type YasnaRecord,
} from "./catalog";

export type YasnaCatalogSnapshot = {
  defaultYasnaId: string;
  yasnas: YasnaRecord[];
  mechanics: Mechanic[];
  mechanicGroups: MechanicGroup[];
  source: "db" | "fallback";
};

let seedPromise: Promise<void> | null = null;

function parseJsonArray<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn("[YasnaRepository] Failed to parse JSON payload:", error);
    return fallback;
  }
}

function buildMechanicGroups(mechanics: Mechanic[]): MechanicGroup[] {
  const categoryOrder = MECHANIC_GROUPS.map(group => group.title);

  return categoryOrder
    .map(title => ({
      title,
      ids: mechanics.filter(mechanic => mechanic.category === title).map(mechanic => mechanic.id),
    }))
    .filter(group => group.ids.length > 0);
}

function getFallbackSnapshot(): YasnaCatalogSnapshot {
  return {
    defaultYasnaId: DEFAULT_YASNA_ID,
    yasnas: YASNA_DATA,
    mechanics: MECHANICS,
    mechanicGroups: MECHANIC_GROUPS,
    source: "fallback",
  };
}

async function seedYasnaTables() {
  const db = await getDb();

  if (!db) {
    return;
  }

  const [existingYasnas, existingMechanics] = await Promise.all([
    db.select({ id: yasnas.id }).from(yasnas).orderBy(asc(yasnas.sortOrder), asc(yasnas.title)),
    db
      .select({ id: yasnaMechanics.id, title: yasnaMechanics.title, shortTitle: yasnaMechanics.shortTitle })
      .from(yasnaMechanics)
      .orderBy(asc(yasnaMechanics.sortOrder), asc(yasnaMechanics.title)),
  ]);
  const expectedYasnaIds = YASNA_DATA.map(record => record.id);
  const existingYasnaIds = existingYasnas.map(record => record.id);
  const expectedMechanicSignature = MECHANICS.map(mechanic => `${mechanic.id}:${mechanic.title}:${mechanic.shortTitle}`);
  const existingMechanicSignature = existingMechanics.map(
    mechanic => `${mechanic.id}:${mechanic.title}:${mechanic.shortTitle}`,
  );
  const isYasnaCatalogInSync =
    existingYasnaIds.length === expectedYasnaIds.length &&
    existingYasnaIds.every((id, index) => id === expectedYasnaIds[index]);
  const isMechanicCatalogInSync =
    existingMechanicSignature.length === expectedMechanicSignature.length &&
    existingMechanicSignature.every((signature, index) => signature === expectedMechanicSignature[index]);

  if (isYasnaCatalogInSync && isMechanicCatalogInSync) {
    return;
  }

  const yasnaRows = YASNA_DATA.map((record, index) => ({
    id: record.id,
    family: record.family,
    title: record.title,
    summary: record.summary,
    lessonCount: record.lesson_count,
    mechanicsJson: JSON.stringify(record.mechanics ?? []),
    sortOrder: index,
  }));

  const pointRows = YASNA_DATA.flatMap(record =>
    Object.entries(record.points ?? {}).map(([pointIndex, rawText]) => ({
      yasnaId: record.id,
      pointIndex: Number(pointIndex),
      rawText: rawText ?? null,
    })),
  );

  const lessonRows = YASNA_DATA.flatMap(record =>
    record.lessons.map((lesson, index) => ({
      yasnaId: record.id,
      file: lesson.file,
      lesson: lesson.lesson,
      topics: lesson.topics,
      pointAssignments: lesson.point_assignments,
      mechanicMentionsJson: JSON.stringify(lesson.mechanics_mentions ?? []),
      interfaceNotes: lesson.interface_notes,
      sortOrder: index,
    })),
  );

  const noteRows = YASNA_DATA.flatMap(record =>
    record.notes.map((noteText, index) => ({
      yasnaId: record.id,
      noteText,
      sortOrder: index,
    })),
  );

  const mechanicRows = MECHANICS.map((mechanic, index) => ({
    id: mechanic.id,
    title: mechanic.title,
    shortTitle: mechanic.shortTitle,
    alias: mechanic.alias ?? null,
    category: mechanic.category,
    kind: mechanic.kind,
    pointIndicesJson: JSON.stringify(mechanic.points ?? []),
    stroke: mechanic.stroke,
    fill: mechanic.fill,
    glow: mechanic.glow,
    description: mechanic.description,
    sortOrder: index,
  }));

  await db.transaction(async tx => {
    await tx.delete(yasnaLessons);
    await tx.delete(yasnaNotes);
    await tx.delete(yasnaPoints);
    await tx.delete(yasnas);
    await tx.delete(yasnaMechanics);

    await tx.insert(yasnas).values(yasnaRows);

    if (pointRows.length > 0) {
      await tx.insert(yasnaPoints).values(pointRows);
    }

    if (lessonRows.length > 0) {
      await tx.insert(yasnaLessons).values(lessonRows);
    }

    if (noteRows.length > 0) {
      await tx.insert(yasnaNotes).values(noteRows);
    }

    if (mechanicRows.length > 0) {
      await tx.insert(yasnaMechanics).values(mechanicRows);
    }
  });
}

async function ensureYasnaSeeded() {
  if (seedPromise) {
    await seedPromise;
    return;
  }

  const currentPromise = seedYasnaTables();
  seedPromise = currentPromise;

  try {
    await currentPromise;
  } finally {
    if (seedPromise === currentPromise) {
      seedPromise = null;
    }
  }
}

export async function loadYasnaCatalogSnapshot(): Promise<YasnaCatalogSnapshot> {
  const db = await getDb();

  if (!db) {
    return getFallbackSnapshot();
  }

  try {
    await ensureYasnaSeeded();

    const [yasnaRows, pointRows, lessonRows, noteRows, mechanicRows] = await Promise.all([
      db.select().from(yasnas).orderBy(asc(yasnas.sortOrder), asc(yasnas.title)),
      db.select().from(yasnaPoints).orderBy(asc(yasnaPoints.yasnaId), asc(yasnaPoints.pointIndex)),
      db.select().from(yasnaLessons).orderBy(asc(yasnaLessons.yasnaId), asc(yasnaLessons.sortOrder), asc(yasnaLessons.id)),
      db.select().from(yasnaNotes).orderBy(asc(yasnaNotes.yasnaId), asc(yasnaNotes.sortOrder), asc(yasnaNotes.id)),
      db.select().from(yasnaMechanics).orderBy(asc(yasnaMechanics.sortOrder), asc(yasnaMechanics.title)),
    ]);

    if (yasnaRows.length === 0) {
      return getFallbackSnapshot();
    }

    const pointsByYasnaId = new Map<string, Record<string, string>>();
    pointRows.forEach(row => {
      const current = pointsByYasnaId.get(row.yasnaId) ?? {};
      current[String(row.pointIndex)] = row.rawText ?? "";
      pointsByYasnaId.set(row.yasnaId, current);
    });

    const lessonsByYasnaId = new Map<string, YasnaLesson[]>();
    lessonRows.forEach(row => {
      const current = lessonsByYasnaId.get(row.yasnaId) ?? [];
      current.push({
        file: row.file,
        lesson: row.lesson,
        topics: row.topics,
        point_assignments: row.pointAssignments,
        mechanics_mentions: parseJsonArray<string[]>(row.mechanicMentionsJson, []),
        interface_notes: row.interfaceNotes,
      });
      lessonsByYasnaId.set(row.yasnaId, current);
    });

    const notesByYasnaId = new Map<string, string[]>();
    noteRows.forEach(row => {
      const current = notesByYasnaId.get(row.yasnaId) ?? [];
      current.push(row.noteText);
      notesByYasnaId.set(row.yasnaId, current);
    });

    const mechanics = (mechanicRows.length > 0 ? mechanicRows : []).map(row => ({
      id: row.id,
      title: row.title,
      shortTitle: row.shortTitle,
      alias: row.alias ?? undefined,
      category: row.category,
      kind: row.kind,
      points: parseJsonArray<number[]>(row.pointIndicesJson, []),
      stroke: row.stroke,
      fill: row.fill,
      glow: row.glow,
      description: row.description,
    })) satisfies Mechanic[];

    const resolvedMechanics = mechanics.length > 0 ? mechanics : MECHANICS;

    return {
      defaultYasnaId: yasnaRows[0]?.id ?? DEFAULT_YASNA_ID,
      yasnas: yasnaRows.map(row => ({
        id: row.id,
        family: row.family,
        title: row.title,
        lesson_count: row.lessonCount,
        summary: row.summary,
        mechanics: parseJsonArray<string[]>(row.mechanicsJson, []),
        points: pointsByYasnaId.get(row.id) ?? {},
        lessons: lessonsByYasnaId.get(row.id) ?? [],
        notes: notesByYasnaId.get(row.id) ?? [],
      })),
      mechanics: resolvedMechanics,
      mechanicGroups: buildMechanicGroups(resolvedMechanics),
      source: "db",
    };
  } catch (error) {
    console.warn("[YasnaRepository] Failed to load DB snapshot, fallback will be used:", error);
    return getFallbackSnapshot();
  }
}
