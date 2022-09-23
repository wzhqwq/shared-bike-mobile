import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ListRenderItemInfo, View, ViewStyle } from "react-native"
import { goBack, NavigatorParamList } from "../../navigators"
import { Header, Screen, Text } from "../../components"
import { color, spacing } from "../../theme"
import { RepairRecord, useStores } from "../../models"
import moment from "moment"
import { NO_DATA } from "../../global"
import { StackScreenProps } from "@react-navigation/stack"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

export const RepairSetScreen: FC<StackScreenProps<NavigatorParamList, "repairSet">> = observer(function RepairSetScreen() {
  const { recordStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const version = recordStore.repairRecordsVersion

  useEffect(() => {
    if (!recordStore.repairRecords.length) refresh()
  }, [])

  const refresh = useCallback(() => {
    recordStore.listMyRepairRecords(false).then(() => setRefreshing(false))
  }, [])

  const next = useCallback(() => {
    recordStore.listMyRepairRecords(true)
  }, [])

  return (
    <Screen style={ROOT}>
      <Header headerText="积分记录" hasBack onLeftPress={goBack} />
      <FlatList
        onEndReached={next}
        data={recordStore.repairRecords}
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

const renderItem = ({ item }: ListRenderItemInfo<RepairRecord>) => (
  <View style={LINE}>
    <View style={INFO_LINE}>
      <View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>维修结论：</Text>
          <Text>{['维修失败', '忽略故障', '维修成功'][item.conclusion]}</Text>
        </View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>处理时间：</Text>
          <Text>{moment(item.time).format('YYYY-MM-DD HH:mm:ss')}</Text>
        </View>
      </View>
    </View>
  </View>
)
