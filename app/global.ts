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

export default global