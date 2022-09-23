import React, { createContext, FC, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ListRenderItemInfo, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { BottomModal, Button, Header, Screen, Text, TextField } from "../../components"
import { color } from "../../theme"
import { Picker } from "@react-native-picker/picker"
import { MaterialIcons } from "@expo/vector-icons"
import moment from "moment"
import { NO_DATA, LINE, INFO_LINE } from "../../global"
import { useStores, BikeBill, BikeBillModel, BikeSeries } from "../../models"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

const Context = createContext<BikeSeries[]>([])

export const BillOfBikeScreen: FC<StackScreenProps<NavigatorParamList, "billOfBike">> = observer(function BillOfBikeScreen() {
  const { recordStore, entityStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  const [show, setShow] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const version = recordStore.bikeBillsVersion

  useEffect(() => {
    if (!recordStore.bikeBills.length) refresh()
  }, [])

  const refresh = useCallback(() => {
    recordStore.listBikeBills(false).then(() => setRefreshing(false))
  }, [])

  const next = useCallback(() => {
    recordStore.listBikeBills(true)
  }, [])

  const add = useCallback(() => {
    setShow(true)
  }, [])

  useEffect(() => {
    if (!entityStore.seriesList.length) entityStore.listSeries()
  }, [])

  return (
    <Context.Provider value={useMemo(() => entityStore.seriesList.slice(), [entityStore.seriesListVersion])}>
      <Screen style={ROOT}>
        <Header headerText="单车账单" hasBack rightIcon={<MaterialIcons name='add' size={24} />} onLeftPress={goBack} onRightPress={add} />
        <AddBikeBillModal show={show} onClose={() => setShow(false)} />
        <FlatList
          onEndReached={next}
          data={recordStore.bikeBills}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          onRefresh={refresh}
          refreshing={refreshing}
          ListEmptyComponent={(
            <Text style={NO_DATA}>没有单车购买记录</Text>
          )}
        />
      </Screen>
    </Context.Provider>
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
        <Context.Consumer>
          {seriesList => (
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
    </View>
  </View>
)

const AddBikeBillModal: FC<{ show: boolean, onClose: () => void }> = ({ show, onClose }) => {
  const { recordStore } = useStores()
  const [loading, setLoading] = useState(false)

  const [amount, setAmount] = useState('')
  const [expense, setExpense] = useState('')
  const [seriesId, setSeriesId] = useState(0)
  const [focused, setFocused] = useState(false)

  const seriesList = useContext(Context)

  useEffect(() => {
    if (seriesList.length) setSeriesId(seriesList[0].id)
  }, [seriesList.length])

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
        {seriesList.map(s => (
          <Picker.Item label={s.name} value={s.id} key={s.id} />
        ))}
      </Picker>
      <TextField label="购买数量" keyboardType='number-pad' onChangeText={t => setAmount(t)} value={amount} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} returnKeyType='done' />
      <TextField label="购买支出" keyboardType='numbers-and-punctuation' onChangeText={t => setExpense(t)} value={expense} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} returnKeyType='done' />
      <Button loading={loading} onPress={submit} text='记录' disabled={!ok} />
    </BottomModal>
  )
}