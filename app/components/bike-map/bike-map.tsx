import * as React from "react"
import { ActivityIndicator, StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color, typography } from "../../theme"
import { Text } from "../text/text"
import { Bike, ParkingPoint, Section, useStores } from "../../models"
import MapView, { Marker } from "react-native-maps"
import * as Location from 'expo-location'
import global from "../../global"
import { MaterialIcons } from "@expo/vector-icons"

const CONTAINER: ViewStyle = {
  flex: 1,
  justifyContent: 'center'
}

const MAP: ViewStyle = {
  width: '100%',
  flex: 1,
}

const ME: ViewStyle = {
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: color.primary,
  borderColor: 'white',
  borderWidth: 3,
  shadowColor: '#000',
  shadowRadius: 2,
  shadowOpacity: 0.3,
  shadowOffset: { width: -0.5, height: 0.5 },
}

export interface BikeMapProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  showBikes: boolean,
  showSections: boolean,
  mode: 'findBike' | 'listBikes' | 'listSections'
}

/**
 * Describe your component here
 */
export const BikeMap = observer(function BikeMap(props: BikeMapProps) {
  const { style } = props
  const styles = Object.assign({}, CONTAINER, style)

  const { entityStore, userStore } = useStores()

  const [ready, setReady] = React.useState(false)
  const [region, setRegion] = React.useState({ latitude: 0, longitude: 0, latitudeDelta: 1, longitudeDelta: 1 })
  const [myPos, setMyPos] = React.useState({ latitude: 0, longitude: 0 })
  const [pinOpen, setPinOpen] = React.useState(true)
  const regionRef = React.useRef(region)
  const timer = React.useRef(0)

  React.useEffect(() => {
    (async () => {
      // const { status } = await Location.requestForegroundPermissionsAsync()
      // if (status !== 'granted') {
      //   global.toast.show('需要前台定位权限', { type: 'danger' })
      // }
      // const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest })
      // setMyPos(location.coords)
      setRegion({
        latitude: 37.448618,
        longitude: 118.522058,
        // latitude: location.coords.latitude,
        // longitude: location.coords.longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      })
      if (props.mode === 'findBike') setReady(true)
    })()
  }, [])

  React.useEffect(() => {
    if (ready) return
    switch (props.mode) {
      case 'findBike':
        break
      case 'listBikes':
        break
      case 'listSections':
        break
    }
  }, [props.mode, entityStore.sections, entityStore.sectionIdNow])

  const onRegionChange = React.useCallback(r => {
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
      if (props.mode === 'findBike') {
        entityStore.listBikesAround(regionRef.current.longitude.toFixed(6), regionRef.current.latitude.toFixed(6))
      }
    }, 300)
  }, [])

  const bikeMarkers = React.useMemo(() =>
    entityStore.bikes.map(b => (<BikeInMap bike={b} key={b.id} />)),
  [entityStore.bikes])

  return (
    <View style={styles}>
      {ready ? (
        <MapView region={region} onRegionChange={onRegionChange} style={MAP}>
          <Marker coordinate={myPos}>
            <View style={ME}></View>
          </Marker>
          {bikeMarkers}
        </MapView>
      ) : (
        <ActivityIndicator color={color.primary} size='large' />
      )}
    </View>
  )
})

const BikeInMap = observer(({ bike }: { bike: Bike }) => {
  return (
    <Marker coordinate={{ latitude: parseFloat(bike.p_latitude), longitude: parseFloat(bike.p_longitude)}}>
      <MaterialIcons name='pedal-bike' color={bike.selected ? color.primary : color.primaryLight} />
    </Marker>
  )
})