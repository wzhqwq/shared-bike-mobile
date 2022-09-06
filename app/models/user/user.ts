import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { BASE_URL } from "../../services/api/api-config"
import { CustomerModel } from "../customer/customer"
import { MaintainerModel } from "../maintainer/maintainer"
import { ManagerModel } from "../manager/manager"

/**
 * Model description here for TypeScript hints.
 */
export const UserModel = types
  .model("User")
  .props({
    id: types.identifierNumber,
    role: types.number,
    nickname: types.string,
    avatar_key: types.maybe(types.string),
    extended: types.union({
      dispatcher: o => {
        if (typeof o.deposit === 'string') return CustomerModel
        if (typeof o.handle_count === 'number') return MaintainerModel
        return ManagerModel
      },
    }, CustomerModel, MaintainerModel, ManagerModel),
  })
  .views((self) => ({
    get avatar_url() {
      return BASE_URL + '/image/show?key=' + self.avatar_key
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export const UNLINKED_USER = 0
export const CUSTOMER_USER = 1
export const MAINTAINER_USER = 2
export const MANAGER_USER = 3

export interface User extends Instance<typeof UserModel> {}
export interface UserSnapshotOut extends SnapshotOut<typeof UserModel> {}
export interface UserSnapshotIn extends SnapshotIn<typeof UserModel> {}
export const createUserDefaultModel = () => types.optional(UserModel, {})
