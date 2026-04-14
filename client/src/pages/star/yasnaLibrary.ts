export type YasnaLibraryCatalogItem = {
  id: string;
  title: string;
  family: string;
  summary: string;
};

export type YasnaLibraryRowItem = YasnaLibraryCatalogItem & {
  isActive: boolean;
};

export function buildYasnaLibraryPanelCopy() {
  return {
    triggerLabel: "Открыть библиотеку",
  };
}

export function toggleYasnaLibrarySelection(currentIds: string[], targetId: string) {
  if (currentIds.includes(targetId)) {
    return currentIds.filter((id) => id !== targetId);
  }

  return [...currentIds, targetId];
}

export function removeYasnaLibrarySelection(currentIds: string[], targetId: string) {
  return currentIds.filter((id) => id !== targetId);
}

export function pruneYasnaLibrarySelection(currentIds: string[], availableIds: string[]) {
  const allowed = new Set(availableIds);
  const seen = new Set<string>();

  return currentIds.filter((id) => {
    if (!allowed.has(id) || seen.has(id)) {
      return false;
    }

    seen.add(id);
    return true;
  });
}

export function buildYasnaLibraryRow(params: {
  yasnas: YasnaLibraryCatalogItem[];
  selectedIds: string[];
  activeYasnaId: string | null;
}) {
  const { yasnas, selectedIds, activeYasnaId } = params;
  const yasnasById = new Map(yasnas.map((yasna) => [yasna.id, yasna]));

  return selectedIds
    .map((id) => yasnasById.get(id))
    .filter((yasna): yasna is YasnaLibraryCatalogItem => Boolean(yasna))
    .map<YasnaLibraryRowItem>((yasna) => ({
      ...yasna,
      isActive: yasna.id === activeYasnaId,
    }));
}
