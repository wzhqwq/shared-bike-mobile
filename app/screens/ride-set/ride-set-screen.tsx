import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ListRenderItemInfo, View, ViewStyle, } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, navigate, NavigatorParamList } from "../../navigators"
import { Button, Header, Screen, Text } from "../../components"
import { RideRecord, useStores } from "../../models"
import { color } from "../../theme"
import moment from "moment"
import { NO_DATA, LINE, INFO_LINE } from "../../global"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

export const RideSetScreen: FC<StackScreenProps<NavigatorParamList, "rideSet">> = observer(function RideSetScreen() {
  const { recordStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const version = recordStore.rideRecordsVersion
  
  useEffect(() => {
    if (!recordStore.rideRecords.length) refresh()
  }, [])

  const refresh = useCallback(() => {
    recordStore.listMyRideRecords(false).then(() => setRefreshing(false))
  }, [])

  const next = useCallback(() => {
    recordStore.listMyRideRecords(true)
  }, [])

  return (
    <Screen style={ROOT}>
      <Header headerText="骑行记录" hasBack onLeftPress={goBack} />
      {!recordStore.rideRecords.length && (<Text style={NO_DATA}>没有骑行记录</Text>)}
      <FlatList
        onEndReached={next}
        data={recordStore.rideRecords}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onRefresh={refresh}
        refreshing={refreshing}
      />
    </Screen>
  )
})

const renderItem = ({ item }: ListRenderItemInfo<RideRecord>) => (
  <View style={LINE}>
    <View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>消费：</Text>
        <Text>{item.charge} 元</Text>
      </View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>骑行里程：</Text>
        <Text>{item.mileage.toFixed(3)} 公里</Text>
      </View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>获得积分：</Text>
        <Text>{item.points_acquired ?? '0'}</Text>
      </View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>开始骑行时间：</Text>
        <Text>{moment(item.start_time).format('YYYY-MM-DD HH:MM:SS')}</Text>
      </View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>结束骑行时间：</Text>
        <Text>{moment(item.end_time).format('YYYY-MM-DD HH:MM:SS')}</Text>
      </View>
    </View>
  </View>
)
