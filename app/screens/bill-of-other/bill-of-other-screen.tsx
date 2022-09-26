import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ListRenderItemInfo, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { BottomModal, Button, Header, Screen, Text, TextField } from "../../components"
import { OtherBill, OtherBillModel, useStores } from "../../models"
import { color } from "../../theme"
import { MaterialIcons } from "@expo/vector-icons"
import moment from "moment"
import { NO_DATA, LINE, INFO_LINE } from "../../global"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

export const BillOfOtherScreen: FC<StackScreenProps<NavigatorParamList, "billOfOther">> = observer(function BillOfOtherScreen() {
  const { recordStore, entityStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  const [show, setShow] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const version = recordStore.otherBillsVersion

  useEffect(() => {
    if (!recordStore.otherBills.length) refresh()
  }, [])

  const refresh = useCallback(() => {
    recordStore.listOtherBills(false).then(() => setRefreshing(false))
  }, [])

  const next = useCallback(() => {
    recordStore.listOtherBills(true)
  }, [])

  const add = useCallback(() => {
    setShow(true)
  }, [])

  useEffect(() => {
    if (!entityStore.seriesList.length) entityStore.listSeries()
  }, [])

  return (
    <Screen style={ROOT}>
      <Header headerText="其他账单" hasBack rightIcon={<MaterialIcons name='add' size={24} />} onLeftPress={goBack} onRightPress={add} />
      <AddOtherBillModal show={show} onClose={() => setShow(false)} />
      <FlatList
        onEndReached={next}
        data={recordStore.otherBills}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onRefresh={refresh}
        refreshing={refreshing}
        ListEmptyComponent={(
          <Text style={NO_DATA}>没有其他开销记录</Text>
        )}
      />
    </Screen>
  )
})

const renderItem = ({ item }: ListRenderItemInfo<OtherBill>) => (
  <View style={LINE}>
    <View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>支出：</Text>
        <Text>{item.expense} 元</Text>
      </View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>开销原因：</Text>
        <Text>{item.reason}</Text>
      </View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>时间：</Text>
        <Text>{moment(item.time).format('YYYY-MM-DD HH:mm:ss')}</Text>
      </View>
    </View>
  </View>
)

const AddOtherBillModal: FC<{ show: boolean, onClose: () => void }> = ({ show, onClose }) => {
  const { recordStore } = useStores()
  const [loading, setLoading] = useState(false)

  const [reason, setReason] = useState('')
  const [expense, setExpense] = useState('')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (show) {
      setReason('')
      setExpense('')
    }
    else {
      setFocused(false)
    }
  }, [show])

  const submit = useCallback(() => {
    setLoading(true)
    recordStore.recordOtherBills(OtherBillModel.create({
      reason,
      expense,
    })).then(success => {
      setLoading(false)
      if (success) onClose()
    })
  }, [reason, expense])

  const ok = useMemo(() => {
    if (!reason || !expense) return false
    if (!/^\d{1,8}\.\d{2}$/.test(expense)) return false
    return true
  }, [reason, expense])

  return (
    <BottomModal onClose={onClose} show={show} title='记录购买其他' up={focused}>
      <TextField label="支出" keyboardType='numbers-and-punctuation' onChangeText={t => setExpense(t)} value={expense} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} returnKeyType='done' />
      <TextField label="开销原因" onChangeText={t => setReason(t)} value={reason} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} returnKeyType='done' />
      <Button loading={loading} onPress={submit} text='记录' disabled={!ok} />
    </BottomModal>
  )
}