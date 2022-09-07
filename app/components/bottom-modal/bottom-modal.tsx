import { MaterialIcons } from "@expo/vector-icons"
import React, { useEffect, useRef } from "react"
import { Animated, Modal, SafeAreaView, StyleProp, View, ViewStyle } from "react-native"
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler"
import { color, spacing } from "../../theme"
import { Button } from "../button/button"
import { Text } from "../text/text"

export interface BottomModalProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  show: boolean
  onClose: () => void
  children: JSX.Element | JSX.Element[]
  title: string
  up?: boolean
}

const CONTAINER: ViewStyle = {
  justifyContent: 'flex-end',
  flex: 1,
}

const MODAL: ViewStyle = {
  backgroundColor: color.background,
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
}

/**
 * Describe your component here
 */
export const BottomModal = function BottomModal(props: BottomModalProps) {
  const { style } = props
  const slideAnim = useRef(new Animated.Value(0)).current
  const styles = [Object.assign({}, MODAL, style), { marginBottom: slideAnim }]

  const swipeDown = Gesture.Fling().direction(Directions.DOWN).onEnd(props.onClose)

  useEffect(() => {
    Animated.timing(
      slideAnim,
      {
        toValue: props.up ? 350 : 0,
        duration: 200,
        useNativeDriver: false,
      }
    ).start()
  }, [props.up])

  return (
    <Modal visible={props.show} onRequestClose={props.onClose} animationType='slide' transparent>
      <SafeAreaView edges={['bottom']} style={CONTAINER}>
        <GestureDetector gesture={swipeDown}>
          <Animated.View style={styles}>
            <View style={MODAL_HEADER}>
              <Text preset='header'>{props.title}</Text>
              <Button preset='link' onPress={props.onClose}><MaterialIcons name='close' size={24} /></Button>
            </View>
            {props.children}
          </Animated.View>
        </GestureDetector>
      </SafeAreaView>
    </Modal>
  )
}