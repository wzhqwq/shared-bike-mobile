import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
import { Malfunction, RepairRecordModel, useStores } from "../../models"
import { color } from "../../theme"
import { RouteProp, useRoute } from "@react-navigation/native"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

export const BikeMalfunctionScreen: FC<StackScreenProps<NavigatorParamList, "bikeMalfunction">> = observer(function BikeMalfunctionScreen() {
  const { userStore } = useStores()
  const { params } = useRoute<RouteProp<NavigatorParamList, "bikeMalfunction">>()
  const [refreshing, setRefreshing] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const version = userStore.decreasesVersion

  useEffect(() => {
    refresh()
  }, [params.bikeId])

  const refresh = useCallback(() => {
    userStore.getDecreases(params.bikeId).then(() => setRefreshing(false))
  }, [params])

  return (
    <Screen style={ROOT}>
      <Text preset="header" text="bikeMalfunction" />
    </Screen>
  )
})
