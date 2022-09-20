import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ListRenderItemInfo, View, ViewStyle, } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { Header, Screen, Text } from "../../components"
import { PointRecord, useStores } from "../../models"
import { color, spacing } from "../../theme"
import moment from "moment"
import { NO_DATA } from "../../global"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

export const PointSetScreen: FC<StackScreenProps<NavigatorParamList, "pointSet">> = observer(function PointSetScreen() {
  const { recordStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const version = recordStore.pointRecordsVersion

  useEffect(() => {
    if (!recordStore.pointRecords.length) refresh()
  }, [])

  const refresh = useCallback(() => {
    recordStore.listMyPointRecords(false).then(() => setRefreshing(false))
  }, [])

  const next = useCallback(() => {
    recordStore.listMyPointRecords(true)
  }, [])

  return (
    <Screen style={ROOT}>
      <Header headerText="积分记录" hasBack onLeftPress={goBack} />
      <FlatList
        onEndReached={next}
        data={recordStore.pointRecords}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onRefresh={refresh}
        refreshing={refreshing}
        ListEmptyComponent={(
          <Text style={NO_DATA}>没有积分变化记录</Text>
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

const renderItem = ({ item }: ListRenderItemInfo<PointRecord>) => (
  <View style={LINE}>
    <View style={INFO_LINE}>
      <View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>变化量：</Text>
          <Text>{item.change > 0 && '+'}{item.change}</Text>
        </View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>类型：</Text>
          <Text>{['上报故障奖励', '兑换商品', '违规惩罚'][item.type]}</Text>
        </View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>时间：</Text>
          <Text>{moment(item.time).format('YYYY-MM-DD HH:MM:SS')}</Text>
        </View>
      </View>
    </View>
  </View>
)
