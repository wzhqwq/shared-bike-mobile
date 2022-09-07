import React from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { HeaderProps } from "./header.props"
import { Button } from "../button/button"
import { Text } from "../text/text"
import { color, spacing } from "../../theme"
import { translate } from "../../i18n/"
import { Entypo } from "@expo/vector-icons"

// static styles
const ROOT: ViewStyle = {
  flexDirection: "row",
  paddingHorizontal: spacing[4],
  alignItems: "center",
  paddingVertical: spacing[2],
  justifyContent: "flex-start",
  borderBottomColor: color.line,
  borderBottomWidth: 1,
}
const TITLE: TextStyle = { textAlign: "center", fontSize: 16 }
const TITLE_MIDDLE: ViewStyle = { flex: 1, justifyContent: "center" }
const LEFT: ViewStyle = { width: 32 }
const RIGHT: ViewStyle = { width: 32 }

/**
 * Header that appears on many screens. Will hold navigation buttons and screen title.
 */
export function Header(props: HeaderProps) {
  const {
    onLeftPress,
    onRightPress,
    rightIcon,
    leftIcon,
    headerText,
    headerTx,
    style,
    titleStyle,
    hasBack = false,
  } = props
  const header = headerText || (headerTx && translate(headerTx)) || ""

  return (
    <View style={[ROOT, style]}>
      {leftIcon || hasBack ? (
        <Button preset="link" onPress={onLeftPress}>
          {leftIcon}
          {hasBack && (<Entypo name='chevron-small-left' size={32} />)}
        </Button>
      ) : (
        <View style={LEFT} />
      )}
      <View style={TITLE_MIDDLE}>
        <Text style={[TITLE, titleStyle]} text={header} />
      </View>
      {rightIcon ? (
        <Button preset="link" onPress={onRightPress}>
          {rightIcon}
        </Button>
      ) : (
        <View style={RIGHT} />
      )}
    </View>
  )
}
