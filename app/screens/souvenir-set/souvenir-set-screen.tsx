import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { RefreshControl, ScrollView, View, ViewStyle, Image, ImageStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { BottomModal, Button, Header, Screen, Text, TextField } from "../../components"
import { Souvenir, SouvenirModel, useStores } from "../../models"
import { color, spacing } from "../../theme"
import { Feather, MaterialIcons } from "@expo/vector-icons"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

export const SouvenirSetScreen: FC<StackScreenProps<NavigatorParamList, "souvenirSet">> = observer(function SouvenirSetScreen() {
  const { entityStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  const [show, setShow] = useState(false)
  const [souvenirs, setSouvenirs] = useState<Souvenir>(null)
  
  useEffect(() => {
    if (!entityStore.souvenirs.length) entityStore.listSouvenirs()
  }, [])

  const refresh = useCallback(() => {
    entityStore.listSouvenirs().then(() => setRefreshing(false))
  }, [])

  const add = useCallback(() => {
    setSouvenirs(null)
    setShow(true)
  }, [])

  const modify = useCallback((souvenir: Souvenir) => {
    setSouvenirs(souvenir)
    setShow(true)
  }, [])

  return (
    <Screen style={ROOT}>
      <Header headerText="管理纪念品" hasBack rightIcon={<MaterialIcons name='add' size={24} />} onLeftPress={goBack} onRightPress={add} />
      <SouvenirView souvenirList={entityStore.souvenirs} refresh={refresh} refreshing={refreshing} onModify={modify} />
      <SetSouvenirModal show={show} onClose={() => setShow(false)} souvenir={souvenirs} />
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

const IMAGE: ImageStyle = {
  resizeMode: 'contain',
  width: 30,
  height: 30,
  borderRadius: 15,
  marginRight: spacing[2],
}


type SouvenirProps = { souvenirList: Souvenir[], refresh: () => void, refreshing: boolean, onModify: (s: Souvenir) => void }
const SouvenirView: FC<SouvenirProps> = observer(({ souvenirList, refresh, refreshing, onModify }) => (
  <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
    {souvenirList.map(s => (<OneSouvenir s={s} key={s.id} onModify={onModify} />))}
  </ScrollView>
))

const OneSouvenir: FC<{ s: Souvenir, onModify: (s: Souvenir) => void }> = observer(({ s, onModify }) => (
  <View style={LINE}>
    <View style={INFO_LINE}>
      <Image source={s.image_url} style={IMAGE} />
      <View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>物品名称：</Text>
          <Text>{s.name}</Text>
        </View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>兑换点数：</Text>
          <Text>{s.price}</Text>
        </View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>库存：</Text>
          <Text>{s.total_amount}</Text>
        </View>
      </View>
    </View>
    <Button onPress={() => onModify(s)}><Feather name='edit-2' color='white' size={18} /></Button>
  </View>
))

const SetSouvenirModal: FC<{ show: boolean, souvenir: Souvenir, onClose: () => void }> = ({ show, souvenir, onClose }) => {
  const { entityStore } = useStores()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState('')
  const [imageKey, setImageKey] = useState(null)
  const [price, setPrice] = useState('')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (show) {
      setName(souvenir?.name ?? '')
      setPrice(souvenir?.price.toString() ?? '')
      setImageKey(souvenir?.image_key ?? null)
    }
    else {
      setFocused(false)
    }
  }, [show])

  const submit = useCallback(() => {
    setLoading(true)
    let p: Promise<boolean>
    if (souvenir) {
      p = souvenir.modify(name, parseInt(price), imageKey)
    }
    else {
      p = entityStore.addSouvenir(SouvenirModel.create({ name, price: parseInt(price), image_key: imageKey, id: -1 }))
    }
    p.then(success => {
      setLoading(false)
      if (success) onClose()
    })
  }, [souvenir, name, price])

  const ok = useMemo(() => {
    if (!name || !price) return false
    if (parseInt(price) <= 0) return false
    return true
  }, [name, price])

  return (
    <BottomModal onClose={onClose} show={show} title={souvenir ? '修改故障名称' : '创建基本故障'} up={focused}>
      <TextField label="物品名称" onChangeText={t => setName(t)} value={name} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} returnKeyType='done' />
      <TextField label="兑换点数" keyboardType='number-pad' onChangeText={t => setPrice(t)} value={price} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder='1~50的整数' returnKeyType='done' />
      <Button loading={loading} onPress={submit} text={souvenir ? '修改' : '创建'} disabled={!ok} />
    </BottomModal>
  )
}