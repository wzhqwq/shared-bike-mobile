import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const ManagerBillModel = types
  .model("ManagerBill")
  .props({
    id: types.maybe(types.identifierNumber),
    time: types.maybe(types.Date),
    type: types.number,
    record_id: types.number,
    user_id: types.number,
    change: types.string,
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface ManagerBill extends Instance<typeof ManagerBillModel> {}
export interface ManagerBillSnapshotOut extends SnapshotOut<typeof ManagerBillModel> {}
export interface ManagerBillSnapshotIn extends SnapshotIn<typeof ManagerBillModel> {}
export const createManagerBillDefaultModel = () => types.optional(ManagerBillModel, {})
