import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ListRenderItemInfo, View, ViewStyle, } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { Header, Screen, Text } from "../../components"
import { DepositRecord, useStores } from "../../models"
import { color } from "../../theme"
import moment from "moment"
import { INFO_LINE, LINE, NO_DATA } from "../../global"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

export const DepositSetScreen: FC<StackScreenProps<NavigatorParamList, "depositSet">> = observer(function DepositSetScreen() {
  const { recordStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const version = recordStore.depositRecordsVersion

  useEffect(() => {
    if (!recordStore.depositRecords.length) refresh()
  }, [])

  const refresh = useCallback(() => {
    recordStore.listMyDepositRecords(false).then(() => setRefreshing(false))
  }, [])

  const next = useCallback(() => {
    recordStore.listMyDepositRecords(true)
  }, [])

  return (
    <Screen style={ROOT}>
      <Header headerText="押金记录" hasBack onLeftPress={goBack} />
      <FlatList
        onEndReached={next}
        data={recordStore.depositRecords}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onRefresh={refresh}
        refreshing={refreshing}
        ListEmptyComponent={(
          <Text style={NO_DATA}>没有押金变化记录</Text>
        )}
      />
    </Screen>
  )
})

const renderItem = ({ item }: ListRenderItemInfo<DepositRecord>) => (
  <View style={LINE}>
    <View style={INFO_LINE}>
      <View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>变化量：</Text>
          <Text>{item.change[0] !== '-' && '+'}{item.change} 元</Text>
        </View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>类型：</Text>
          <Text>{['充值', '骑行'][item.type]}</Text>
        </View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>时间：</Text>
          <Text>{moment(item.time).format('YYYY-MM-DD HH:MM:SS')}</Text>
        </View>
      </View>
    </View>
  </View>
)
