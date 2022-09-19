import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { Animated, Keyboard, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { BikeMap, BottomModal, BottomPaper, Button, Text, TextField } from "../../components"
import { color, spacing } from "../../theme"
import { LatLng, MapEvent, Marker, Polygon } from "react-native-maps"
import { MaterialIcons } from "@expo/vector-icons"
import global from "../../global"
import { useStores, ParkingPointModel, SectionModel, ParkingPoint, Section } from "../../models"
import { NavigationProp, useNavigation } from "@react-navigation/native"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

export const GeoEditScreen: FC<StackScreenProps<NavigatorParamList, "geoEdit">> = observer(function GeoEditScreen() {
  const [posNow, setPosNow] = useState<LatLng>(null)
  const [posDrag1, setPosDrag1] = useState<LatLng>(null)
  const [posDrag2, setPosDrag2] = useState<LatLng>(null)
  const [showAddPP, setShowAddPP] = useState(false)
  const [showAddSection, setShowAddSection] = useState(false)
  const [showOperatePP, setShowOperatePP] = useState(false)
  const [showOperateSection, setShowOperateSection] = useState(false)
  const [ppNow, setPPNow] = useState(null)
  const [sectionNow, setSectionNow] = useState(null)

  const addPP = useCallback(() => {
    setPosDrag1(posNow)
    setShowAddPP(true)
  }, [posNow])

  const addSection = useCallback(() => {
    setPosDrag1({ longitude: posNow.longitude + 0.001, latitude: posNow.latitude + 0.001 })
    setPosDrag2({ longitude: posNow.longitude - 0.001, latitude: posNow.latitude - 0.001 })
    setShowAddSection(true)
  }, [posNow])

  const operatePP = useCallback((pp: ParkingPoint) => {
    setPPNow(pp)
    setShowOperatePP(true)
  }, [posNow])

  const operateSection = useCallback((section: Section) => {
    setSectionNow(section)
    setShowOperateSection(true)
  }, [posNow])

  return (
    <View style={ROOT}>
      <BikeMap mode='manager' showParkingPoints showSections setPosNow={setPosNow} onParkingPress={operatePP} onSectionPress={operateSection} bottomButtons={(
        <>
          <Button text='添加停车点' onPress={addPP} />
          <Button text='添加管理区' onPress={addSection} />
        </>
      )}>
        {showAddPP && (<DragPP pos={posDrag1} setPos={setPosDrag1} />)}
        {showAddSection && (<DragSection pos1={posDrag1} pos2={posDrag2} setPos1={setPosDrag1} setPos2={setPosDrag2} />)}
      </BikeMap>
      <AddPPPaper show={showAddPP} onClose={() => setShowAddPP(false)} pos={posDrag1} />
      <AddSectionPaper show={showAddSection} onClose={() => setShowAddSection(false)} pos1={posDrag1} pos2={posDrag2} />
      <OperatePPModal show={showOperatePP} onClose={() => setShowOperatePP(false)} pp={ppNow} />
      <OperateSectionModal show={showOperateSection} onClose={() => setShowOperateSection(false)} section={sectionNow} />
    </View>
  )
})

const PAD: ViewStyle = {
  padding: spacing[4],
}

const PP_DRAG: ViewStyle = {
  padding: spacing[2],
  borderRadius: spacing[2],
  backgroundColor: color.primary,
}

const DragPP = ({ pos, setPos }: { pos: LatLng, setPos: (p: LatLng) => void }) => {
  const slideAnim = useRef(new Animated.Value(1)).current

  const styles = [PP_DRAG, { transform: [{ scale: slideAnim }] }]

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
          <MaterialIcons name='local-parking' color='white' size={16} />
        </Animated.View>
      </View>
    </Marker>
  )
}

const SECTION_DRAG: ViewStyle = {
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: color.primaryDarker,
}

