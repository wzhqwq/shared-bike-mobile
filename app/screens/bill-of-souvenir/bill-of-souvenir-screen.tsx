import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ListRenderItemInfo, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { BottomModal, Button, Header, Screen, Text, TextField } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from "../../theme"
import { BikeBill, BikeBillModel, useStores } from "../../models"
import { MaterialIcons } from "@expo/vector-icons"
import moment from "moment"
import { NO_DATA, LINE, INFO_LINE } from "../../global"
import { Picker } from "@react-native-picker/picker"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

export const BillOfSouvenirScreen: FC<StackScreenProps<NavigatorParamList, "billOfSouvenir">> = observer(function BillOfSouvenirScreen() {
  const { recordStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  const [show, setShow] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const version = recordStore.souvenirBillsVersion

  useEffect(() => {
    if (!recordStore.souvenirBills.length) refresh()
  }, [])

  const refresh = useCallback(() => {
    recordStore.listSouvenirBills(false).then(() => setRefreshing(false))
  }, [])

  const next = useCallback(() => {
    recordStore.listSouvenirBills(true)
  }, [])


  const add = useCallback(() => {
    setShow(true)
  }, [])

  return (
    <Screen style={ROOT}>
      <Header headerText="单车账单" hasBack rightIcon={<MaterialIcons name='add' size={24} />} onLeftPress={goBack} onRightPress={add} />
      <AddBikeBillModal show={show} onClose={() => setShow(false)} />
      <FlatList
        onEndReached={next}
        data={recordStore.souvenirBills}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onRefresh={refresh}
        refreshing={refreshing}
        ListEmptyComponent={(
          <Text style={NO_DATA}>没有单车购买记录</Text>
        )}
      />
    </Screen>
  )
})

const renderItem = ({ item }: ListRenderItemInfo<BikeBill>) => (
  <View style={LINE}>
    <View style={INFO_LINE}>
      <View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>购买量：</Text>
          <Text>{item.amount}</Text>
        </View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>支出：</Text>
          <Text>{item.expense} 元</Text>
        </View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>时间：</Text>
          <Text>{moment(item.time).format('YYYY-MM-DD HH:MM:SS')}</Text>
        </View>
      </View>
    </View>
  </View>
)

const AddBikeBillModal: FC<{ show: boolean, onClose: () => void }> = ({ show, onClose }) => {
  const { recordStore, entityStore } = useStores()
  const [loading, setLoading] = useState(false)

  const [amount, setAmount] = useState('')
  const [expense, setExpense] = useState('')
  const [seriesId, setSeriesId] = useState(0)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (show) {
      setAmount('')
      setExpense('')
      setSeriesId(0)
    }
    else {
      setFocused(false)
    }
  }, [show])

  useEffect(() => {
    if (!entityStore.seriesList.length) entityStore.listSeries()
  }, [])
  
  useEffect(() => {
    if (entityStore.seriesList.length) setSeriesId(entityStore.seriesList[0].id)
  }, [entityStore.seriesList])
  
  const submit = useCallback(() => {
    setLoading(true)
    recordStore.purchaseBike(BikeBillModel.create({
      amount: parseInt(amount),
      expense,
      series_id: seriesId,
    })).then(success => {
      setLoading(false)
      if (success) onClose()
    })
  }, [amount, expense, seriesId])

  const ok = useMemo(() => {
    if (!amount || !expense || !seriesId) return false
    if (!/^\d{1,8}\.\d{2}$/.test(expense)) return false
    if (parseInt(amount) <= 0) return false
    return true
  }, [amount, expense, seriesId])

  return (
    <BottomModal onClose={onClose} show={show} title='记录购买单车' up={focused}>
      <Picker selectedValue={seriesId} onValueChange={(v) => setSeriesId(v)}>
        {entityStore.seriesList.map(s => (
          <Picker.Item label={s.name} value={s.id} key={s.id} />
        ))}
      </Picker>
      <TextField label="风险点数" keyboardType='number-pad' onChangeText={t => setAmount(t)} value={amount} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder='1~50的整数' returnKeyType='done' />
      <TextField label="充值金额" keyboardType='numbers-and-punctuation' onChangeText={t => setAmount(t)} value={amount} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} returnKeyType='done' />
      <Button loading={loading} onPress={submit} text='记录' disabled={!ok} />
    </BottomModal>
  )
}