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
import { loadYasnaCatalogSnapshot } from "./repository";

const RUNTIME_CATALOG_TTL_MS = 5 * 60 * 1000;

let runtimeDefaultYasnaId = DEFAULT_YASNA_ID;
let runtimeYasnas: YasnaRecord[] = cloneYasnas(YASNA_DATA);
let runtimeMechanics: Mechanic[] = cloneMechanics(MECHANICS);
let runtimeMechanicGroups: MechanicGroup[] = cloneMechanicGroups(MECHANIC_GROUPS);
let refreshPromise: Promise<void> | null = null;
let lastRefreshAt = 0;

function cloneLessons(lessons: YasnaLesson[]) {
  return lessons.map(lesson => ({
    ...lesson,
    mechanics_mentions: [...lesson.mechanics_mentions],
  }));
}

function cloneYasnas(records: YasnaRecord[]) {
  return records.map(record => ({
    ...record,
    mechanics: [...record.mechanics],
    points: { ...record.points },
    lessons: cloneLessons(record.lessons),
    notes: [...record.notes],
  }));
}

function cloneMechanics(mechanics: Mechanic[]) {
  return mechanics.map(mechanic => ({
    ...mechanic,
    points: [...mechanic.points],
  }));
}

function cloneMechanicGroups(groups: MechanicGroup[]) {
  return groups.map(group => ({
    ...group,
    ids: [...group.ids],
  }));
}

function replaceArray<T>(target: T[], next: T[]) {
  target.splice(0, target.length, ...next);
}

export async function refreshYasnaRuntimeCatalog(options?: { force?: boolean }) {
  const shouldUseCache = !options?.force;

  if (shouldUseCache && lastRefreshAt > 0 && Date.now() - lastRefreshAt < RUNTIME_CATALOG_TTL_MS) {
    return;
  }

  if (refreshPromise) {
    await refreshPromise;
    return;
  }

  const currentPromise = (async () => {
    const snapshot = await loadYasnaCatalogSnapshot();
    runtimeDefaultYasnaId = snapshot.defaultYasnaId;
    replaceArray(runtimeYasnas, cloneYasnas(snapshot.yasnas));
    replaceArray(runtimeMechanics, cloneMechanics(snapshot.mechanics));
    replaceArray(runtimeMechanicGroups, cloneMechanicGroups(snapshot.mechanicGroups));
    lastRefreshAt = Date.now();
  })();

  refreshPromise = currentPromise;

  try {
    await currentPromise;
  } finally {
    if (refreshPromise === currentPromise) {
      refreshPromise = null;
    }
  }
}

export function getRuntimeCatalogLastRefreshAt() {
  return lastRefreshAt;
}

export function getRuntimeDefaultYasnaId() {
  return runtimeDefaultYasnaId;
}

export function getRuntimeYasnaData() {
  return runtimeYasnas;
}

export function getRuntimeMechanics() {
  return runtimeMechanics;
}

export function getRuntimeMechanicGroups() {
  return runtimeMechanicGroups;
}
