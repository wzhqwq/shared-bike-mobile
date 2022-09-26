import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { Animated, TextStyle, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { navigate, NavigatorParamList } from "../../navigators"
import { BikeMap, BottomPaper, Button, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
import { Bike, useStores } from "../../models"
import { color, spacing } from "../../theme"
import { Scanner } from "../../components/scanner/scanner"
import { MaterialIcons } from "@expo/vector-icons"
import { LatLng, MapEvent, Marker } from "react-native-maps"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
  paddingTop: 0,
}

const WHITE: TextStyle = {
  color: 'white',
  marginLeft: spacing[2],
}

const STANDBY = 0
const RIDING = 1
const LOCKED = 2
const REPORTED = 3

export const RideScreen: FC<StackScreenProps<NavigatorParamList, "ride">> = observer(function RideScreen() {
  // Pull in one of our MST stores
  const { userStore, entityStore } = useStores()
  const [posDrag, setPosDrag] = useState<LatLng>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [bikeNow, setBikeNow] = useState<Bike>(undefined)
  const [showOperateBike, setShowOperateBike] = useState(false)

  const [cost, setCost] = useState('0.00')
  const [time, setTime] = useState('0:00')
  const [status, setStatus] = useState(STANDBY)
  const posRef = useRef(posDrag)
  const [recordId, setRecordId] = useState(0)

  const operateBike = useCallback((bike: Bike) => {
    bikeNow?.setSelected(false)
    bike.setSelected(true)
    setBikeNow(bike)
    setShowOperateBike(true)
  }, [bikeNow])
  
  const updateBike = useCallback((b: Bike) => {
    if (status === RIDING || !showOperateBike) return
    setBikeNow(b)
    if (b)
      b.setSelected(true)
    else
      setShowOperateBike(false)
  }, [status, showOperateBike])

  const searchBike = useCallback(value => {
    setShowScanner(false);
    (async () => {
      if (userStore.me || await userStore.fetch()) await userStore.findBike(value)
    })()
  }, [userStore.me])

  const scan = useCallback(() => {
    setShowScanner(true)
    userStore.setBikeNow(undefined)
    setBikeNow(undefined)
  }, [])

  const lock = useCallback(() => {
    bikeNow.lockBike().then(result => {
      if (!result) return
      setTime(result[0])
      setCost(result[1])
      setRecordId(parseInt(result[2]))
      setStatus(LOCKED)
      entityStore.listParkingPointsAround(bikeNow.coordinate)
      entityStore.listBikesAround(bikeNow.coordinate)
    })
  }, [bikeNow])

  const update = useCallback(() => {
    bikeNow.updateBike(posRef.current).then(result => {
      if (!result) return
      setTime(result[0])
      setCost(result[1])
    })
  }, [bikeNow])

  const ride = useCallback(() => {
    bikeNow.startCommunication()
    bikeNow.unlockBike(bikeNow.coordinate).then(success => {
      if (success) {
        setPosDrag(bikeNow.coordinate)
        posRef.current = bikeNow.coordinate
        setStatus(RIDING)
        entityStore.listParkingPointsAround(bikeNow.coordinate)
      }
    })
  }, [bikeNow])

  useEffect(() => {
    if (!entityStore.seriesList.length) entityStore.listSeries()
  }, [])

  useEffect(() => {
    if (status === RIDING) {
      posRef.current = posDrag
      bikeNow.dummy.setPosition(posRef.current)
    }
  }, [posDrag])

  useEffect(() => {
    if (userStore.bikeNow) {
      setBikeNow(userStore.bikeNow)
      operateBike(userStore.bikeNow)
    }
  }, [userStore.bikeNow])

  useEffect(() => {
    if (bikeNow && status === RIDING) {
      const t = window.setInterval(update, 1000)
      return () => {
        window.clearInterval(t)
      }
    }
    return null
  }, [status])

  useEffect(() => {
    if (userStore.pointsAcquired) {
      setStatus(REPORTED)
    }
  }, [userStore.pointsAcquired])

  return (
    <View style={ROOT}>
      <BikeMap
        showBikes={status !== RIDING}
        showParkingPoints
        showSections={false}
        mode='customer'
        onBikePress={operateBike}
        onBikeUpdate={updateBike}
        bottomButtons={(
          <Button onPress={scan}>
            <MaterialIcons name='qr-code-scanner' size={24} color='white' />
            <Text style={WHITE}>扫码骑车</Text>
          </Button>
        )}
      >
        {status === RIDING && (<DragBike pos={posDrag} setPos={setPosDrag} />)}
      </BikeMap>
      <BottomPaper
        hideClose={status === RIDING}
        onClose={() => {
          setShowOperateBike(false)
          bikeNow.setSelected(false)
          setStatus(STANDBY)
        }}
        show={showOperateBike}
        title={[
          entityStore.seriesList.find(s => s.id === bikeNow?.series_id)?.name ?? '单车',
          '骑行中',
          '骑行结束',
          '骑行结束',
        ][status]}
      >
        {bikeNow && (
          (status !== STANDBY) ? (
            <>
              <View style={INFO_GROUP}>
                <View style={INFO_GROUP_ITEM}>
                  <Text preset='fieldLabel' text='使用时长' />
                  <Text preset='header' text={time} />
                </View>
                <View style={INFO_GROUP_ITEM}>
                  <Text preset='fieldLabel' text='费用' />
                  <Text preset='header' text={cost} />
                </View>
              </View>
              {status === RIDING && (<Button text='关锁' onPress={lock} />)}
              {status === LOCKED && (<Button text='上报故障' onPress={() => navigate('reportMalfunction', { rideId: recordId })} />)}
              {status === REPORTED && (<Text>获得积分：{userStore.pointsAcquired}</Text>)}
            </>
          ) : (
            <>
              <View style={INFO_LINE}><Text preset='fieldLabel'>序列号：</Text><Text>{bikeNow.series_no}</Text></View>
              <View style={INFO_LINE}><Text preset='fieldLabel'>健康值：</Text><Text>{bikeNow.health}</Text></View>
              <View style={INFO_LINE}><Text preset='fieldLabel'>总骑行里程：</Text><Text>{bikeNow.mileage} 公里</Text></View>
              <View style={INFO_LINE}><Text preset='fieldLabel'>押金：</Text><Text>{entityStore.seriesList.find(s => s.id === bikeNow.series_id)?.rent ?? '？'} 元</Text></View>
              <Button text='开锁骑车' onPress={ride} />
            </>
          )
        )}
      </BottomPaper>
      <Scanner show={showScanner} onCancel={() => setShowScanner(false)} onResult={searchBike} />
    </View>
  )
})

const LINE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
}