const DragSection = ({ pos1, pos2, setPos1, setPos2 }: { pos1: LatLng, pos2: LatLng, setPos1: (p: LatLng) => void, setPos2: (p: LatLng) => void }) => {
  const slideAnim1 = useRef(new Animated.Value(1)).current
  const slideAnim2 = useRef(new Animated.Value(1)).current

  const styles1 = [SECTION_DRAG, { transform: [{ scale: slideAnim1 }] }]
  const styles2 = [SECTION_DRAG, { transform: [{ scale: slideAnim2 }] }]

  const drag1 = useCallback(() => {
    Animated.timing(
      slideAnim1,
      {
        toValue: 1.5,
        duration: 300,
        useNativeDriver: false,
      }
    ).start()
  }, [])
  const drop1 = useCallback((e: MapEvent) => {
    setPos1(e.nativeEvent.coordinate)
    Animated.timing(
      slideAnim1,
      {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }
    ).start()
  }, [])

  const drag2 = useCallback(() => {
    Animated.timing(
      slideAnim2,
      {
        toValue: 1.5,
        duration: 300,
        useNativeDriver: false,
      }
    ).start()
  }, [])
  const drop2 = useCallback((e: MapEvent) => {
    setPos2(e.nativeEvent.coordinate)
    Animated.timing(
      slideAnim2,
      {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }
    ).start()
  }, [])

  return (
    <>
      <Marker coordinate={pos1} onDragStart={drag1} onDragEnd={drop1} draggable>
        <View style={PAD}><Animated.View style={styles1} /></View>
      </Marker>
      <Polygon coordinates={[
        { latitude: pos1.latitude, longitude: pos1.longitude },
        { latitude: pos2.latitude, longitude: pos1.longitude },
        { latitude: pos2.latitude, longitude: pos2.longitude },
        { latitude: pos1.latitude, longitude: pos2.longitude },
      ]} strokeColor={color.primary} fillColor={color.primaryTransparent} />
      <Marker coordinate={pos2} onDragStart={drag2} onDragEnd={drop2} draggable>
        <View style={PAD}><Animated.View style={styles2} /></View>
      </Marker>
    </>
  )
}

const AddPPPaper = ({ show, onClose, pos }: { show: boolean, onClose: () => void, pos: LatLng }) => {
  const { entityStore } = useStores()
  const [loading, setLoading] = useState(false)

  const [count, setCount] = useState('')
  const [focused, setFocused] = useState(false)
  
  useEffect(() => {
    if (show) {
      setCount('')
    }
    else {
      setFocused(false)
      Keyboard.dismiss()
    }
  }, [show])

  const submit = useCallback(() => {
    setLoading(true)
    entityStore.addParkingPoint(
      ParkingPointModel.create({
        p_latitude: pos.latitude.toFixed(6),
        p_longitude: pos.longitude.toFixed(6),
        minimum_count: parseInt(count),
        bikes_count: undefined,
        section_id: undefined,
        id: -1,
      })
    ).then(success => {
      setLoading(false)
      if (success) onClose()
    })
  }, [count, pos])

  return (
    <BottomPaper onClose={onClose} show={show} up={focused} title='添加停车点' upHeight={280}>
      {pos && (<Text>坐标：{global.positionHuman(pos)}</Text>)}
      <TextField label="最低停放单车数量" keyboardType='number-pad' onChangeText={t => setCount(t)} value={count} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder='单车数目不足时会提醒维护员挪车' returnKeyType='done' />
      <Button text='添加' onPress={submit} loading={loading} disabled={!count || parseInt(count) < 0} />
    </BottomPaper>
  )
}

