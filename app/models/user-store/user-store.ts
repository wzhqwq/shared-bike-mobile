import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import global from "../../global"
import { Response } from "../../services/api"
import { Bike, BikeModel } from "../bike/bike"
import { withEnvironment } from "../extensions/with-environment"
import { Maintainer, MaintainerModel } from "../maintainer/maintainer"
import { Manager } from "../manager/manager"
import { SignUpRequestModel } from "../sign-up-request/sign-up-request"
import { Statistic, StatisticModel } from "../statistic/statistic"
import { CUSTOMER_USER, MAINTAINER_USER, MANAGER_USER, UNLINKED_USER, User, UserModel } from "../user/user"

/**
 * Model description here for TypeScript hints.
 */
export const UserStoreModel = types
  .model("UserStore")
  .props({
    me: types.maybe(UserModel),
    bikeNow: types.maybe(BikeModel),
    maintainers: types.optional(types.array(MaintainerModel), []),
    sectionIdNow: types.maybe(types.number),
    statistic: types.maybe(StatisticModel)
  })
  .extend(withEnvironment)
  .views((self) => ({
    unregistered: () => self.me?.role > UNLINKED_USER
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    updateMe(me: User) {
      self.me = me
    },
    setBikeNow(bike: Bike) {
      self.bikeNow = bike
    },
    setStatistics(o: Statistic) {
      self.statistic = o
    },
    setSectionIdNow(id: number) {
      self.sectionIdNow = id
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async fetch() {
      const result: Response<User> = await self.environment.api.get('/auth/me')
      if (result.ok) {
        self.updateMe(result.data)
        self.environment.updateLocalUser(result.data)
      }
      return result.ok
    },
    async signUp(nickname: string, password: string) {
      const result: Response<string> = await self.environment.api.post('/auth/sign_up', { nickname, password })
      if (result.ok) {
        await self.environment.updateJwt(result.data)
      }
      return result.ok
    },
    async signIn(nickname: string, password: string) {
      const result: Response<string> = await self.environment.api.post('/auth/sign_in', { nickname, password })
      if (result.ok) {
        await self.environment.updateJwt(result.data)
      }
      return result.ok
    },
    async logOut() {
      self.updateMe(undefined)
      await self.environment.removeUser()
    },
    async registerAsCustomer() {
      const result: Response<string> = await self.environment.api.post('/auth/register_as_customer', undefined)
      if (result.ok) {
        await self.environment.updateJwt(result.data)
      }
      return result.ok
    },
    async checkRole() {
      const result: Response<string> = await self.environment.api.post('/auth/check_role', undefined)
      if (result.ok) {
        await self.environment.updateJwt(result.data)
      }
      return result.ok
    },
    async registerAs(type: number, name: string, phone: string) {
      const record = SignUpRequestModel.create({ type, name, phone, id: -1 })
      const result: Response<null> = await self.environment.api.post('/auth/request_to_be', record)
      if (result.ok) {
        global.toast.show("请等待管理员同意请求")
      }
    },
    async changePassword(password: string, oldPassword: string) {
      const result: Response<null> = await self.environment.api.post('/auth/edit_password', { password, old_password: oldPassword })
      return result.ok
    },
    async changeProfile(nickname: string, name?: string, phone?: string) {
      const result: Response<User> = await self.environment.api.post('/auth/edit_profile', { nickname, name, phone })
      if (result.ok) {
        self.me.updateNickname(result.data.nickname)
        if (self.me.role === MAINTAINER_USER || self.me.role === MANAGER_USER) {
          const local = self.me.extended as (Maintainer | Manager)
          const remote = result.data.extended as (Maintainer | Manager)
          local.updateName(remote.name)
          local.updatePhone(remote.phone)
        }
      }
      return result.ok
    },
    async findBike(seriesNo: string) {
      const result: Response<Bike> = self.me.role === CUSTOMER_USER ?
        await self.environment.api.get('/customer/bike/find', { series_no: seriesNo }) :
        await self.environment.api.get('/maintainer/bike/find', { series_no: seriesNo })

      if (result.ok) {
        self.setBikeNow(result.data)
      }
      return result.ok
    },
    async listMaintainersInSection(sectionId: number) {
      self.setSectionIdNow(sectionId)
      const result: Response<Maintainer[]> = await self.environment.api.get('/manager/section/maintainer/list', { section_id: sectionId })
      if (result.ok) {
        self.maintainers.replace(result.data)
      }
      return result.ok
    },
    async grantSectionTo(sectionId: number, maintainerId: number) {
      const result: Response<Maintainer[]> = await self.environment.api.post('/manager/section/maintainer/grant', { section_id: sectionId, maintainer_id: maintainerId })
      if (result.ok && self.sectionIdNow === sectionId) {
        self.maintainers.replace(result.data)
      }
      return result.ok
    },
    async revokeSectionFrom(sectionId: number, maintainerId: number) {
      const result: Response<Maintainer[]> = await self.environment.api.post('/manager/section/maintainer/revoke', { section_id: sectionId, maintainer_id: maintainerId })
      if (result.ok && self.sectionIdNow === sectionId) {
        self.maintainers.replace(result.data)
      }
      return result.ok
    },
    async getStatistics() {
      const bikeResult: Response<any> = await self.environment.api.get('/manager/bike/statistics')
      if (!bikeResult.ok) return false
      const billResult: Response<any> = await self.environment.api.get('/manager/property/master/statistics')
      if (!billResult.ok) return false
      self.setStatistics({ ...bikeResult.data, ...billResult.data })
      return true
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface UserStore extends Instance<typeof UserStoreModel> {}
export interface UserStoreSnapshotOut extends SnapshotOut<typeof UserStoreModel> {}
export interface UserStoreSnapshotIn extends SnapshotIn<typeof UserStoreModel> {}
export const createUserStoreDefaultModel = () => types.optional(UserStoreModel, {})
