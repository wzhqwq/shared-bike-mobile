import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ActivityIndicator, StyleProp, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color, spacing } from "../../theme"
import { Bike, ParkingPoint, Section, useStores } from "../../models"
import MapView, { LatLng, Marker, Polygon, Region } from "react-native-maps"
// import * as Location from 'expo-location'
// import global from "../../global"
import { FontAwesome5, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import { Button } from "../button/button"
import { LinearGradient } from "expo-linear-gradient"

const CONTAINER: ViewStyle = {
  flex: 1,
  justifyContent: 'center'
}

const MAP: ViewStyle = {
  width: '100%',
  flex: 1,
}

// const ME: ViewStyle = {
//   width: 20,
//   height: 20,
//   borderRadius: 10,
//   backgroundColor: color.primary,
//   borderColor: 'white',
//   borderWidth: 3,
//   shadowColor: '#000',
//   shadowRadius: 2,
//   shadowOpacity: 0.3,
//   shadowOffset: { width: -0.5, height: 0.5 },
// }

export type BikeMapProps = {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  showBikes?: boolean
  showSections?: boolean
  showParkingPoints?: boolean
  mode: 'customer' | 'maintainer' | 'manager'
  children?: JSX.Element | JSX.Element[]
  setPosNow?: (p: Region) => void
  onParkingPress?: (pp: ParkingPoint) => void
  onSectionPress?: (section: Section) => void
  onBikePress?: (bike: Bike) => void
  onParkingUpdate?: (pp: ParkingPoint | undefined) => void
  onSectionUpdate?: (section: Section | undefined) => void
  onBikeUpdate?: (bike: Bike | undefined) => void
  bottomButtons?: JSX.Element | JSX.Element[]
}

const getDistance2 = (a: LatLng, b: LatLng) => (a.latitude - b.latitude) ** 2 + (a.longitude - b.longitude) ** 2

const RELOAD: ViewStyle = {
  position: 'absolute',
  top: 20,
  right: 20,
  backgroundColor: color.background,
  borderRadius: spacing[2],
  shadowColor: 'black',
  shadowOpacity: 0.2,
  shadowRadius: 2,
  shadowOffset: { width: 0, height: 0 },
}

const GROUP: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  padding: spacing[2],
  flexShrink: 0,
  position: 'absolute',
  width: '100%',
  left: 0,
  bottom: 0,
}

export const BikeMap = observer(function BikeMap(props: BikeMapProps) {
  const { entityStore } = useStores()
  const [region, setRegion] = useState<Region>({ latitude: 0, longitude: 0, latitudeDelta: 1, longitudeDelta: 1 })
  const [refreshing, setRefreshing] = useState(false)

  const refresh = useCallback(() => {
    setRefreshing(true);
    (async () => {
      switch (props.mode) {
        case 'customer':
          if (props.showBikes) {
            await entityStore.listBikesAround(region.longitude.toFixed(6), region.latitude.toFixed(6))
          }
          if (props.showParkingPoints) {
            await entityStore.listParkingPointsAround(region.longitude.toFixed(6), region.latitude.toFixed(6))
          }
          break
        case 'maintainer':
          if (props.showSections) {
            await entityStore.listManagingSections()
          }
          if (entityStore.sections.length && entityStore.sectionIdNow) {
            if (props.showBikes) {
              await entityStore.listBikesInSection()
            }
            if (props.showParkingPoints) {
              await entityStore.listParkingPointsInSection()
            }
          }
          break
        case 'manager':
          if (props.showSections) {
            await entityStore.listSections()
          }        
          if (props.showParkingPoints) {
            await entityStore.listParkingPoints()
          }
          break
      }
      setRefreshing(false)
    })()
  }, [region])

  useEffect(() => {
    setRefreshing(true);
    (async () => {
      switch (props.mode) {
        case 'customer':
          if (props.showBikes) {
            await entityStore.listBikesAround(region.longitude.toFixed(6), region.latitude.toFixed(6))
          }
          if (props.showParkingPoints) {
            await entityStore.listParkingPointsAround(region.longitude.toFixed(6), region.latitude.toFixed(6))
          }
          break
        case 'maintainer':
          if (entityStore.sections.length) {
            const newSectionId = entityStore.sections.map(s => ({
              id: s.id,
              distance2: getDistance2(s.center, region),
            }))
            .sort((a, b) => a.distance2 - b.distance2)[0].id

            if (newSectionId !== entityStore.sectionIdNow) {
              entityStore.setSectionIdNow(newSectionId)
              if (props.showBikes) {
                await entityStore.listBikesInSection()
              }
              if (props.showParkingPoints) {
                await entityStore.listParkingPointsInSection()
              }
            }
          }
          break
      }
      setRefreshing(false)
    })()
  }, [region, entityStore.sectionsVersion])

  useEffect(() => {
    refresh()
  }, [])

  return (
    <>
      <BikeMapView
        region={region}
        setRegion={setRegion}
        sectionId={entityStore.sectionIdNow}
        {...props}
      />
      <Button loading={refreshing} hideWhenLoading style={RELOAD} onPress={refresh}>
        <MaterialCommunityIcons name='reload' size={24} color={color.primaryDarker} />
      </Button>
      {props.bottomButtons && (
        <LinearGradient colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)']} style={GROUP}>
          {props.bottomButtons}
        </LinearGradient>
      )}
    </>
  )
})

