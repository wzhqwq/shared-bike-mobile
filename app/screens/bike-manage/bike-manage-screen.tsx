import React, { createContext, FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { Animated, FlatList, Keyboard, ListRenderItemInfo, TouchableHighlight, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { navigate, NavigatorParamList } from "../../navigators"
import { BikeMap, BottomModal, BottomPaper, Button, Text, TextField } from "../../components"
import { Bike, BIKE_AVAILABLE, BIKE_UNAVAILABLE, ParkingPoint, useStores } from "../../models"
import { color, spacing } from "../../theme"
import { MaterialIcons, Entypo } from "@expo/vector-icons"
import { LatLng, MapEvent, Marker, Region } from "react-native-maps"
import global, { LINE, NO_DATA } from "../../global"
import { Scanner } from "../../components/scanner/scanner"
import { Picker } from '@react-native-picker/picker'

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

const OperateBikeContext = createContext<(b: Bike) => void>(null)

export const BikeManageScreen: FC<StackScreenProps<NavigatorParamList, "bikeManage">> = observer(function BikeManageScreen() {
  const { userStore } = useStores()

  const [posNow, setPosNow] = useState<Region>(null)
  const [posDrag, setPosDrag] = useState<LatLng>(null)
  const [showDrag, setShowDrag] = useState(false)

  const [ppNow, setPPNow] = useState<ParkingPoint>(null)
  const [bikeNow, setBikeNow] = useState<Bike>(null)

  const [showPP, setShowPP] = useState(false)
  const [showAddBike, setShowAddBike] = useState(false)
  const [showOperateBike, setShowOperateBike] = useState(false)
  const [showListBike, setShowListBike] = useState(false)

  const [showScanner, setShowScanner] = useState(false)
  const [result, setResult] = useState('')
  const [isFinding, setIsFinding] = useState(false)

  const openPP = useCallback((pp: ParkingPoint) => {
    setPPNow(pp)
    setShowPP(true)
    pp.setSelected(true)
  }, [])

  const updatePP = useCallback((pp: ParkingPoint) => {
    if (!showPP) return
    setPPNow(pp)
    if (pp)
      pp.setSelected(true)
    else
    setShowPP(false)
  }, [showPP])

  const operateBike = useCallback((bike: Bike) => {
    bikeNow?.setSelected(false)
    bike.setSelected(true)
    setBikeNow(bike)
    setShowOperateBike(true)
  }, [bikeNow])
  
  const updateBike = useCallback((b: Bike) => {
    if (!showOperateBike) return
    setBikeNow(b)
    if (b)
      b.setSelected(true)
    else
      setShowOperateBike(false)
  }, [showOperateBike])

  const addBike = useCallback(() => {
    setPosDrag(posNow)
    setShowDrag(true)
    setShowAddBike(true)
  }, [posNow])

  useEffect(() => {
    if (result) {
      setBikeNow(null)
      setShowScanner(false)
      if (isFinding) {
        (async () => {
          if (userStore.me || await userStore.fetch()) await userStore.findBike(result)
        })()
      }
    }
  }, [result, isFinding])

  useEffect(() => {
    if (userStore.bikeNow) {
      setBikeNow(userStore.bikeNow)
      setShowOperateBike(true)
    }
  }, [userStore.bikeNow])

  useEffect(() => {
    if (showOperateBike && bikeNow?.status === BIKE_UNAVAILABLE) {
      setPosDrag(posNow)
      setShowDrag(true)
    }
  }, [bikeNow, showOperateBike])

  return (
    <View style={ROOT}>
      <BikeMap
        showBikes showParkingPoints showSections mode='maintainer'
        setPosNow={setPosNow}
        onParkingPress={openPP}
        onParkingUpdate={updatePP}
        onBikePress={operateBike}
        onBikeUpdate={updateBike}
        bottomButtons={(
          <>
            <Button text='查看维护中单车' onPress={() => setShowListBike(true)} />
            <Button onPress={() => {
              setShowScanner(true)
              setIsFinding(true)
              setResult('')
            }}>
              <MaterialIcons name='qr-code-scanner' size={24} color='white' />
            </Button>
            <Button text='注册新单车' onPress={addBike} />
          </>
        )}
      >
        {showDrag && (<DragBike pos={posDrag} setPos={setPosDrag} />)}
      </BikeMap>
      <PPModal show={showPP} onClose={() => setShowPP(false)} pp={ppNow} />
      <AddBikePaper
        show={showAddBike}
        onClose={() => {
          setShowAddBike(false)
          setShowDrag(false)
          setResult('')
        }}
        pos={posDrag}
        result={isFinding ? '' : result}
        openScanner={() => {
          setShowScanner(true)
          setIsFinding(false)
          setResult('')
        }}
      />
      <OperateBikeContext.Provider value={operateBike}>
        <BikeListPaper show={showListBike} onClose={() => setShowListBike(false)} covered={showOperateBike} />
      </OperateBikeContext.Provider>
      <OperateBikePaper
        show={showOperateBike}
        onClose={() => {
          setShowOperateBike(false)
          setShowDrag(false)
          bikeNow.setSelected(false)
        }}
        bike={bikeNow}
        pos={showDrag ? posDrag : null}
      />
      <Scanner
        show={showScanner}
        onCancel={() => setShowScanner(false)}
        onResult={value => {
          setShowScanner(false)
          setResult(value)
        }}
      />
    </View>
  )
})

const PAD: ViewStyle = {
  padding: spacing[4],
}

const BIKE_DRAG: ViewStyle = {
  padding: spacing[2],
  borderRadius: spacing[2],
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

const FORM_LINE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
}

const INFO_LINE: ViewStyle = {
  ...FORM_LINE,
  marginBottom: spacing[2],
}

const SCAN: ViewStyle = {
  marginLeft: spacing[2],
  marginTop: 20,
}

const INPUT: ViewStyle = {
  flex: 1,
}

const PPModal = ({ show, onClose, pp }: { show: boolean, onClose: () => void, pp: ParkingPoint }) => (
  <BottomModal onClose={() => {
    onClose()
    pp.setSelected(false)
  }} show={show} title='停车点'>
    {pp && (
      <>
        <View style={INFO_LINE}><Text preset='fieldLabel'>坐标：</Text><Text>{global.positionHuman(pp.coordinate)}</Text></View>
        <View style={INFO_LINE}><Text preset='fieldLabel'>最低停放单车数量：</Text><Text>{pp.minimum_count}</Text></View>
        <View style={INFO_LINE}><Text preset='fieldLabel'>停放单车数量：</Text><Text>{pp.bikes_count}</Text></View>
      </>
    )}
  </BottomModal>
)

const AddBikePaper = ({ show, onClose, pos, openScanner, result }: { show: boolean, onClose: () => void, pos: LatLng, openScanner: () => void, result: string }) => {
  const { entityStore } = useStores()
  const [loading, setLoading] = useState(false)

  const [seriesNo, setSeriesNo] = useState('')
  const [seriesId, setSeriesId] = useState(0)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!entityStore.seriesList.length) entityStore.listSeries()
  }, [])

  useEffect(() => {
    if (entityStore.seriesList.length) setSeriesId(entityStore.seriesList[0].id)
  }, [entityStore.seriesListVersion])
  
  useEffect(() => {
    if (show) {
      setSeriesNo(result)
      if (entityStore.seriesList.length) setSeriesId(entityStore.seriesList[0].id)
    }
    else {
      setFocused(false)
      Keyboard.dismiss()
    }
  }, [show, result])

  const submit = useCallback(() => {
    setLoading(true)
    entityStore.registerBike(seriesId, seriesNo, pos).then(success => {
      setLoading(false)
      if (success) onClose()
    })
  }, [seriesNo, seriesId, pos])

  return (
    <BottomPaper onClose={onClose} show={show} up={focused} title='注册单车' upHeight={280}>
      <View style={FORM_LINE}>
        <TextField label="单车序列号" onChangeText={t => setSeriesNo(t)} value={seriesNo} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={INPUT} />
        <Button style={SCAN} onPress={() => {
          openScanner()
          Keyboard.dismiss()
        }}>
          <MaterialIcons name='qr-code-scanner' size={28} color='white' />
        </Button>
      </View>
      <Picker selectedValue={seriesId} onValueChange={(v) => setSeriesId(v)}>
        {entityStore.seriesList.map(s => (
          <Picker.Item label={s.name} value={s.id} key={s.id} />
        ))}
      </Picker>
      <Button text='注册' onPress={submit} loading={loading} disabled={!seriesNo || !seriesId} />
    </BottomPaper>
  )
}

