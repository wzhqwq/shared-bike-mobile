import * as React from "react"
import { ActivityIndicator, TouchableOpacity, ViewStyle } from "react-native"
import { spacing } from "../../theme"
import { Text } from "../text/text"
import { viewPresets, textPresets } from "./button.presets"
import { ButtonProps } from "./button.props"


const SPINNER: ViewStyle = {
  marginLeft: spacing[2],
}

const DISABLED: ViewStyle = {
  opacity: 0.5,
}
/**
 * For your text displaying needs.
 *
 * This component is a HOC over the built-in React Native one.
 */
export function Button(props: ButtonProps) {
  // grab the props
  const {
    preset = "primary",
    tx,
    text,
    style: styleOverride,
    textStyle: textStyleOverride,
    children,
    loading = false,
    ...rest
  } = props

  const viewStyle = viewPresets[preset] || viewPresets.primary
  const viewStyles = [viewStyle, styleOverride]
  const textStyle = textPresets[preset] || textPresets.primary
  const textStyles = [textStyle, textStyleOverride]

  const content = children || <Text tx={tx} text={text} style={textStyles} />

  const disabled = rest.disabled || loading
  if (disabled) viewStyles.push(DISABLED)

  return (
    <TouchableOpacity style={viewStyles} {...rest} disabled={disabled}>
      {loading && (<ActivityIndicator style={SPINNER} color='white' />)}
      {content}
    </TouchableOpacity>
  )
}
