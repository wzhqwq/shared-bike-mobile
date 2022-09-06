import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { NavView, Screen } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from "../../theme"
import { Feather, MaterialIcons } from '@expo/vector-icons'

const ROOT: ViewStyle = {
  flex: 1,
}

export const CustomerScreen: FC<StackScreenProps<NavigatorParamList, "customer">> = observer(function CustomerScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen style={ROOT}>
      <NavView buttons={[
        { label: '骑行', icon: (<MaterialIcons name='pedal-bike' />), iconActive: (<MaterialIcons name='pedal-bike' color={color.primary} />) },
        { label: '兑换', icon: (<Feather name='package' />), iconActive: (<Feather name='package' color={color.primary} />) },
        { label: '我', icon: (<MaterialIcons name='person-outline' />), iconActive: (<MaterialIcons name='person-outline' color={color.primary} />) },
      ]}>
        <View>a</View>
        <View>b</View>
        <View>c</View>
      </NavView>
    </Screen>
  )
})
