import React, { createContext, FC, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ListRenderItemInfo, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { BottomModal, Button, Header, Screen, Text, TextField } from "../../components"
import { color } from "../../theme"
import { Souvenir, SouvenirBill, SouvenirBillModel, useStores } from "../../models"
import { MaterialIcons } from "@expo/vector-icons"
import moment from "moment"
import { NO_DATA, LINE, INFO_LINE } from "../../global"
import { Picker } from "@react-native-picker/picker"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

const Context = createContext<Souvenir[]>([])

export const BillOfSouvenirScreen: FC<StackScreenProps<NavigatorParamList, "billOfSouvenir">> = observer(function BillOfSouvenirScreen() {
  const { recordStore, entityStore } = useStores()
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

  useEffect(() => {
    if (!entityStore.souvenirs.length) entityStore.listSouvenirs()
  }, [])
  
  return (
    <Context.Provider value={useMemo(() => entityStore.souvenirs.slice(), [entityStore.souvenirsVersion])}>
      <Screen style={ROOT}>
        <Header headerText="纪念品账单" hasBack rightIcon={<MaterialIcons name='add' size={24} />} onLeftPress={goBack} onRightPress={add} />
        <AddSouvenirBillModal show={show} onClose={() => setShow(false)} />
        <FlatList
          onEndReached={next}
          data={recordStore.souvenirBills}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          onRefresh={refresh}
          refreshing={refreshing}
          ListEmptyComponent={(
            <Text style={NO_DATA}>没有纪念品购买记录</Text>
          )}
        />
      </Screen>
    </Context.Provider>
  )
})

const renderItem = ({ item }: ListRenderItemInfo<SouvenirBill>) => (
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
          {souvenir => (
            <View style={INFO_LINE}>
              <Text preset='fieldLabel'>单车型号：</Text>
              <Text>{souvenir.find(series => series.id === item.souvenir_id)?.name}</Text>
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

const AddSouvenirBillModal: FC<{ show: boolean, onClose: () => void }> = ({ show, onClose }) => {
  const { recordStore } = useStores()
  const [loading, setLoading] = useState(false)

  const [amount, setAmount] = useState('')
  const [expense, setExpense] = useState('')
  const [souvenirId, setSouvenirId] = useState(0)
  const [focused, setFocused] = useState(false)

  const souvenirs = useContext(Context)

  useEffect(() => {
    if (show) {
      setAmount('')
      setExpense('')
      setSouvenirId(0)
    }
    else {
      setFocused(false)
    }
  }, [show])

  useEffect(() => {
    if (souvenirs.length) setSouvenirId(souvenirs[0].id)
  }, [souvenirs])
  
  const submit = useCallback(() => {
    setLoading(true)
    recordStore.purchaseSouvenir(SouvenirBillModel.create({
      amount: parseInt(amount),
      expense,
      souvenir_id: souvenirId,
    })).then(success => {
      setLoading(false)
      if (success) onClose()
    })
  }, [amount, expense, souvenirId])

  const ok = useMemo(() => {
    if (!amount || !expense || !souvenirId) return false
    if (!/^\d{1,8}\.\d{2}$/.test(expense)) return false
    if (parseInt(amount) <= 0) return false
    return true
  }, [amount, expense, souvenirId])

  return (
    <BottomModal onClose={onClose} show={show} title='记录购买纪念品' up={focused}>
      <Picker selectedValue={souvenirId} onValueChange={(v) => setSouvenirId(v)}>
        {souvenirs.map(s => (
          <Picker.Item label={s.name} value={s.id} key={s.id} />
        ))}
      </Picker>
      <TextField label="购买数量" keyboardType='number-pad' onChangeText={t => setAmount(t)} value={amount} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} returnKeyType='done' />
      <TextField label="购买支出" keyboardType='numbers-and-punctuation' onChangeText={t => setExpense(t)} value={expense} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} returnKeyType='done' />
      <Button loading={loading} onPress={submit} text='记录' disabled={!ok} />
    </BottomModal>
  )
}