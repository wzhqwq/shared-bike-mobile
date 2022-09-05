import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const DestroyRecordModel = types
  .model("DestroyRecord")
  .props({
    id: types.maybe(types.identifierNumber),
    time: types.maybe(types.Date),
    bike_id: types.number,
    manager_id: types.maybe(types.number),
    reason: types.string,
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface DestroyRecord extends Instance<typeof DestroyRecordModel> {}
export interface DestroyRecordSnapshotOut extends SnapshotOut<typeof DestroyRecordModel> {}
export interface DestroyRecordSnapshotIn extends SnapshotIn<typeof DestroyRecordModel> {}
export const createDestroyRecordDefaultModel = () => types.optional(DestroyRecordModel, {})
