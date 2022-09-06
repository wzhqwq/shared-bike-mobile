import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withEnvironment } from "../extensions/with-environment"

/**
 * Model description here for TypeScript hints.
 */
export const SignUpRequestModel = types
  .model("SignUpRequest")
  .props({
    id: types.maybe(types.identifierNumber),
    time: types.maybe(types.Date),
    user_id: types.number,
    type: types.number,
    phone: types.string,
    name: types.string,
    status: types.maybe(types.number),
  })
  .extend(withEnvironment)
  .views((self) => ({
    statusHuman: () => statusArray[self.status]
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async handle(accepted: boolean) {
      const result = await self.environment.api.post('/manager/user/request/handle', { record_id: self.id, status: accepted ? REQUEST_ACCEPTED : REQUEST_REJECTED })
      if (result.ok) {
        self.status = accepted ? REQUEST_ACCEPTED : REQUEST_REJECTED
      }
      return result.ok
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export const REQUEST_UNHANDLED = 0
export const REQUEST_ACCEPTED = 1
export const REQUEST_REJECTED = 2
const statusArray = ['未处理', '同意请求', '拒绝请求']

export interface SignUpRequest extends Instance<typeof SignUpRequestModel> {}
export interface SignUpRequestSnapshotOut extends SnapshotOut<typeof SignUpRequestModel> {}
export interface SignUpRequestSnapshotIn extends SnapshotIn<typeof SignUpRequestModel> {}
export const createSignUpRequestDefaultModel = () => types.optional(SignUpRequestModel, {})
