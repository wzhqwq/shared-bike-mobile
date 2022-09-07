import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const MalfunctionRecordModel = types
  .model("MalfunctionRecord")
  .props({
    id: types.optional(types.identifierNumber, -1),
    time: types.maybe(types.Date),
    bike_id: types.maybe(types.number),
    ride_id: types.number,
    malfunction_id: types.number,
    degree: types.number,
    description: types.string,
    image_key: types.maybeNull(types.string),
    status: types.maybe(types.number),
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setStatus(status: number) {
      self.status = status
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface MalfunctionRecord extends Instance<typeof MalfunctionRecordModel> {}
export interface MalfunctionRecordSnapshotOut extends SnapshotOut<typeof MalfunctionRecordModel> {}
export interface MalfunctionRecordSnapshotIn extends SnapshotIn<typeof MalfunctionRecordModel> {}
export const createMalfunctionRecordDefaultModel = () => types.optional(MalfunctionRecordModel, {})
