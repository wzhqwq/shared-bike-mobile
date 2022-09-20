import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, Image, ImageStyle, ListRenderItemInfo, View, ViewStyle, } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { Header, Screen, Text } from "../../components"
import { Malfunction, MalfunctionRecord, RepairRecordModel, useStores } from "../../models"
import { color, spacing } from "../../theme"
import { RouteProp, useRoute } from "@react-navigation/native"
import { NO_DATA, INFO_LINE } from "../../global"
import moment from "moment"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

export const MalfunctionHandleScreen: FC<StackScreenProps<NavigatorParamList, "malfunctionHandle">> = observer(function MalfunctionHandleScreen() {
  const { recordStore, entityStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
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

  const handle = useCallback((conclusion: number) => {
    recordStore.repair(RepairRecordModel.create({
      conclusion,
      malfunction_id: params.malfunctionId,
      bike_id: params.bikeId,
      id: -1,
    }))
  }, [])

  return (
    <Screen style={ROOT}>
      <Header headerText="故障处理" hasBack onLeftPress={goBack} />
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
}

const renderItem = ({ item }: ListRenderItemInfo<MalfunctionRecord>) => (
  <View>
    <View style={INFO_LINE}>
      <Text preset='fieldLabel'>故障程度：</Text>
      <Text>{item.degree}</Text>
    </View>
    <View style={INFO_LINE}>
      <Text preset='fieldLabel'>上报时间：</Text>
      <Text>{moment(item.time).format("YYYY-MM-DD HH:MM:SS")}</Text>
    </View>
    <View style={INFO_LINE}>
      <Text preset='fieldLabel'>故障描述：</Text>
      <Text>{item.description}</Text>
    </View>
    {item.image_key && (<Image source={item.image_url} style={IMAGE} />)}
  </View>
)
