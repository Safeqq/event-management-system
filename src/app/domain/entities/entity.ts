export interface Entity {
  id: string;
}

export const equalsEntity = (a: Entity, b: Entity): boolean => {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  return a.id === b.id;
};
