import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const ManagerModel = types
  .model("Manager")
  .props({
    user_id: types.optional(types.identifierNumber, -1),
    name: types.string,
    phone: types.string,
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    updatePhone(phone: string) {
      self.phone = phone
    },
    updateName(name: string) {
      self.name = name
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Manager extends Instance<typeof ManagerModel> {}
export interface ManagerSnapshotOut extends SnapshotOut<typeof ManagerModel> {}
export interface ManagerSnapshotIn extends SnapshotIn<typeof ManagerModel> {}
export const createManagerDefaultModel = () => types.optional(ManagerModel, {})
