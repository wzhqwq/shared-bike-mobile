import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const CustomerModel = types
  .model("Customer")
  .props({})
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Customer extends Instance<typeof CustomerModel> {}
export interface CustomerSnapshotOut extends SnapshotOut<typeof CustomerModel> {}
export interface CustomerSnapshotIn extends SnapshotIn<typeof CustomerModel> {}
export const createCustomerDefaultModel = () => types.optional(CustomerModel, {})