const INFO_LINE: ViewStyle = {
  ...LINE,
  marginBottom: spacing[2],
}

const PAD: ViewStyle = {
  padding: spacing[4],
}

const BIKE_DRAG: ViewStyle = {
  padding: spacing[2],
  borderRadius: 20,
  backgroundColor: color.primary,
}

const DragBike = ({ pos, setPos }: { pos: LatLng, setPos: (p: LatLng) => void }) => {
  const slideAnim = useRef(new Animated.Value(1)).current

  const styles = [BIKE_DRAG, { transform: [{ scale: slideAnim }] }]

  const drag = useCallback(() => {
    Animated.timing(
      slideAnim,
      {
        toValue: 1.5,
        duration: 300,
        useNativeDriver: false,
      }
    ).start()
  }, [])
  const drop = useCallback((e: MapEvent) => {
    setPos(e.nativeEvent.coordinate)
    Animated.timing(
      slideAnim,
      {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }
    ).start()
  }, [])

  return (
    <Marker coordinate={pos} onDragStart={drag} onDragEnd={drop} draggable>
      <View style={PAD}>
        <Animated.View style={styles}>
          <MaterialIcons name='pedal-bike' color='white' size={16} />
        </Animated.View>
      </View>
    </Marker>
  )
}

const INFO_GROUP: ViewStyle = {
  alignItems: 'center',
  flexDirection: 'row',
  paddingVertical: spacing[3],
}

const INFO_GROUP_ITEM: ViewStyle = {
  alignItems: 'center',
  flexGrow: 1,
  marginHorizontal: spacing[1],
  borderRadius: spacing[1],
}