const GROUP: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-evenly',
}

const OperateBikePaper = observer(({ show, onClose, bike, pos }: { show: boolean, onClose: () => void, bike: Bike, pos: LatLng }) => {
  const { entityStore } = useStores()

  const maintain = useCallback(() => {
    bike.startMaintaining().then(() => {
      onClose()
      bike.setSelected(false)
    })
  }, [bike])

  const finish = useCallback(() => {
    bike.finishMaintaining(pos).then(() => {
      onClose()
      bike.setSelected(false)
    })
  }, [bike, pos])

  useEffect(() => {
    if (!entityStore.seriesList.length) entityStore.listSeries()
  }, [])

  return (
    <BottomPaper onClose={onClose} show={show} title={entityStore.seriesList.find(s => s.id === bike?.series_id)?.name ?? '单车'}>
      {bike && (
        <>
          <View style={INFO_LINE}><Text preset='fieldLabel'>坐标：</Text><Text>{global.positionHuman(pos ?? bike.coordinate)}</Text></View>
          <View style={INFO_LINE}><Text preset='fieldLabel'>序列号：</Text><Text>{bike.series_no}</Text></View>
          <View style={INFO_LINE}><Text preset='fieldLabel'>健康值：</Text><Text>{bike.health}</Text></View>
          <View style={INFO_LINE}><Text preset='fieldLabel'>总骑行里程：</Text><Text>{bike.mileage} 公里</Text></View>
          <View style={INFO_LINE}><Text preset='fieldLabel'>维修失败次数：</Text><Text>{bike.fail_count}</Text></View>
          <View style={GROUP}>
            {bike.status === BIKE_AVAILABLE && (
              <Button text='开始维护' onPress={maintain} />
            )}
            {bike.status === BIKE_UNAVAILABLE && (
              <Button text='完成维护并标记位置' onPress={finish} />
            )}
            <Button text='故障列表' onPress={() => navigate('bikeMalfunction', { bikeId: bike.id })} />
          </View>
        </>
      )}
    </BottomPaper>
  )
})

