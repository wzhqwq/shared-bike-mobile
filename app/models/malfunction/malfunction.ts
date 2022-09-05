import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const MalfunctionModel = types
  .model("Malfunction")
  .props({
    id: types.identifierNumber,
    part_name: types.string,
    damage_degree: types.number,
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Malfunction extends Instance<typeof MalfunctionModel> {}
export interface MalfunctionSnapshotOut extends SnapshotOut<typeof MalfunctionModel> {}
export interface MalfunctionSnapshotIn extends SnapshotIn<typeof MalfunctionModel> {}
export const createMalfunctionDefaultModel = () => types.optional(MalfunctionModel, {})
