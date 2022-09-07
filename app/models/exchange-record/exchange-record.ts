import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { Response } from "../../services/api"
import { withEnvironment } from "../extensions/with-environment"
import { Manager } from "../manager/manager"
import { User } from "../user/user"

/**
 * Model description here for TypeScript hints.
 */
export const ExchangeRecordModel = types
  .model("ExchangeRecord")
  .props({
    id: types.optional(types.identifierNumber, -1),
    time: types.maybe(types.Date),
    souvenir_id: types.number,
    customer_id: types.maybe(types.number),
    amount: types.number,
    given: types.maybe(types.number),
    given_by: types.maybeNull(types.number),
  })
  .extend(withEnvironment)
  .views((self) => ({
    async giverName(): Promise<string> {
      if (!self.given_by) return '无'
      const result: Response<User> = await self.environment.api.post('/manager/user/find', { user_id: self.given_by })
      return result.ok ? (result.data.extended as Manager).name : '无'
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setGiven() {
      self.given = 1
      self.given_by = self.environment.localUser.id
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async give() {
      const result: Response<null> = await self.environment.api.post('/manager/souvenir/exchanges/give', { record_id: self.id })
      if (result.ok) self.setGiven()
      return result.ok
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface ExchangeRecord extends Instance<typeof ExchangeRecordModel> {}
export interface ExchangeRecordSnapshotOut extends SnapshotOut<typeof ExchangeRecordModel> {}
export interface ExchangeRecordSnapshotIn extends SnapshotIn<typeof ExchangeRecordModel> {}
export const createExchangeRecordDefaultModel = () => types.optional(ExchangeRecordModel, {})
