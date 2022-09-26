import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ListRenderItemInfo, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { Header, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from "../../theme"
import moment from "moment"
import { NO_DATA, LINE, INFO_LINE } from "../../global"
import { useStores, RideRecord } from "../../models"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

export const IncomeSetScreen: FC<StackScreenProps<NavigatorParamList, "incomeSet">> = observer(function IncomeSetScreen() {
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
      <FlatList
        onEndReached={next}
        data={recordStore.rideRecords}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onRefresh={refresh}
        refreshing={refreshing}
        ListEmptyComponent={(
          <Text style={NO_DATA}>没有骑行记录</Text>
        )}  
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
        <Text preset='fieldLabel'>结束骑行时间：</Text>
        <Text>{moment(item.end_time).format('YYYY-MM-DD HH:mm:ss')}</Text>
      </View>
    </View>
  </View>
)
