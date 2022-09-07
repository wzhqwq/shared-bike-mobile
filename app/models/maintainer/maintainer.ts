import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const MaintainerModel = types
  .model("Maintainer")
  .props({
    user_id: types.optional(types.identifierNumber, -1),
    name: types.string,
    phone: types.string,
    handle_count: types.number,
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

export interface Maintainer extends Instance<typeof MaintainerModel> {}
export interface MaintainerSnapshotOut extends SnapshotOut<typeof MaintainerModel> {}
export interface MaintainerSnapshotIn extends SnapshotIn<typeof MaintainerModel> {}
export const createMaintainerDefaultModel = () => types.optional(MaintainerModel, {})
