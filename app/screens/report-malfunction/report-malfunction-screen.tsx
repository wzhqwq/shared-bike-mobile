import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { Button, Checkbox, Header, Screen, Text, TextField } from "../../components"
import { MalfunctionRecord, MalfunctionRecordModel, useStores } from "../../models"
import { color, spacing } from "../../theme"
import { Picker } from '@react-native-picker/picker'
import { RouteProp, useRoute } from "@react-navigation/native"
import global from "../../global"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

const CONTAINER: ViewStyle = {
  padding: spacing[4],
}

const BUTTON_GROUP: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-evenly',
}

const degrees = [
  { name: '轻微', d: 1 },
  { name: '中度', d: 2 },
  { name: '重度', d: 3 },
  { name: '威胁安全', d: 10 },
]

export const ReportMalfunctionScreen: FC<StackScreenProps<NavigatorParamList, "reportMalfunction">> = observer(function ReportMalfunctionScreen() {
  const { entityStore, userStore } = useStores()
  const [malfunctionId, setMalfunctionId] = useState(0)
  const [description, setDescription] = useState('')
  const [degreeIndex, setDegreeIndex] = useState(0)
  const [imageKey, setImageKey] = useState(null)
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<MalfunctionRecord[]>([])

  const { params } = useRoute<RouteProp<NavigatorParamList, "reportMalfunction">>()

  useEffect(() => {
    if (!entityStore.malfunctions.length) entityStore.listMalfunctions()
  }, [])

  useEffect(() => {
    if (entityStore.malfunctions.length) setMalfunctionId(entityStore.malfunctions[0]?.id)
  }, [entityStore.malfunctions.length])

  const append = useCallback(() => {
    setRecords(r => [
      ...r,
      MalfunctionRecordModel.create({
        degree: degrees[degreeIndex].d,
        description,
        id: -1,
        ride_id: params.rideId,
        image_key: imageKey,
        malfunction_id: malfunctionId
      })
    ])
    setDegreeIndex(0)
    setDescription('')
    setImageKey(null)
    setMalfunctionId(1)
  }, [degreeIndex, description, imageKey, malfunctionId, params.rideId])

  const submit = useCallback(() => {
    setLoading(true)
    userStore.report(records).then(success => {
      setLoading(false)
      if (success) {
        global.toast.show('故障已提交', { type: 'success' })
        goBack()
      }
    })
  }, [records])

  return (
    <Screen style={ROOT}>
      <Header headerText="报告故障" hasBack onLeftPress={goBack} />
      <View style={CONTAINER}>
        <Text preset='header'>您遇到了什么问题？</Text>
        <Picker selectedValue={malfunctionId} onValueChange={(v) => setMalfunctionId(v)}>
          {entityStore.malfunctions.map(s => (
            <Picker.Item label={s.part_name} value={s.id} key={s.id} />
          ))}
        </Picker>
        <View style={BUTTON_GROUP}>
          {degrees.map(({ name }, i) => (
            <Checkbox key={i} value={i === degreeIndex} text={name} onToggle={() => setDegreeIndex(i)} />
          ))}
        </View>
        <TextField label="问题描述" onChangeText={t => setDescription(t)} value={description} returnKeyType='done' />
        <View style={BUTTON_GROUP}>
          <Button onPress={append} text='将故障加入报告' disabled={!malfunctionId} />
          <Button onPress={submit} text={`提交报告（${records.length}份）`} disabled={!records.length} loading={loading} />
        </View>
      </View>
    </Screen>
  )
})
