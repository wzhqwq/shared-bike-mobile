import crypto from 'crypto-es'
import { types } from 'mobx-state-tree'
import { LatLng } from 'react-native-maps'
import global from "../../global"
import { BIKE_AVAILABLE, BIKE_OCCUPIED } from "../../models"

export class DummyBike {
  private longitude: number
  private latitude: number
  private mileage: number
  private token: string
  constructor(public seriesNo: string) {
    this.mileage = 0
  }

  public setPosition(pos: LatLng) {
    if (this.longitude) {
      this.mileage += distance(pos.latitude, this.latitude, pos.longitude, this.longitude)
    }
    this.longitude = pos.longitude
    this.latitude = pos.latitude
  }

  public sendToBike(bikeId: number, type: 'unlock' | 'update' | 'lock') {
    switch (type) {
      case 'unlock':
        this.token = new Array(20).fill(0).map(() => Math.floor(Math.random() * 10)).join('')
        return DummyBike.encrypt([this.token, bikeId.toString()])
      case 'update':
        return DummyBike.encrypt([this.token, BIKE_OCCUPIED.toString(), this.mileage.toFixed(3), this.longitude.toFixed(6), this.latitude.toFixed(6)])
      case 'lock':
        return DummyBike.encrypt([this.token, BIKE_AVAILABLE.toString(), this.mileage.toFixed(3), this.longitude.toFixed(6), this.latitude.toFixed(6)])
    }
  }

  public verifyServer(msg: string) {
    if (DummyBike.decrypt(msg)[0] !== this.token) {
      global.toast.show('无法信任服务器')
      return false
    }
    return true
  }

  public getInfo() {
    return DummyBike.encrypt([this.seriesNo, this.longitude.toFixed(6), this.latitude.toFixed(6)])
  }

  public activate(msg: string) {
    const [seriesNo, bikeId] = DummyBike.decrypt(msg)
    if (seriesNo !== this.seriesNo) {
      global.toast.show('无法信任服务器')
      return null
    }
    return DummyBike.encrypt([bikeId])
  }

  public static encrypt(values: string[]) {
    return crypto.AES.encrypt(values.join('$'), 'bike').toString()
  }

  public static decrypt(encrypted: string) {
    return crypto.AES.decrypt(encrypted, 'bike').toString(crypto.enc.Utf8).split('$')
  }
}

export const DummyBikeModel = types.custom<string, DummyBike>({
  name: 'DummyBike',
  fromSnapshot(s) {
    return new DummyBike(s)
  },
  toSnapshot(v) {
    return v.seriesNo
  },
  isTargetType(v) {
    return v instanceof DummyBike
  },
  getValidationMessage() {
    return 'emmm'
  }
})

function distance(lat1, lat2, lon1, lon2) {
  // The math module contains a function
  // named toRadians which converts from
  // degrees to radians.
  lon1 = lon1 * Math.PI / 180
  lon2 = lon2 * Math.PI / 180
  lat1 = lat1 * Math.PI / 180
  lat2 = lat2 * Math.PI / 180

  // Haversine formula
  const dlon = lon2 - lon1
  const dlat = lat2 - lat1
  const a = Math.pow(Math.sin(dlat / 2), 2)
      + Math.cos(lat1) * Math.cos(lat2)
      * Math.pow(Math.sin(dlon / 2),2)
    
  const c = 2 * Math.asin(Math.sqrt(a))

  // Radius of earth in kilometers. Use 3956
  // for miles
  const r = 6371

  // calculate the result
  return(c * r)
}
