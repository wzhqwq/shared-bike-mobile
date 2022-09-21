import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { LatLng } from "react-native-maps"

/**
 * Model description here for TypeScript hints.
 */
export const ParkingPointModel = types
  .model("ParkingPoint")
  .props({
    id: types.optional(types.identifierNumber, -1),
    p_longitude: types.string,
    p_latitude: types.string,
    bikes_count: types.maybe(types.number),
    minimum_count: types.optional(types.number, 0),
    section_id: types.maybeNull(types.number),
    selected: types.optional(types.boolean, false),
  })
  .views((self) => ({
    get coordinate(): LatLng {
      return { latitude: parseFloat(self.p_latitude), longitude: parseFloat(self.p_longitude) }
    },
    get coordinates(): LatLng[] {
      const latitude = parseFloat(self.p_latitude)
      const longitude = parseFloat(self.p_longitude)
      const offset = (self.bikes_count + 2) * 0.00001
      return [
        { latitude: latitude + offset, longitude: longitude + offset },
        { latitude: latitude + offset, longitude: longitude - offset },
        { latitude: latitude - offset, longitude: longitude - offset },
        { latitude: latitude - offset, longitude: longitude + offset },
      ]
    },
    get lackOfBike(): boolean {
      return self.bikes_count < self.minimum_count
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setSelected(b: boolean) {
      self.selected = b
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface ParkingPoint extends Instance<typeof ParkingPointModel> {}
export interface ParkingPointSnapshotOut extends SnapshotOut<typeof ParkingPointModel> {}
export interface ParkingPointSnapshotIn extends SnapshotIn<typeof ParkingPointModel> {}
export const createParkingPointDefaultModel = () => types.optional(ParkingPointModel, {})
