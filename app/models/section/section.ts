import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { LatLng } from "react-native-maps"

/**
 * Model description here for TypeScript hints.
 */
export const SectionModel = types
  .model("Section")
  .props({
    id: types.optional(types.identifierNumber, -1),
    tr_longitude: types.string,
    tr_latitude: types.string,
    bl_longitude: types.string,
    bl_latitude: types.string,
    name: types.string,
  })
  .views((self) => ({
    get coordinates(): LatLng[] {
      return [
        { latitude: parseFloat(self.tr_latitude), longitude: parseFloat(self.tr_longitude) },
        { latitude: parseFloat(self.bl_latitude), longitude: parseFloat(self.tr_longitude) },
        { latitude: parseFloat(self.bl_latitude), longitude: parseFloat(self.bl_longitude) },
        { latitude: parseFloat(self.tr_latitude), longitude: parseFloat(self.bl_longitude) },
      ]
    },
    get center(): LatLng {
      return {
        latitude: (parseFloat(self.tr_latitude) + parseFloat(self.bl_latitude)) / 2,
        longitude: (parseFloat(self.tr_longitude) + parseFloat(self.bl_longitude)) / 2,
      }
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Section extends Instance<typeof SectionModel> {}
export interface SectionSnapshotOut extends SnapshotOut<typeof SectionModel> {}
export interface SectionSnapshotIn extends SnapshotIn<typeof SectionModel> {}
export const createSectionDefaultModel = () => types.optional(SectionModel, {})