const LIST: ViewStyle = {
  height: 300,
  marginHorizontal: -spacing[4],
}

const BikeListPaper = observer(({ show, onClose, covered }: { show: boolean, onClose: () => void, covered: boolean }) => {
  const { entityStore } = useStores()

  const [refreshing, setRefreshing] = useState(false)
  const bikes = useMemo(() => entityStore.bikes.filter(b => b.status === BIKE_UNAVAILABLE), [entityStore.bikesVersion])

  const refresh = useCallback(() => {
    entityStore.listBikesInSection().then(() => setRefreshing(false))
  }, [])

  return (
    <BottomPaper onClose={onClose} show={show} title='单车列表' level={covered ? 1 : 0}>
      <FlatList
        data={bikes}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onRefresh={refresh}
        refreshing={refreshing}
        style={LIST}
        ListEmptyComponent={(
          <Text style={NO_DATA}>没有维护中的单车</Text>
        )}
      />
    </BottomPaper>
  )
})

const renderItem = ({ item }: ListRenderItemInfo<Bike>) => (
  <OperateBikeContext.Consumer>
    {
      show => (
        <TouchableHighlight activeOpacity={0.7} underlayColor='#FFF' onPress={() => show(item)}>
          <View style={LINE}>
            <View>
              <View style={INFO_LINE}>
                <Text preset='fieldLabel'>序列号：</Text>
                <Text>{item.series_no}</Text>
              </View>
              <View style={INFO_LINE}>
                <Text preset='fieldLabel'>健康值：</Text>
                <Text>{item.health}</Text>
              </View>
            </View>
            <Entypo name='chevron-small-right' size={24} />
          </View>
        </TouchableHighlight>
      )
    }
  </OperateBikeContext.Consumer>
)
