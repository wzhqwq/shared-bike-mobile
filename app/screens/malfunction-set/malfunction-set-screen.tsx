import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { RefreshControl, ScrollView, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { BottomModal, Button, Header, Screen, Text, TextField } from "../../components"
import { Malfunction, MalfunctionModel, useStores } from "../../models"
import { color, spacing } from "../../theme"
import { Feather, MaterialIcons } from "@expo/vector-icons"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `malfunctionSet: undefined` to NavigatorParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="malfunctionSet" component={MalfunctionSetScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore
export const MalfunctionSetScreen: FC<StackScreenProps<NavigatorParamList, "malfunctionSet">> = observer(function MalfunctionSetScreen() {
  const { entityStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  const [show, setShow] = useState(false)
  const [malfunctions, setMalfunctions] = useState<Malfunction>(null)
  
  useEffect(() => {
    if (!entityStore.malfunctions.length) entityStore.listMalfunctions()
  }, [])

  const refresh = useCallback(() => {
    entityStore.listMalfunctions().then(() => setRefreshing(false))
  }, [])

  const add = useCallback(() => {
    setMalfunctions(null)
    setShow(true)
  }, [])

  const modify = useCallback((malfunction: Malfunction) => {
    setMalfunctions(malfunction)
    setShow(true)
  }, [])

  return (
    <Screen style={ROOT}>
      <Header headerText="管理基本故障" hasBack rightIcon={<MaterialIcons name='add' size={24} />} onLeftPress={goBack} onRightPress={add} />
      <MalfunctionView malfunctionList={entityStore.malfunctions} refresh={refresh} refreshing={refreshing} onModify={modify} />
      <SetMalfunctionModal show={show} onClose={() => setShow(false)} malfunction={malfunctions} />
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


type MalfunctionProps = { malfunctionList: Malfunction[], refresh: () => void, refreshing: boolean, onModify: (s: Malfunction) => void }
const MalfunctionView: FC<MalfunctionProps> = observer(({ malfunctionList, refresh, refreshing, onModify }) => (
  <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
    {malfunctionList.map(s => (<OneMalfunction s={s} key={s.id} onModify={onModify} />))}
  </ScrollView>
))

const OneMalfunction: FC<{ s: Malfunction, onModify: (s: Malfunction) => void }> = observer(({ s, onModify }) => (
  <View style={LINE}>
    <View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>故障名称：</Text>
        <Text>{s.part_name}</Text>
      </View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>风险点数：</Text>
        <Text>{s.damage_degree}</Text>
      </View>
    </View>
    <Button onPress={() => onModify(s)}><Feather name='edit-2' color='white' size={18} /></Button>
  </View>
))

const SetMalfunctionModal: FC<{ show: boolean, malfunction: Malfunction, onClose: () => void }> = ({ show, malfunction, onClose }) => {
  const { entityStore } = useStores()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState('')
  const [degree, setDegree] = useState('')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (show) {
      setName(malfunction?.part_name ?? '')
      setDegree(malfunction?.damage_degree.toString() ?? '')
    }
    else {
      setFocused(false)
    }
  }, [show])

  const submit = useCallback(() => {
    setLoading(true)
    let p: Promise<boolean>
    if (malfunction) {
      p = malfunction.modifyPartName(name)
    }
    else {
      p = entityStore.addMalfunction(MalfunctionModel.create({ part_name: name, damage_degree: parseInt(degree), id: -1 }))
    }
    p.then(success => {
      setLoading(false)
      if (success) onClose()
    })
  }, [malfunction, name, degree])

  const ok = useMemo(() => {
    if (!name || !degree) return false
    if (parseInt(degree) <= 0 || parseInt(degree) > 50) return false
    return true
  }, [name, degree])

  return (
    <BottomModal onClose={onClose} show={show} title={malfunction ? '修改故障名称' : '创建基本故障'} up={focused}>
      <TextField label="故障名称" onChangeText={t => setName(t)} value={name} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      {
        !malfunction && (
          <TextField label="风险点数" keyboardType='number-pad' onChangeText={t => setDegree(t)} value={degree} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder='1~50的整数' />
        )
      }
      <Button loading={loading} onPress={submit} text={malfunction ? '修改' : '创建'} disabled={!ok} />
    </BottomModal>
  )
}