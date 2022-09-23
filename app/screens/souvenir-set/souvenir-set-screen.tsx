import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { RefreshControl, ScrollView, View, ViewStyle, Image, ImageStyle, useWindowDimensions } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { BottomModal, Button, Header, Screen, Text, TextField } from "../../components"
import { Souvenir, SouvenirModel, useStores } from "../../models"
import { color, spacing } from "../../theme"
import { Feather, MaterialIcons } from "@expo/vector-icons"
import { PieChart } from "react-native-chart-kit"
import { PieSeries, spreadColors } from "../../global"
import { Upload } from "../../components/upload/upload"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

export const SouvenirSetScreen: FC<StackScreenProps<NavigatorParamList, "souvenirSet">> = observer(function SouvenirSetScreen() {
  const { entityStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  const [show, setShow] = useState(false)
  const [souvenirs, setSouvenirs] = useState<Souvenir>(null)
  const [pieData, setPieData] = useState<PieSeries[]>([])

  useEffect(() => {
    if (!entityStore.souvenirs.length) entityStore.listSouvenirs()
  }, [])

  useEffect(() => {
    if (entityStore.souvenirs.length) {
      setPieData(entityStore.souvenirs.map((s, i) => (
        { name: s.name, count: s.total_amount, color: spreadColors[i], legendFontColor: '#333', legendFontSize: 12 }
      )))
    }
  }, [entityStore.souvenirsVersion])

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
      <PieChart
        data={pieData}
        width={useWindowDimensions().width}
        height={200}
        accessor='count'
        backgroundColor={color.background}
        paddingLeft='10'
        chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
        absolute
      />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        {useMemo(
          () => entityStore.souvenirs.map(s => (
            <OneSouvenir s={s} key={s.id} onModify={modify} />
          )),
          [entityStore.souvenirsVersion]
        )}
      </ScrollView>
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
  width: 60,
  height: 60,
  borderRadius: spacing[2],
  marginRight: spacing[2],
}


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
      p = entityStore.addSouvenir(SouvenirModel.create({ name, price: parseInt(price), image_key: imageKey }))
    }
    p.then(success => {
      setLoading(false)
      if (success) onClose()
    })
  }, [souvenir, name, price, imageKey])

  const ok = useMemo(() => {
    if (!name || !price) return false
    if (parseInt(price) <= 0) return false
    return true
  }, [name, price])

  return (
    <BottomModal onClose={onClose} show={show} title={souvenir ? '修改纪念品' : '创建纪念品'} up={focused}>
      <TextField label="物品名称" onChangeText={t => setName(t)} value={name} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} returnKeyType='done' />
      <TextField label="兑换点数" keyboardType='number-pad' onChangeText={t => setPrice(t)} value={price} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} returnKeyType='done' />
      <Upload label='商品图片' imageKey={imageKey} onChange={key => setImageKey(key)} />
      <Button loading={loading} onPress={submit} text={souvenir ? '修改' : '创建'} disabled={!ok} />
    </BottomModal>
  )
}