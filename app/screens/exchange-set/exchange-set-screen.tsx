import React, { createContext, FC, useCallback, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ListRenderItemInfo, View, ViewStyle, } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { Button, Header, Screen, Text } from "../../components"
import { ExchangeRecord, MANAGER_USER, useStores, Souvenir } from "../../models"
import { color, spacing } from "../../theme"
import moment from "moment"
import { RouteProp, useRoute } from "@react-navigation/native"
import { NO_DATA } from "../../global"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

const Context = createContext<{ souvenirs: Souvenir[], canGive: boolean }>({
  souvenirs: [],
  canGive: false,
})

export const ExchangeSetScreen: FC<StackScreenProps<NavigatorParamList, "exchangeSet">> = observer(function ExchangeSetScreen() {
  const { recordStore, userStore, entityStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const version = recordStore.exchangeRecordsVersion

  const { params } = useRoute<RouteProp<NavigatorParamList, "exchangeSet">>()
  
  useEffect(() => {
    if (!recordStore.exchangeRecords.length) refresh()
  }, [])

  const refresh = useCallback(() => {
    (userStore.me?.role === MANAGER_USER ?
      recordStore.listUserExchangeRecords(params?.customerId, false) :
      recordStore.listMyExchangeRecords(false)).then(() => setRefreshing(false))
  }, [params?.customerId])

  const next = useCallback(() => {
    userStore.me?.role === MANAGER_USER ?
      recordStore.listUserExchangeRecords(params?.customerId, true) :
      recordStore.listMyExchangeRecords(true)
  }, [])

  useEffect(() => {
    if (!entityStore.souvenirs.length) entityStore.listSouvenirs()
  }, [])
  
  return (
    <Context.Provider value={useMemo(() => ({
      souvenirs: entityStore.souvenirs.slice(),
      canGive: userStore.me?.role === MANAGER_USER,
    }), [entityStore.souvenirsVersion, userStore.me?.role])}>
      <Screen style={ROOT}>
        <Header headerText="兑换记录" hasBack onLeftPress={goBack} />
        <FlatList
          onEndReached={next}
          data={recordStore.exchangeRecords}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          onRefresh={refresh}
          refreshing={refreshing}
          ListEmptyComponent={(
            <Text style={NO_DATA}>没有兑换记录</Text>
          )}
        />
      </Screen>
    </Context.Provider>
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

const renderItem = ({ item }: ListRenderItemInfo<ExchangeRecord>) => (<Record item={item} />)

const Record: FC<{ item: ExchangeRecord }> = observer(({ item }) => (
  <View style={LINE}>
    <View>
      <Context.Consumer>
        {({ souvenirs }) => (
          <View style={INFO_LINE}>
            <Text preset='fieldLabel'>兑换商品名称：</Text>
            <Text>{souvenirs.find(series => series.id === item.souvenir_id)?.name}</Text>
          </View>
        )}
      </Context.Consumer>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>兑换数量：</Text>
        <Text>{item.amount}</Text>
      </View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>状态：</Text>
        <Text>{item.given ? '已领取' : '未领取'}</Text>
      </View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>兑换时间：</Text>
        <Text>{moment(item.time).format('YYYY-MM-DD HH:mm:ss')}</Text>
      </View>
    </View>
    <Context.Consumer>
      {({ canGive }) => canGive && !item.given && (
        <Button text='标记为已领取' onPress={() => item.give()} />
      )}
    </Context.Consumer>
  </View>
)
)