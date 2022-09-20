import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ListRenderItemInfo, TextStyle, TouchableHighlight, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, navigate, NavigatorParamList } from "../../navigators"
import { Button, Header, Screen, Text } from "../../components"
import { useStores, Bike } from "../../models"
import { color, spacing } from "../../theme"
import { MaterialIcons } from "@expo/vector-icons"
import { NO_DATA } from "../../global"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

const SELECTOR: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  borderBottomColor: color.line,
  borderBottomWidth: 1,
  padding: spacing[3],
}

const NOT_ACTIVE: { v: ViewStyle, t: TextStyle} = {
  v: {
    backgroundColor: color.transparent,
  },
  t: {
    color: color.primaryDarker,
  },
}

const filters: { name: string, category: 'danger' | 'all' | 'destroyed' }[] = [
  { name: '危险', category: 'danger' },
  { name: '全部', category: 'all' },
  { name: '已注销', category: 'destroyed' },
]

export const BikesScreen: FC<StackScreenProps<NavigatorParamList, "bikes">> = observer(function BikesScreen() {
  const { entityStore } = useStores()
  const [type, setType] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const version = entityStore.bikesVersion

  const refresh = useCallback(() => {
    entityStore.listBikesWithFiltering(filters[type].category, false).then(() => setRefreshing(false))
  }, [type])

  const next = useCallback(() => {
    entityStore.listBikesWithFiltering(filters[type].category, true)
  }, [])

  useEffect(() => refresh(), [type])

  return (
    <Screen style={ROOT}>
      <Header headerText="管理单车" hasBack onLeftPress={goBack} />
      <View style={SELECTOR}>
        {filters.map(({ name }, i) => (
          <Button
            style={i !== type ? NOT_ACTIVE.v : undefined}
            textStyle={i !== type ? NOT_ACTIVE.t : undefined}
            text={name}
            key={i}
            onPress={() => setType(i)}
          />
        ))}
      </View>
      <FlatList
        onEndReached={next}
        data={entityStore.bikes}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onRefresh={refresh}
        refreshing={refreshing}
        ListEmptyComponent={(
          <Text style={NO_DATA}>没有符合{filters[type].name}条件的单车</Text>
        )}
      />
    </Screen>
  )
})

const INFO_LINE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
}

const LINE: ViewStyle = {
  flexDirection: 'row',
  paddingVertical: spacing[4],
  paddingHorizontal: spacing[6],
  borderBottomColor: color.line,
  borderBottomWidth: 1,
  alignItems: 'center',
  justifyContent: 'space-between',
}

const STATUS_LINE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
}

const STATUS_AVAILABLE: ViewStyle = {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: color.primary,
  marginRight: spacing[1],
}

const STATUS_OCCUPIED: ViewStyle = {
  width: 6,
  height: 6,
  borderWidth: 2,
  borderRadius: 3,
  borderColor: color.primary,
  marginRight: spacing[1],
}

const STATUS_UNAVAILABLE: ViewStyle = {
  ...STATUS_OCCUPIED,
  borderColor: color.palette.lightGrey,
}

const STATUS_DESTROYED: ViewStyle = {
  ...STATUS_AVAILABLE,
  backgroundColor: color.palette.lightGrey,
}

const statusComponents = [
  (<View key={0} style={STATUS_LINE}><View style={STATUS_AVAILABLE} /><Text>空闲</Text></View>),
  (<View key={1} style={STATUS_LINE}><View style={STATUS_OCCUPIED} /><Text>使用中</Text></View>),
  (<View key={2} style={STATUS_LINE}><View style={STATUS_UNAVAILABLE} /><Text>维护中</Text></View>),
  (<View key={3} style={STATUS_LINE}><View style={STATUS_DESTROYED} /><Text>已注销</Text></View>),
]

const renderItem = ({ item }: ListRenderItemInfo<Bike>) => (
  <TouchableHighlight activeOpacity={0.7} underlayColor='#FFF' onPress={() => navigate('bikeDetail', { bikeId: item.id })}>
    <View style={LINE}>
      <View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>序列号：</Text>
          <Text>{item.series_no}</Text>
        </View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>状态：</Text>
          <Text>{statusComponents[item.status]}</Text>
        </View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>健康值：</Text>
          <Text>{item.health}</Text>
        </View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>总行驶里程：</Text>
          <Text>{item.mileage} 公里</Text>
        </View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>维修失败次数：</Text>
          <Text>{item.fail_count}</Text>
        </View>
      </View>
      <MaterialIcons name='chevron-right' size={24} />
    </View>
  </TouchableHighlight>
)
