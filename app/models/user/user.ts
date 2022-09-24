import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { ImageURISource } from "react-native"
import { BASE_URL } from "../../services/api/api-config"
import { Customer, CustomerModel } from "../customer/customer"
import { MaintainerModel } from "../maintainer/maintainer"
import { Manager, ManagerModel } from "../manager/manager"
const userIcon = require('./user.png')

/**
 * Model description here for TypeScript hints.
 */
export const UserModel = types
  .model("User")
  .props({
    id: types.identifierNumber,
    role: types.number,
    nickname: types.string,
    avatar_key: types.maybeNull(types.string),
    extended: types.maybe(types.union(CustomerModel, MaintainerModel, ManagerModel)),
  })
  .views((self) => ({
    get avatar_url(): ImageURISource {
      if (!self.avatar_key) return userIcon
      return { uri: BASE_URL + '/image/show?key=' + self.avatar_key }
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    updateNickname(nickname: string) {
      self.nickname = nickname
    },
    updateAvatarKey(avatarKey: string) {
      self.avatar_key = avatarKey
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export const UNLINKED_USER = 0
export const CUSTOMER_USER = 1
export const MAINTAINER_USER = 2
export const MANAGER_USER = 3

export const getNameIfExist = (u: User) => u.role === MAINTAINER_USER || u.role === MANAGER_USER ? `（${(u.extended as Manager).name}）` : ''
export const getPhoneIfExist = (u: User) => u.role === MAINTAINER_USER || u.role === MANAGER_USER ? `（${(u.extended as Manager).phone}）` : ''
export const getBanTimeIfExist = (u: User) => u.role === CUSTOMER_USER ? ((u.extended as Customer).banTimeHuman && `（${(u.extended as Customer).banTimeHuman}）`) : null

export interface User extends Instance<typeof UserModel> {}
export interface UserSnapshotOut extends SnapshotOut<typeof UserModel> {}
export interface UserSnapshotIn extends SnapshotIn<typeof UserModel> {}
export const createUserDefaultModel = () => types.optional(UserModel, {})
