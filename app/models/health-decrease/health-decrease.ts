import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const HealthDecreaseModel = types
  .model("HealthDecrease")
  .props({
    id: types.number,
    decrease: types.number,
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface HealthDecrease extends Instance<typeof HealthDecreaseModel> {}
export interface HealthDecreaseSnapshotOut extends SnapshotOut<typeof HealthDecreaseModel> {}
export interface HealthDecreaseSnapshotIn extends SnapshotIn<typeof HealthDecreaseModel> {}
export const createHealthDecreaseDefaultModel = () => types.optional(HealthDecreaseModel, {})
