import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ListRenderItemInfo, View, ViewStyle, } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { Button, Header, Screen, Text } from "../../components"
import { MixedExchangeRecord, MANAGER_USER, useStores, CUSTOMER_USER } from "../../models"
import { color, spacing } from "../../theme"
import moment from "moment"
import { RouteProp, useRoute } from "@react-navigation/native"
import { NO_DATA } from "../../global"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

export const ExchangeSetScreen: FC<StackScreenProps<NavigatorParamList, "exchangeSet">> = observer(function ExchangeSetScreen() {
  const { recordStore, userStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const version = recordStore.exchangeRecords

  const { params } = useRoute<RouteProp<NavigatorParamList, "exchangeSet">>()
  
  useEffect(() => {
    if (!recordStore.exchangeRecords.length) refresh()
  }, [])

  const refresh = useCallback(() => {
    (userStore.me.role === MANAGER_USER ?
      recordStore.listUserExchangeRecords(params?.customerId) :
      recordStore.listMyExchangeRecords(false)).then(() => setRefreshing(false))
  }, [params?.customerId])

  const next = useCallback(() => {
    if (userStore.me.role === CUSTOMER_USER)
      recordStore.listMyExchangeRecords(true)
  }, [])

  return (
    <Screen style={ROOT}>
      <Header headerText="兑换记录" hasBack onLeftPress={goBack} />
      <FlatList
        onEndReached={next}
        data={recordStore.exchangeRecords}
        renderItem={renderItem}
        keyExtractor={item => item.record.id.toString()}
        onRefresh={refresh}
        refreshing={refreshing}
        ListEmptyComponent={(
          <Text style={NO_DATA}>没有兑换记录</Text>
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

const renderItem = ({ item }: ListRenderItemInfo<MixedExchangeRecord>) => {
  const { userStore } = useStores()
  return (
    <View style={LINE}>
      <View style={INFO_LINE}>
        <View>
          <View style={INFO_LINE}>
            <Text preset='fieldLabel'>兑换商品：</Text>
            <Text>{item.souvenir.name}</Text>
          </View>
          <View style={INFO_LINE}>
            <Text preset='fieldLabel'>兑换数量：</Text>
            <Text>{item.record.amount}</Text>
          </View>
          <View style={INFO_LINE}>
            <Text preset='fieldLabel'>状态：</Text>
            <Text>{item.record.given ? '已领取' : '未领取'}</Text>
          </View>
          <View style={INFO_LINE}>
            <Text preset='fieldLabel'>兑换时间：</Text>
            <Text>{moment(item.record.time).format('YYYY-MM-DD HH:MM:SS')}</Text>
          </View>
        </View>
        {userStore.me.role === MANAGER_USER && !item.record.given && (
          <Button text='已给予用户' onPress={() => item.record.give()} />
        )}
      </View>
    </View>
  )
}
