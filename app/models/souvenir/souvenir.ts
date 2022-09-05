import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const SouvenirModel = types
  .model("Souvenir")
  .props({})
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Souvenir extends Instance<typeof SouvenirModel> {}
export interface SouvenirSnapshotOut extends SnapshotOut<typeof SouvenirModel> {}
export interface SouvenirSnapshotIn extends SnapshotIn<typeof SouvenirModel> {}
export const createSouvenirDefaultModel = () => types.optional(SouvenirModel, {})
