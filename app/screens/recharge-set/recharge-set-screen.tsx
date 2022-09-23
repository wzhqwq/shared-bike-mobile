import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ListRenderItemInfo, View, ViewStyle, } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { BottomModal, Button, Header, Screen, Text, TextField } from "../../components"
import { RechargeRecord, RechargeRecordModel, useStores } from "../../models"
import { color } from "../../theme"
import { MaterialIcons } from "@expo/vector-icons"
import moment from "moment"
import { INFO_LINE, LINE, NO_DATA } from "../../global"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

export const RechargeSetScreen: FC<StackScreenProps<NavigatorParamList, "rechargeSet">> = observer(function RechargeSetScreen() {
  const { recordStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  const [show, setShow] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const version = recordStore.depositRecordsVersion

  useEffect(() => {
    if (!recordStore.rechargeRecords.length) refresh()
  }, [])

  const refresh = useCallback(() => {
    recordStore.listMyRechargeRecords(false).then(() => setRefreshing(false))
  }, [])

  const next = useCallback(() => {
    recordStore.listMyRechargeRecords(true)
  }, [])

  const add = useCallback(() => {
    setShow(true)
  }, [])

  return (
    <Screen style={ROOT}>
      <Header headerText="充值记录" hasBack rightIcon={<MaterialIcons name='add' size={24} />} onLeftPress={goBack} onRightPress={add} />
      <FlatList
        onEndReached={next}
        data={recordStore.rechargeRecords}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onRefresh={refresh}
        refreshing={refreshing}
        ListEmptyComponent={(
          <Text style={NO_DATA}>没有充值记录</Text>
        )}  
      />
      <AddRechargeRecordModal show={show} onClose={() => setShow(false)} />
    </Screen>
  )
})

const renderItem = ({ item }: ListRenderItemInfo<RechargeRecord>) => (
  <View style={LINE}>
    <View style={INFO_LINE}>
      <View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>充值金额：</Text>
          <Text>{(item.amount)} 元</Text>
        </View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>充值时间：</Text>
          <Text>{moment(item.time).format('YYYY-MM-DD HH:mm:ss')}</Text>
        </View>
      </View>
    </View>
  </View>
)

const AddRechargeRecordModal: FC<{ show: boolean, onClose: () => void }> = ({ show, onClose }) => {
  const { recordStore } = useStores()
  const [loading, setLoading] = useState(false)

  const [amount, setAmount] = useState('')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (show) {
      setAmount('')
    }
    else {
      setFocused(false)
    }
  }, [show])

  const submit = useCallback(() => {
    setLoading(true)
    recordStore.recharge(RechargeRecordModel.create({ amount, id: -1 })).then(success => {
      setLoading(false)
      if (success) onClose()
    })
  }, [amount])

  const ok = useMemo(() => {
    if (!amount) return false
    if (!/^\d{1,8}\.\d{2}$/.test(amount)) return false
    return true
  }, [amount])

  return (
    <BottomModal onClose={onClose} show={show} title='充值' up={focused}>
      <TextField label="充值金额" keyboardType='numbers-and-punctuation' onChangeText={t => setAmount(t)} value={amount} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} returnKeyType='done' />
      <Button loading={loading} onPress={submit} text='充值' disabled={!ok} />
    </BottomModal>
  )
}