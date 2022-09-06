import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { CharacterStoreModel } from "../character-store/character-store"
import { EntityStoreModel } from "../entity-store/entity-store"
import { RecordStoreModel } from "../record-store/record-store"
import { UserStoreModel } from "../user-store/user-store"

/**
 * A RootStore model.
 */
// prettier-ignore
export const RootStoreModel = types.model("RootStore").props({
  characterStore: types.optional(CharacterStoreModel, {} as any),
  userStore: types.optional(UserStoreModel, {} as any),
  entityStore: types.optional(EntityStoreModel, {} as any),
  recordStore: types.optional(RecordStoreModel, {} as any),
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}

/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
