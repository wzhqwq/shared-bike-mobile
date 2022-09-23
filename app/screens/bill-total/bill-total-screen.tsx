import React, { createContext, FC, useCallback, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { ActivityIndicator, FlatList, ListRenderItemInfo, TouchableHighlight, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { Header, Screen, Text } from "../../components"
import { color, spacing } from "../../theme"
import { BikeBill, BikeSeries, ManagerBill, MASTER_BILL_FROM_BIKE, MASTER_BILL_FROM_OTHER, MASTER_BILL_FROM_RIDING, MASTER_BILL_FROM_SOUVENIR, OtherBill, RideRecord, Souvenir, SouvenirBill, useStores } from "../../models"
import moment from "moment"
import { NO_DATA, INFO_LINE } from "../../global"
import { Entypo } from "@expo/vector-icons"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

const Context = createContext<{ seriesList: BikeSeries[], souvenirs: Souvenir[] }>({ seriesList: [], souvenirs: [] })

export const BillTotalScreen: FC<StackScreenProps<NavigatorParamList, "billTotal">> = observer(function BillTotalScreen() {
  const { recordStore, entityStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const version = recordStore.masterBillsVersion

  useEffect(() => {
    if (!recordStore.masterBills.length) refresh()
  }, [])

  const refresh = useCallback(() => {
    recordStore.listMasterBills(false).then(() => setRefreshing(false))
  }, [])

  const next = useCallback(() => {
    recordStore.listMasterBills(true)
  }, [])

  useEffect(() => {
    if (!entityStore.seriesList.length) entityStore.listSeries()
    if (!entityStore.souvenirs.length) entityStore.listSouvenirs()
  }, [])

  return (
    <Context.Provider value={useMemo(
      () => ({ seriesList: entityStore.seriesList.slice(), souvenirs: entityStore.souvenirs.slice() }),
      [entityStore.seriesListVersion, entityStore.souvenirsVersion]
    )}>
      <Screen style={ROOT}>
        <Header headerText="总账本" hasBack onLeftPress={goBack} />
        <FlatList
          onEndReached={next}
          data={recordStore.masterBills}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          onRefresh={refresh}
          refreshing={refreshing}
          ListEmptyComponent={(
            <Text style={NO_DATA}>没有动账记录</Text>
          )}
        />
      </Screen>
    </Context.Provider>
  )
})

const renderItem = ({ item }: ListRenderItemInfo<ManagerBill>) => <Row item={item} />

const ROW_HEADER: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: 'space-between',
}

export const LINE: ViewStyle = {
  paddingVertical: spacing[4],
  paddingHorizontal: spacing[6],
  borderBottomColor: color.line,
  borderBottomWidth: 1,
}

const Row: FC<{ item: ManagerBill }> = observer(({ item }) => {
  const [open, setOpen] = useState(false)

  return (
    <TouchableHighlight activeOpacity={0.7} underlayColor='#FFF' onPress={() => {
      if (!open && !item.details) item.fetchDetails() 
      setOpen(!open)
    }}>
      <View style={LINE}>
        <View>
          <View style={ROW_HEADER}>
            <View>
              <View style={INFO_LINE}>
                <Text preset='fieldLabel'>变化量：</Text>
                <Text>{parseFloat(item.change) < 0 ? '' : '+'}{item.change} 元</Text>
              </View>
              <View style={INFO_LINE}>
                <Text preset='fieldLabel'>类型：</Text>
                <Text>{['学生骑车', '购买单车', '购买纪念品', '其他开支'][item.type]}</Text>
              </View>
              <View style={INFO_LINE}>
                <Text preset='fieldLabel'>时间：</Text>
                <Text>{moment(item.time).format('YYYY-MM-DD HH:mm:ss')}</Text>
              </View>
            </View>
            <Entypo name={open ? 'chevron-small-down' : 'chevron-small-right'} size={24} />
          </View>
          {open && (
            item.details ? (
              <>
                {item.type === MASTER_BILL_FROM_RIDING && <RideDetail item={item.details as RideRecord} />}
                {item.type === MASTER_BILL_FROM_BIKE && <BikePurchaseDetail item={item.details as BikeBill} />}
                {item.type === MASTER_BILL_FROM_SOUVENIR && <SouvenirPurchaseDetail item={item.details as SouvenirBill} />}
                {item.type === MASTER_BILL_FROM_OTHER && <OtherDetail item={item.details as OtherBill} />}
              </>
            ) : (
              <ActivityIndicator color={color.primary} />
            )
          )}
        </View>
      </View>
    </TouchableHighlight>
  )
})

const RideDetail: FC<{ item: RideRecord }> = observer(({ item }) => (
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
      <Text>{moment(item.start_time).format('YYYY-MM-DD HH:mm:ss')}</Text>
    </View>
    <View style={INFO_LINE}>
      <Text preset='fieldLabel'>结束骑行时间：</Text>
      <Text>{moment(item.end_time).format('YYYY-MM-DD HH:mm:ss')}</Text>
    </View>
  </View>
))

const BikePurchaseDetail: FC<{ item: BikeBill }> = observer(({ item }) => (
  <View>
    <View style={INFO_LINE}>
      <Text preset='fieldLabel'>购买量：</Text>
      <Text>{item.amount}</Text>
    </View>
    <Context.Consumer>
      {({ seriesList }) => (
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>单车型号：</Text>
          <Text>{seriesList.find(series => series.id === item.series_id)?.name}</Text>
        </View>
      )}
    </Context.Consumer>
    <View style={INFO_LINE}>
      <Text preset='fieldLabel'>时间：</Text>
      <Text>{moment(item.time).format('YYYY-MM-DD HH:mm:ss')}</Text>
    </View>
  </View>
))

const SouvenirPurchaseDetail: FC<{ item: SouvenirBill }> = observer(({ item }) => (
  <View>
    <View style={INFO_LINE}>
      <Text preset='fieldLabel'>购买量：</Text>
      <Text>{item.amount}</Text>
    </View>
    <Context.Consumer>
      {({ souvenirs }) => (
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>单车型号：</Text>
          <Text>{souvenirs.find(series => series.id === item.souvenir_id)?.name}</Text>
        </View>
      )}
    </Context.Consumer>
    <View style={INFO_LINE}>
      <Text preset='fieldLabel'>时间：</Text>
      <Text>{moment(item.time).format('YYYY-MM-DD HH:mm:ss')}</Text>
    </View>
  </View>
))

const OtherDetail: FC<{ item: OtherBill }> = observer(({ item }) => (
  <View>
    <View style={INFO_LINE}>
      <Text preset='fieldLabel'>原因：</Text>
      <Text>{item.reason}</Text>
    </View>
    <View style={INFO_LINE}>
      <Text preset='fieldLabel'>时间：</Text>
      <Text>{moment(item.time).format('YYYY-MM-DD HH:mm:ss')}</Text>
    </View>
  </View>
))
