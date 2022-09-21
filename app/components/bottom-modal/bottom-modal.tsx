import { MaterialIcons } from "@expo/vector-icons"
import React, { useEffect, useRef } from "react"
import { Animated, Modal, SafeAreaView, StyleProp, View, ViewStyle } from "react-native"
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler"
import { spacing } from "../../theme"
import { Button } from "../button/button"
import { Text } from "../text/text"

export interface BottomModalProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  show: boolean
  onClose?: () => void
  children: JSX.Element | JSX.Element[]
  title: string
  up?: boolean
  upHeight?: number
  hideClose?: boolean
  level?: number
}

/**
 * Describe your component here
 */
export const BottomModal = (props: BottomModalProps) => {
  return (
    <Modal visible={props.show} onRequestClose={props.onClose} animationType='slide' transparent>
      <BasePaper {...props} />
    </Modal>
  )
}

const FLOAT: ViewStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
}

const FLOAT_HIDE: ViewStyle = {
  ...FLOAT,
  display: 'none',
}

export const BottomPaper = (props: BottomModalProps) => {
  return (
    <View style={props.show ? FLOAT : FLOAT_HIDE}>
      <BasePaper {...props} />
    </View>
  )
}

const CONTAINER: ViewStyle = {
  justifyContent: 'flex-end',
  flex: 1,
}

const MODAL: ViewStyle = {
  backgroundColor: 'white',
  borderRadius: spacing[2],
  shadowColor: '#000',
  shadowRadius: 2,
  shadowOpacity: 0.2,
  shadowOffset: { width: -0.5, height: 0.5 },
  marginHorizontal: spacing[4],
  padding: spacing[4],
}

const MODAL_HEADER: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: spacing[2],
}

const BasePaper = (props: BottomModalProps) => {
  const { style, level = 0, up, upHeight = 330 } = props

  const slideAnim = useRef(new Animated.Value(20)).current
  const backAnim = useRef(new Animated.Value(1.0)).current

  const styles = [
    Object.assign({}, MODAL, style),
    { marginBottom: slideAnim, transform: [
      { scale: backAnim },
      { perspective: 1000 },
    ] }
  ]

  useEffect(() => {
    Animated.timing(
      slideAnim,
      {
        toValue: up ? upHeight : 20,
        duration: 200,
        useNativeDriver: false,
      }
    ).start()
  }, [up, upHeight])

  useEffect(() => {
    Animated.timing(
      backAnim,
      {
        toValue: 1.0 - level * 0.1,
        duration: 200,
        useNativeDriver: false,
      }
    ).start()
  }, [level])

  const swipeDown = Gesture.Fling().direction(Directions.DOWN).onEnd(props.onClose)
  return (
    <SafeAreaView style={CONTAINER}>
      <GestureDetector gesture={swipeDown}>
        <Animated.View style={styles}>
          <View style={MODAL_HEADER}>
            <Text preset='header'>{props.title}</Text>
            {!props.hideClose && (<Button preset='link' onPress={props.onClose}><MaterialIcons name='close' size={24} /></Button>)}
          </View>
          {props.children}
        </Animated.View>
      </GestureDetector>
    </SafeAreaView>
  )
}