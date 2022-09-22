import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { BottomModal, Button, Header, Screen, Text, TextField } from "../../components"
import { color, spacing } from "../../theme"
import MapView, { Marker } from "react-native-maps"
import { useRoute, RouteProp } from "@react-navigation/native"
import { Bike, useStores } from "../../models"
import { MaterialIcons } from "@expo/vector-icons"
import global, { INFO_LINE } from "../../global"
import { statusComponents } from "../bikes/bikes-screen"
import { SafeAreaView } from "react-native-safe-area-context"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

const CONTAINER: ViewStyle = {
  flex: 1,
}

const MAP: ViewStyle = {
  width: '100%',
  flex: 1,
}

const BLOCK: ViewStyle = {
  backgroundColor: color.palette.white,
  padding: spacing[3],
  borderRadius: spacing[2],
  width: 300,
  height: 200,
  position: 'absolute',
  bottom: 40,
  left: -150 + spacing[3],
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  justifyContent: 'space-between',
}

const DANGER: ViewStyle = {
  backgroundColor: color.error,
}

const BOTTOM: ViewStyle = {
  ...DANGER,
  margin: spacing[3],
}

export const BikeDetailScreen: FC<StackScreenProps<NavigatorParamList, "bikeDetail">> = observer(function BikeDetailScreen() {
  const [region, setRegion] = useState({ latitude: 0, longitude: 0, latitudeDelta: 0, longitudeDelta: 0 })
  const [bike, setBike] = useState<Bike>(null)
  const [show, setShow] = useState(false)

  const { params } = useRoute<RouteProp<NavigatorParamList, "bikeDetail">>()
  const { entityStore } = useStores()

  useEffect(() => {
    if (bike?.coordinate) {
      setRegion({ ...bike.coordinate, latitudeDelta: 0.01, longitudeDelta: 0.01 })
    }
  }, [bike])
  useEffect(() => {
    if (params.bikeId) {
      setBike(entityStore.bikes.find(b => b.id === params.bikeId))
    }
  }, [params.bikeId])

  return (
    <Screen style={ROOT}>
      <Header headerText="单车详情" hasBack onLeftPress={goBack} />
      {bike && (
        <View style={CONTAINER}>
          <MapView region={region} style={MAP}>
            <BikeInMap bike={bike} />
          </MapView>
          <SafeAreaView edges={['bottom']}>
            <Button style={BOTTOM} text='注销单车' onPress={() => setShow(true)} />
          </SafeAreaView>
        </View>
      )}
      <DestroyModal bike={bike} show={show} onClose={() => setShow(false)} />
    </Screen>
  )
})

const BikeInMap = observer(({ bike }: { bike: Bike }) => {
  const { entityStore } = useStores()

  useEffect(() => {
    if (!entityStore.seriesList.length) entityStore.listSeries()
  }, [])

  return (
    <Marker coordinate={bike.coordinate}>
      <View style={BLOCK}>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>序列号：</Text>
          <Text>{bike.series_no}</Text>
        </View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>型号：</Text>
          <Text>{entityStore.seriesList.find(s => s.id === bike.series_id)?.name ?? '加载中'}</Text>
        </View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>状态：</Text>
          <Text>{statusComponents[bike.status]}</Text>
        </View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>健康值：</Text>
          <Text>{bike.health}</Text>
        </View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>总行驶里程：</Text>
          <Text>{bike.mileage} 公里</Text>
        </View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>维修失败次数：</Text>
          <Text>{bike.fail_count}</Text>
        </View>
        <View style={INFO_LINE}>
          <Text preset='fieldLabel'>坐标：</Text>
          <Text>{global.positionHuman(bike.coordinate)}</Text>
        </View>
      </View>
      <MaterialIcons name='pedal-bike' size={28} color={color.primary} />
    </Marker>
  )
})

const DestroyModal: FC<{ show: boolean, bike: Bike, onClose: () => void }> = ({ show, bike, onClose }) => {
  const [loading, setLoading] = useState(false)

  const [reason, setReason] = useState('')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (show) {
      setReason('')
    }
    else {
      setFocused(false)
    }
  }, [show])

  const submit = useCallback(() => {
    setLoading(true)
    bike.destroy(reason).then(success => {
      setLoading(false)
      if (success) onClose()
    })
  }, [bike, reason])

  return (
    <BottomModal onClose={onClose} show={show} title='注销单车' up={focused}>
      <TextField label="注销原因" onChangeText={t => setReason(t)} value={reason} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} returnKeyType='done' />
      <Button style={DANGER} loading={loading} onPress={submit} text='确定注销' disabled={!reason} />
    </BottomModal>
  )
}