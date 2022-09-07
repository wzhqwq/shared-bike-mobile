import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const RepairRecordModel = types
  .model("RepairRecord")
  .props({
    id: types.optional(types.identifierNumber, -1),
    time: types.maybe(types.Date),
    bike_id: types.number,
    malfunction_id: types.number,
    maintainer_id: types.maybe(types.number),
    conclusion: types.number,
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface RepairRecord extends Instance<typeof RepairRecordModel> {}
export interface RepairRecordSnapshotOut extends SnapshotOut<typeof RepairRecordModel> {}
export interface RepairRecordSnapshotIn extends SnapshotIn<typeof RepairRecordModel> {}
export const createRepairRecordDefaultModel = () => types.optional(RepairRecordModel, {})
