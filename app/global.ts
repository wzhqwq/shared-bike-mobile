import moment from "moment"
import "moment/locale/zh-cn"
import { LatLng } from "react-native-maps"
import { TextStyle, ViewStyle } from "react-native"
import { color, spacing } from "./theme"

type ToastType = import("react-native-toast-notifications").ToastType

const global: {
  toast: ToastType
  positionHuman: (p: LatLng) => string
} = {
  toast: null,
  positionHuman: p => `${p.latitude > 0 ? '东经' : '西经'} ${Math.abs(p.latitude).toFixed(6)}，${p.longitude > 0 ? '北纬' : '南纬'} ${Math.abs(p.longitude).toFixed(6)}`
}
moment.locale('zh-cn')

export const NO_DATA: TextStyle = {
  alignSelf: 'center',
  color: color.primary,
  marginTop: spacing[4],
}

export const INFO_LINE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
}

export const LINE: ViewStyle = {
  flexDirection: 'row',
  paddingVertical: spacing[4],
  paddingHorizontal: spacing[6],
  borderBottomColor: color.line,
  borderBottomWidth: 1,
  alignItems: 'center',
  justifyContent: 'space-between',
}

export const spreadColors = [
  "#d9ed92",
  "#b5e48c",
  "#99d98c",
  "#76c893",
  "#52b69a",
  "#34a0a4",
  "#168aad",
  "#1a759f",
  "#1e6091",
  "#184e77",
]

export type PieSeries = {
  name: string,
  count: number,
  color: string,
  legendFontColor: string,
  legendFontSize: number,
}

export const LIST: ViewStyle = {
  marginTop: spacing[4],
  borderRadius: spacing[2],
  overflow: 'hidden',
}

export const LIST_ITEM: ViewStyle = {
  padding: spacing[4],
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: color.backgroundDarker,
  borderBottomColor: '#0001',
  borderBottomWidth: 1,
}
export const LIST_ITEM_LAST: ViewStyle = {
  ...LIST_ITEM,
  borderBottomWidth: 0,
}

export const LIST_ITEM_TEXT: TextStyle = {
  fontSize: 16,
}


export default global