type ViewProps = {
  region: Region
  setRegion: (r: Region | ((r: Region) => Region)) => void
  sectionId: number
} & BikeMapProps

const PIN: ViewStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
}

const BikeMapView: FC<ViewProps> = observer(({ style, showBikes, showSections, showParkingPoints, mode, region, setRegion, sectionId, onParkingPress, onSectionPress, onBikePress, onParkingUpdate, onSectionUpdate, onBikeUpdate, children, setPosNow }) => {
  const styles = Object.assign({}, CONTAINER, style)

  const { entityStore, userStore } = useStores()

  const [ready, setReady] = useState(false)
  const [pinOpen, setPinOpen] = useState(true)
  // const [myPos, setMyPos] = useState({ latitude: 0, longitude: 0 })
  const regionRef = useRef(region)
  const timer = useRef(0)
  const ppPressRef = useRef<(pp: ParkingPoint) => void>(null)
  const bikePressRef = useRef<(b: Bike) => void>(null)
  const sectionPressRef = useRef<(section: Section) => void>(null)

  const [selectedBikeId, setSelectedBikeId] = useState(0)
  const [selectedParkingId, setSelectedParkingId] = useState(0)
  const [selectedSectionId, setSelectedSectionId] = useState(0)

  useEffect(() => {
    (async () => {
      // const { status } = await Location.requestForegroundPermissionsAsync()
      // if (status !== 'granted') {
      //   global.toast.show('需要前台定位权限', { type: 'danger' })
      // }
      // const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest })
      // setMyPos(location.coords)
    })()
    setRegion({
      latitude: 37.448618,
      longitude: 118.522058,
      // latitude: location.coords.latitude,
      // longitude: location.coords.longitude,
      latitudeDelta: 0.002,
      longitudeDelta: 0.002,
    })
    setReady(true)
  }, [])

  const onRegionChange = useCallback(r => {
    if (!ready) return
    regionRef.current = r
    if (timer.current) {
      window.clearTimeout(timer.current)
    }
    else {
      setPinOpen(false)
    }
    timer.current = window.setTimeout(() => {
      setRegion(regionRef.current)
      setPinOpen(true)
      timer.current = 0
    }, 300)
  }, [ready])

  useEffect(() => {
    setPosNow?.(region)
  }, [region])

  const bikeMarkers = useMemo(() =>
    entityStore.bikes.map(b => (
      <BikeInMap bike={b} key={b.id} onPress={() => {
        setSelectedBikeId(b.id)
        if (bikePressRef.current) {
          bikePressRef.current(b)
          setRegion(r => ({ ...r, ...b.coordinate }))
        }
      }} />
    )),
  [entityStore.bikesVersion])

  const sectionPolygons = useMemo(() =>
    entityStore.sections.map(s => (
      <Polygon
        key={s.id}
        coordinates={s.coordinates}
        strokeColor={mode === 'maintainer' && s.id !== sectionId ? color.palette.lightGrey : color.primary }
        fillColor={mode === 'maintainer' && s.id !== sectionId ? '#9993' : color.primaryTransparent }
        onPress={() => {
          setSelectedSectionId(s.id)
          if (sectionPressRef.current) {
            sectionPressRef.current(s)
            setRegion(() => ({ ...s.center, ...s.delta }))
          }
        }}
      />
    ))
  , [entityStore.sectionsVersion, mode, sectionId])

  const parkingPointMarks = useMemo(() =>
    entityStore.parkingPoints.map(pp => (
      <PPInMap pp={pp} key={pp.id} onPress={() => {
        setSelectedParkingId(pp.id)
        if (ppPressRef.current) {
          ppPressRef.current(pp)
          setRegion(r => ({ ...r, ...pp.coordinate }))
        }
      }} />
    ))
  , [entityStore.parkingPointsVersion])

  useEffect(() => {
    if (selectedBikeId) onBikeUpdate?.(entityStore.bikes.find(({ id }) => id === selectedBikeId))
  }, [entityStore.bikesVersion])
  useEffect(() => {
    if (selectedSectionId) onSectionUpdate?.(entityStore.sections.find(({ id }) => id === selectedSectionId))
  }, [entityStore.sectionsVersion])
  useEffect(() => {
    if (selectedParkingId) onParkingUpdate?.(entityStore.parkingPoints.find(({ id }) => id === selectedParkingId))
  }, [entityStore.parkingPointsVersion])
  useEffect(() => {
    if (userStore.bikeNow) {
      setSelectedBikeId(userStore.bikeNow.id)
      onBikeUpdate?.(entityStore.bikes.find(({ id }) => id === userStore.bikeNow.id) ?? userStore.bikeNow)
    }
  }, [userStore.bikeNow])

  useEffect(() => {
    bikePressRef.current = onBikePress
  }, [onBikePress])
  useEffect(() => {
    ppPressRef.current = onParkingPress
  }, [onParkingPress])
  useEffect(() => {
    sectionPressRef.current = onSectionPress
  }, [onSectionPress])

  return (
    <View style={styles}>
      {ready ? (
        <MapView region={region} onRegionChange={onRegionChange} style={MAP}>
          {/* <Marker coordinate={myPos}>
            <View style={ME}></View>
          </Marker> */}
          {showSections && sectionPolygons}
          {showBikes && bikeMarkers}
          {showParkingPoints && parkingPointMarks}
          {children}
        </MapView>
      ) : (
        <ActivityIndicator color={color.primary} size='large' />
      )}
      {mode === 'customer' && (
        <View style={PIN}>
          <FontAwesome5 name='map-pin' color={pinOpen ? color.primaryDarker : '#888'} size={30} />
        </View>
      )}
    </View>
  )
})

const BikeInMap = observer(({ bike, onPress }: { bike: Bike, onPress?: (b: Bike) => void }) => {
  return (
    <Marker coordinate={{ latitude: parseFloat(bike.p_latitude), longitude: parseFloat(bike.p_longitude)}} onPress={() => onPress?.(bike)}>
      <MaterialIcons name='pedal-bike' size={20} color={bike.selected ? color.primary : 'black'} />
    </Marker>
  )
})

const PPInMap = observer(({ pp, onPress }: { pp: ParkingPoint, onPress?: (pp: ParkingPoint) => void }) => {
  return (
    <>
      <Marker coordinate={{ latitude: parseFloat(pp.p_latitude), longitude: parseFloat(pp.p_longitude)}} onPress={() => onPress?.(pp)}>
        <FontAwesome5 name='parking' size={20} color={pp.selected ? color.primary : (pp.lack_of_bike ? color.error : 'black')} />
      </Marker>
      <Polygon
        key={pp.id}
        coordinates={pp.coordinates}
        strokeColor={color.palette.lightGrey}
        lineDashPattern={[2, 2]}
        fillColor='#9993'
      />
    </>
  )
})
