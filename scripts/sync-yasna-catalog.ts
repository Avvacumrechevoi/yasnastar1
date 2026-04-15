import "dotenv/config";

import { eq, notInArray, sql } from "drizzle-orm";

import {
  yasnaLessons,
  yasnaMechanics,
  yasnaNotes,
  yasnaPoints,
  yasnas,
} from "../drizzle/schema";
import { getDb } from "../server/db";
import { MECHANICS, YASNA_DATA } from "../server/yasna/catalog";

function groupRowsByYasnaId<T extends { yasnaId: string }>(rows: T[]) {
  return rows.reduce(
    (acc, row) => {
      const currentRows = acc.get(row.yasnaId) ?? [];
      currentRows.push(row);
      acc.set(row.yasnaId, currentRows);
      return acc;
    },
    new Map<string, T[]>(),
  );
}

async function syncCatalog() {
  const db = await getDb();

  if (!db) {
    throw new Error("DATABASE_URL is not configured or database is unavailable");
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

  const pointRows = YASNA_DATA.flatMap((record) =>
    Object.entries(record.points ?? {}).map(([pointIndex, rawText]) => ({
      yasnaId: record.id,
      pointIndex: Number(pointIndex),
      rawText: rawText ?? null,
    })),
  );

  const lessonRows = YASNA_DATA.flatMap((record) =>
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

  const noteRows = YASNA_DATA.flatMap((record) =>
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

  const expectedYasnaIds = YASNA_DATA.map((record) => record.id);
  const expectedMechanicIds = MECHANICS.map((mechanic) => mechanic.id);
  const pointRowsByYasnaId = groupRowsByYasnaId(pointRows);
  const lessonRowsByYasnaId = groupRowsByYasnaId(lessonRows);
  const noteRowsByYasnaId = groupRowsByYasnaId(noteRows);

  await db.transaction(async (tx) => {
    await tx.insert(yasnas).values(yasnaRows).onDuplicateKeyUpdate({
      set: {
        family: sql`values(family)`,
        title: sql`values(title)`,
        summary: sql`values(summary)`,
        lessonCount: sql`values(lessonCount)`,
        mechanicsJson: sql`values(mechanicsJson)`,
        sortOrder: sql`values(sortOrder)`,
        updatedAt: sql`now()`,
      },
    });

    if (expectedYasnaIds.length > 0) {
      await tx.delete(yasnas).where(notInArray(yasnas.id, expectedYasnaIds));
    }

    await tx.insert(yasnaMechanics).values(mechanicRows).onDuplicateKeyUpdate({
      set: {
        title: sql`values(title)`,
        shortTitle: sql`values(shortTitle)`,
        alias: sql`values(alias)`,
        category: sql`values(category)`,
        kind: sql`values(kind)`,
        pointIndicesJson: sql`values(pointIndicesJson)`,
        stroke: sql`values(stroke)`,
        fill: sql`values(fill)`,
        glow: sql`values(glow)`,
        description: sql`values(description)`,
        sortOrder: sql`values(sortOrder)`,
        updatedAt: sql`now()`,
      },
    });

    if (expectedMechanicIds.length > 0) {
      await tx.delete(yasnaMechanics).where(notInArray(yasnaMechanics.id, expectedMechanicIds));
    }

    for (const yasnaId of expectedYasnaIds) {
      await tx.delete(yasnaLessons).where(eq(yasnaLessons.yasnaId, yasnaId));
      await tx.delete(yasnaNotes).where(eq(yasnaNotes.yasnaId, yasnaId));
      await tx.delete(yasnaPoints).where(eq(yasnaPoints.yasnaId, yasnaId));

      const nextPointRows = pointRowsByYasnaId.get(yasnaId) ?? [];
      const nextLessonRows = lessonRowsByYasnaId.get(yasnaId) ?? [];
      const nextNoteRows = noteRowsByYasnaId.get(yasnaId) ?? [];

      if (nextPointRows.length > 0) {
        await tx.insert(yasnaPoints).values(nextPointRows);
      }

      if (nextLessonRows.length > 0) {
        await tx.insert(yasnaLessons).values(nextLessonRows);
      }

      if (nextNoteRows.length > 0) {
        await tx.insert(yasnaNotes).values(nextNoteRows);
      }
    }
  });
}

syncCatalog()
  .then(() => {
    console.log("[sync-yasna-catalog] Catalog synchronized successfully");
  })
  .catch((error) => {
    console.error("[sync-yasna-catalog] Synchronization failed", error);
    process.exitCode = 1;
  });
