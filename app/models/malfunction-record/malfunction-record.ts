import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const MalfunctionRecordModel = types
  .model("MalfunctionRecord")
  .props({
    id: types.maybe(types.identifierNumber),
    time: types.maybe(types.Date),
    bike_id: types.maybe(types.number),
    ride_id: types.number,
    malfunction_id: types.number,
    degree: types.number,
    description: types.string,
    image_key: types.optional(types.string, undefined),
    status: types.maybe(types.number),
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface MalfunctionRecord extends Instance<typeof MalfunctionRecordModel> {}
export interface MalfunctionRecordSnapshotOut extends SnapshotOut<typeof MalfunctionRecordModel> {}
export interface MalfunctionRecordSnapshotIn extends SnapshotIn<typeof MalfunctionRecordModel> {}
export const createMalfunctionRecordDefaultModel = () => types.optional(MalfunctionRecordModel, {})
