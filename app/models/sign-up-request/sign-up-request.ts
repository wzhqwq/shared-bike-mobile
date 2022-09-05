import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const SignUpRequestModel = types
  .model("SignUpRequest")
  .props({
    id: types.maybe(types.identifierNumber),
    time: types.maybe(types.Date),
    user_id: types.maybe(types.number),
    type: types.number,
    phone: types.string,
    name: types.string,
    status: types.maybe(types.number),
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface SignUpRequest extends Instance<typeof SignUpRequestModel> {}
export interface SignUpRequestSnapshotOut extends SnapshotOut<typeof SignUpRequestModel> {}
export interface SignUpRequestSnapshotIn extends SnapshotIn<typeof SignUpRequestModel> {}
export const createSignUpRequestDefaultModel = () => types.optional(SignUpRequestModel, {})
