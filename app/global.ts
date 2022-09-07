import moment from "moment"
import "moment/locale/zh-cn"

type ToastType = import("react-native-toast-notifications").ToastType;

const global: {
  toast: ToastType
} = {
  toast: null,
}
moment.locale('zh-cn')

export default global