const AddSectionPaper = ({ show, onClose, pos1, pos2 }: { show: boolean, onClose: () => void, pos1: LatLng, pos2: LatLng }) => {
  const { entityStore } = useStores()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState('')
  const [focused, setFocused] = useState(false)
  
  useEffect(() => {
    if (show) {
      setName('')
    }
    else {
      setFocused(false)
      Keyboard.dismiss()
    }
  }, [show])

  const submit = useCallback(() => {
    setLoading(true)
    entityStore.addSection(
      SectionModel.create({
        tr_latitude: pos1.latitude.toFixed(6),
        tr_longitude: pos1.longitude.toFixed(6),
        bl_latitude: pos2.latitude.toFixed(6),
        bl_longitude: pos2.longitude.toFixed(6),
        name,
        id: -1,
      })
    ).then(success => {
      setLoading(false)
      if (success) onClose()
    })
  }, [name, pos1, pos2])

  return (
    <BottomPaper onClose={onClose} show={show} up={focused} title='添加管理区' upHeight={280}>
      {pos1 && (<Text>右上角坐标：{global.positionHuman(pos1)}</Text>)}
      {pos2 && (<Text>左下角角坐标：{global.positionHuman(pos2)}</Text>)}
      <TextField label="管理区名称" onChangeText={t => setName(t)} value={name} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} returnKeyType='done' />
      <Button text='添加' onPress={submit} loading={loading} disabled={!name} />
    </BottomPaper>
  )
}

const DANGER: ViewStyle = {
  backgroundColor: color.error,
}

const INFO_LINE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: spacing[2],
}

const OperatePPModal = ({ show, onClose, pp }: { show: boolean, onClose: () => void, pp: ParkingPoint }) => {
  const { entityStore } = useStores()
  const [loading, setLoading] = useState(false)
  const [removed, setRemoved] = useState(false)

  const remove = useCallback(() => {
    setLoading(true)
    entityStore.removeParkingPoint(pp.id).then(success => {
      setLoading(false)
      if (success) {
        setRemoved(true)
        onClose()
      }
    })
  }, [pp])

  useEffect(() => {
    setRemoved(false)
    if (pp && show) pp.setSelected(true)
  }, [pp, show])

  return (
    <BottomModal onClose={() => {
      onClose()
      pp.setSelected(false)
    }} show={show} title='停车点'>
      {pp && !removed && (
        <>
          <View style={INFO_LINE}><Text preset='fieldLabel'>坐标：</Text><Text>{global.positionHuman(pp.coordinate)}</Text></View>
          <View style={INFO_LINE}><Text preset='fieldLabel'>最低停放单车数量：</Text><Text>{pp.minimum_count}</Text></View>
          <View style={INFO_LINE}><Text preset='fieldLabel'>停放单车数量：</Text><Text>{pp.bikes_count}</Text></View>
          <Button style={DANGER} text='删除停车点' onPress={remove} loading={loading} />
        </>
      )}
    </BottomModal>
  )
}

const LINE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-evenly',
}

const OperateSectionModal = ({ show, onClose, section }: { show: boolean, onClose: () => void, section: Section }) => {
  const { entityStore } = useStores()
  const [loading, setLoading] = useState(false)
  const [removed, setRemoved] = useState(false)

  const navigation = useNavigation<NavigationProp<NavigatorParamList>>()

  const remove = useCallback(() => {
    setLoading(true)
    entityStore.removeSection(section.id).then(success => {
      setLoading(false)
      if (success) {
        setRemoved(true)
        onClose()
      }
    })
  }, [section])

  useEffect(() => {
    setRemoved(false)
  }, [section])

  return (
    <BottomModal onClose={onClose} show={show} title={'管理区 ' + (section?.name ?? '')}>
      {section && !removed && (
        <>
          <View style={INFO_LINE}><Text preset='fieldLabel'>右上角坐标：</Text><Text>{global.positionHuman(section.coordinates[0])}</Text></View>
          <View style={INFO_LINE}><Text preset='fieldLabel'>左下角坐标：</Text><Text>{global.positionHuman(section.coordinates[2])}</Text></View>
          <View style={LINE}>
            <Button style={DANGER} text='删除管理区' onPress={remove} loading={loading} />
            <Button text='调整维护者' onPress={() => {
              onClose()
              navigation.navigate('sectionPermission', { sectionId: section.id })
            }} />
          </View>
        </>
      )}
    </BottomModal>
  )
}
