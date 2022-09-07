import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const PunishRecordModel = types
  .model("PunishRecord")
  .props({
    id: types.optional(types.identifierNumber, -1),
    time: types.maybe(types.Date),
    customer_id: types.number,
    points_deducted: types.number,
    reason: types.string,
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface PunishRecord extends Instance<typeof PunishRecordModel> {}
export interface PunishRecordSnapshotOut extends SnapshotOut<typeof PunishRecordModel> {}
export interface PunishRecordSnapshotIn extends SnapshotIn<typeof PunishRecordModel> {}
export const createPunishRecordDefaultModel = () => types.optional(PunishRecordModel, {})
