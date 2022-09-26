import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const SouvenirBillModel = types
  .model("SouvenirBill")
  .props({
    id: types.optional(types.identifierNumber, -1),
    time: types.maybe(types.Date),
    expense: types.string,
    manager_id: types.maybe(types.number),
    souvenir_id: types.number,
    amount: types.number,
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface SouvenirBill extends Instance<typeof SouvenirBillModel> {}
export interface SouvenirBillSnapshotOut extends SnapshotOut<typeof SouvenirBillModel> {}
export interface SouvenirBillSnapshotIn extends SnapshotIn<typeof SouvenirBillModel> {}
export const createSouvenirBillDefaultModel = () => types.optional(SouvenirBillModel, {})
