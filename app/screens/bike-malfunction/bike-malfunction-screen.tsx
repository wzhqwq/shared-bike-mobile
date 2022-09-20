import React, { createContext, FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ListRenderItemInfo, TouchableHighlight, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, navigate, NavigatorParamList } from "../../navigators"
import { Header, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
import { HealthDecrease, Malfunction, RepairRecordModel, useStores } from "../../models"
import { color } from "../../theme"
import { RouteProp, useRoute } from "@react-navigation/native"
import { INFO_LINE, LINE, NO_DATA } from "../../global"
import { MaterialIcons } from "@expo/vector-icons"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

const BikeContext = createContext<number>(null)

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
      <Header headerText="故障列表" hasBack onLeftPress={goBack} />
      <BikeContext.Provider value={params.bikeId}>
        <FlatList
          data={userStore.decreases}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          onRefresh={refresh}
          refreshing={refreshing}
          ListEmptyComponent={(
            <Text style={NO_DATA}>该单车没有需要处理的故障</Text>
          )}
        />
      </BikeContext.Provider>
    </Screen>
  )
})

const renderItem = ({ item }: ListRenderItemInfo<HealthDecrease>) => (
  <BikeContext.Consumer>
    {bikeId => (
      <TouchableHighlight activeOpacity={0.7} underlayColor='#FFF' onPress={() => navigate('malfunctionHandle', { bikeId, malfunctionId: item.id })}>
        <View style={LINE}>
          <View>
            <View style={INFO_LINE}>
              <Text preset='fieldLabel'>故障类别：</Text>
              <Text>{item.id}</Text>
            </View>
            <View style={INFO_LINE}>
              <Text preset='fieldLabel'>折合扣分：</Text>
              <Text>{item.decrease}</Text>
            </View>
          </View>
          <MaterialIcons name='chevron-right' size={24} />
        </View>
      </TouchableHighlight>
    )}
  </BikeContext.Consumer>
)
