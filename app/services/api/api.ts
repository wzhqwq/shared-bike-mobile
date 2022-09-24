import { ApisauceInstance, create, ApiResponse } from "apisauce"
import global from "../../global"
import { BikeBill, BikeSeries, Configuration, DestroyRecord, ExchangeRecord, Malfunction, MalfunctionRecord, OtherBill, ParkingPoint, RechargeRecord, RepairRecord, Section, SignUpRequest, Souvenir, SouvenirBill } from "../../models"
import { navigate } from "../../navigators"
import { ApiConfig, DEFAULT_API_CONFIG } from "./api-config"

export type Paginator = {
  lastId: number
  size?: number
}

interface AllRoutes {
  '/auth/sign_up': { nickname: string, password: string }
  '/auth/sign_in': { nickname: string, password: string }
  '/auth/register_as_customer': undefined
  '/auth/request_to_be': SignUpRequest
  '/auth/check_role': undefined
  '/auth/me': undefined
  '/auth/edit_profile': { nickname?: string, name?: string, phone?: string, avatar_key?: string }
  '/auth/edit_password': { password: string, old_password: string }
  '/customer/bike/list': { longitude: string, latitude: string }
  '/customer/bike/parking_point/list': { longitude: string, latitude: string }
  '/customer/bike/find': { series_no: string }
  '/customer/bike/unlock': { bike_id: number, encrypted: string }
  '/customer/bike/update': { bike_id: number, encrypted: string }
  '/customer/bike/report': MalfunctionRecord[]
  '/customer/bike/record/list/ride': Paginator
  '/customer/bike/record/list/malfunction': { ride_id: number }
  '/customer/property/list/points': Paginator
  '/customer/property/list/deposit': Paginator
  '/customer/property/list/recharge': Paginator
  '/customer/property/recharge': RechargeRecord
  '/customer/souvenir/items/list': undefined
  '/customer/souvenir/exchanged/list': Paginator
  '/customer/souvenir/exchange': ExchangeRecord
  '/maintainer/list_sections': undefined
  '/maintainer/list_parking_points': { section_id: number }
  '/maintainer/bike/list': { section_id: number }
  '/maintainer/bike/list_to_move': { section_id: number }
  '/maintainer/bike/find': { series_no: string }
  '/maintainer/bike/register': { encrypted: string, series_id: number }
  '/maintainer/bike/activate': { encrypted: string }
  '/maintainer/maintain/start': { bike_id: number }
  '/maintainer/maintain/finish': { bike_id: number, p_longitude: string, p_latitude: string }
  '/maintainer/malfunction/list_decreases': { bike_id: number }
  '/maintainer/malfunction/list': { bike_id: number, malfunction_id: number }
  '/maintainer/malfunction/handle': RepairRecord
  '/maintainer/repair/list': Paginator
  '/maintainer/repair/graph': undefined
  '/manager/property/separated/list/bike': Paginator
  '/manager/property/separated/list/souvenir': Paginator
  '/manager/property/separated/list/other': Paginator
  '/manager/property/master/statistics': undefined
  '/manager/property/master/list': Paginator
  '/manager/property/master/detail': { record_id: number, type: number }
  '/manager/property/separated/add/bike': BikeBill
  '/manager/property/separated/add/souvenir': SouvenirBill
  '/manager/property/separated/add/other': OtherBill
  '/manager/user/list/customer': Paginator
  '/manager/user/list/manager': Paginator
  '/manager/user/list/maintainer': Paginator
  '/manager/user/find': { user_id: number }
  '/manager/user/request/list': Paginator
  '/manager/user/request/handle': { record_id: number, status: number }
  '/manager/user/lift_the_ban': { customer_id: number }
  '/manager/bike/statistics': undefined
  '/manager/bike/list/danger': Paginator
  '/manager/bike/list/all': Paginator
  '/manager/bike/list/destroyed': Paginator
  '/manager/bike/destroy': DestroyRecord
  '/manager/bike/series/add': BikeSeries
  '/manager/bike/series/modify': BikeSeries
  '/manager/bike/series/remove': { series_id: number }
  '/manager/bike/malfunction/add': Malfunction
  '/manager/bike/malfunction/modify': { malfunction_id: number, part_name: string }
  '/manager/souvenir/add': Souvenir
  '/manager/souvenir/modify': Souvenir
  '/manager/souvenir/exchanges/list': { customer_id: number }
  '/manager/souvenir/exchanges/give': { record_id: number }
  '/manager/section/add': Section
  '/manager/section/remove': { section_id: number }
  '/manager/section/maintainer/list': { section_id: number }
  '/manager/section/maintainer/grant': { section_id: number, maintainer_id: number }
  '/manager/section/maintainer/revoke': { section_id: number, maintainer_id: number }
  '/manager/parking_point/list': undefined
  '/manager/parking_point/add': ParkingPoint
  '/manager/parking_point/remove': { pp_id: number }
  '/manager/config/list': undefined
  '/manager/config/modify': Configuration[]
  '/shared/series/list': undefined
  '/shared/malfunction/list': undefined
  '/shared/souvenir/list': undefined
  '/shared/section/list': undefined
}

/**
 * Manages all requests to the API.
 */
export class Api {
  /**
   * The underlying apisauce instance which performs the requests.
   */
  apisauce: ApisauceInstance

  /**
   * Configurable options.
   */
  config: ApiConfig

  /**
   * Creates the api.
   *
   * @param config The configuration to use.
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
  }

  /**
   * Sets up the API.  This will be called during the bootup
   * sequence and will happen before the first React component
   * is mounted.
   *
   * Be as quick as possible in here.
   */
  setup() {
    // construct the apisauce instance
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })
    this.apisauce.addResponseTransform(response => {
      if (response.status === 401) {
        navigate("login")
        global.toast.show("请登录", { type: 'danger' })
        return
      }
      if (response.status !== 200) {
        global.toast.show(response.data ?? response.problem, { type: 'danger' })
        return
      }
      if (!response.data.status) {
        global.toast.show(response.data.error, { type: 'danger' })
        response.ok = false
        return
      }
      const convertor = (o: any) => {
        if (o.extended) convertor(o.extended)
        if (o.time) o.time = new Date(o.time)
        if (o.start_time) o.start_time = new Date(o.start_time)
        if (o.end_time) o.end_time = new Date(o.end_time)
        if (o.ban_time) o.ban_time = new Date(o.ban_time)
      }
      response.data = response.data.data
      if (!response.data) return
      if (response.data instanceof Array) {
        response.data.forEach(convertor)
      }
      else {
        convertor(response.data)
      }
    })
  }

  updateJwt(jwt: string) {
    this.apisauce.setHeader('Authorization', 'Bearer ' + jwt)
  }

  get<TData, TReq extends keyof AllRoutes>(url: TReq, params?: AllRoutes[TReq]) {
    return this.apisauce.get<TData>(url, params)
  }

  post<TData, TReq extends keyof AllRoutes>(url: TReq, data: AllRoutes[TReq]) {
    return this.apisauce.post<TData>(url, data)
  }
}

export type Response<T> = ApiResponse<T>