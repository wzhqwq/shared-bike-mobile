import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, Image, ImageStyle, ListRenderItemInfo, View, ViewStyle, } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { Button, Checkbox, Header, Screen, Text } from "../../components"
import { Malfunction, MalfunctionRecord, RepairRecordModel, useStores } from "../../models"
import { color, spacing } from "../../theme"
import { RouteProp, useRoute } from "@react-navigation/native"
import { NO_DATA, INFO_LINE, LINE } from "../../global"
import moment from "moment"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

const TOP: ViewStyle = {
  flexDirection: 'row',
  padding: spacing[2],
  alignItems: 'center',
  borderBottomColor: color.line,
  borderBottomWidth: 1,
}
const BUTTON_GROUP: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-evenly',
}
const LEFT: ViewStyle = {
  flex: 1,
  marginRight: spacing[2],
}

export const MalfunctionHandleScreen: FC<StackScreenProps<NavigatorParamList, "malfunctionHandle">> = observer(function MalfunctionHandleScreen() {
  const { recordStore, entityStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  const [conclusion, setConclusion] = useState(0)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const version = recordStore.malfunctionRecordsVersion

  const { params } = useRoute<RouteProp<NavigatorParamList, "malfunctionHandle">>()

  const [malfunction, setMalfunction] = useState<Malfunction>(null)
  
  useEffect(() => refresh(), [params.bikeId])

  useEffect(() => {
    if (!entityStore.malfunctions.length) entityStore.listMalfunctions()
  }, [])

  useEffect(() => {
    setMalfunction(entityStore.malfunctions.find(m => m.id === params.malfunctionId))
  }, [entityStore.malfunctionsVersion, params.malfunctionId])

  const refresh = useCallback(() => {
    recordStore.showMalfunctionRecords(params.bikeId, params.malfunctionId).then(() => setRefreshing(false))
  }, [params])

  const handle = useCallback(() => {
    recordStore.repair(RepairRecordModel.create({
      conclusion,
      malfunction_id: params.malfunctionId,
      bike_id: params.bikeId,
      id: -1,
    })).then(() => {
      goBack()
    })
  }, [conclusion, params])

  return (
    <Screen style={ROOT}>
      <Header headerText="故障处理" hasBack onLeftPress={goBack} />
      <View style={TOP}>
        <View style={LEFT}>
          <Text preset='header'>{malfunction?.part_name}</Text>
          <Text preset='fieldLabel'>选择处理结论</Text>
          <View style={BUTTON_GROUP}>
            <Checkbox value={conclusion === 2} text='已修复' onToggle={() => setConclusion(2)} />
            <Checkbox value={conclusion === 1} text='忽略故障' onToggle={() => setConclusion(1)} />
            <Checkbox value={conclusion === 0} text='修复失败' onToggle={() => setConclusion(0)} />
          </View>
        </View>
        <Button text='完成处理' onPress={handle} />
      </View>
      <FlatList
        data={recordStore.malfunctionRecords}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onRefresh={refresh}
        refreshing={refreshing}
        ListEmptyComponent={(
          <Text style={NO_DATA}>没有未解决的故障记录</Text>
        )}
      />
    </Screen>
  )
})

const IMAGE: ImageStyle = {
  resizeMode: 'contain',
  width: 400,
  height: 400,
  borderRadius: spacing[1],
  marginTop: spacing[2],
}

const degrees = [
  { name: '轻微', d: 1 },
  { name: '中度', d: 2 },
  { name: '重度', d: 3 },
  { name: '威胁安全', d: 10 },
]

const renderItem = ({ item }: ListRenderItemInfo<MalfunctionRecord>) => (
  <View style={LINE}>
    <View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>故障程度：</Text>
        <Text>{degrees.find(({ d }) => d === item.degree).name}</Text>
      </View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>上报时间：</Text>
        <Text>{moment(item.time).format("YYYY-MM-DD HH:MM:SS")}</Text>
      </View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>故障描述：</Text>
        <Text>{item.description || '无'}</Text>
      </View>
      {item.image_key && (<Image source={item.image_url} style={IMAGE} />)}
    </View>
  </View>
)
