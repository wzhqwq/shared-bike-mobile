import moment from "moment";
import { AMapSdk } from "react-native-amap3d";

AMapSdk.init('8846b317117dd623af10ee26869e5538')
type ToastType = import("react-native-toast-notifications").ToastType;

const global: {
  toast: ToastType
} = {
  toast: null,
}
moment.locale('zh-cn')

export default global