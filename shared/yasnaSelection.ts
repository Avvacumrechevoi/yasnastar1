export function areAllMechanicsSelected(activeIds: string[], allIds: string[]) {
  return allIds.length > 0 && activeIds.length === allIds.length;
}

export function getNextMechanicSelection(activeIds: string[], allIds: string[]) {
  return areAllMechanicsSelected(activeIds, allIds) ? [] : [...allIds];
}
