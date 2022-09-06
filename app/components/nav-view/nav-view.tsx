import * as React from "react"
import { StyleProp, Text, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color } from "../../theme"
import { Button } from "../button/button"

const CONTAINER: ViewStyle = {
  flexDirection: 'column',
}

const VIEW_CONTAINER: ViewStyle = {
  flexGrow: 1,
}

const VIEW: ViewStyle = {
  height: '100%',
}

const VIEW_INACTIVE: ViewStyle = {
  ...VIEW,
  display: 'none',
}

const NAVBAR: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  borderTopColor: '#EEEEEE',
}

const NAV_BUTTON: ViewStyle = {
  width: 40,
  height: 40,
  alignItems: 'center',
}

const LABEL: TextStyle = {
  fontSize: 14,
}

const LABEL_ACTIVE: TextStyle = {
  ...LABEL,
  color: color.primary,
}

export interface NavViewProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  children: JSX.Element[]
  buttons: { label: string, icon: JSX.Element, iconActive: JSX.Element }[]
}

/**
 * Describe your component here
 */
export const NavView = observer(function NavView(props: NavViewProps) {
  const { style } = props
  const styles = Object.assign({}, CONTAINER, style)
  const [selected, setSelected] = React.useState(0)

  return (
    <View style={styles}>
      <View style={VIEW_CONTAINER}>
        {props.children.map((e, i) => (
          <View style={i === selected ? VIEW : VIEW_INACTIVE} key={i}>{e}</View>
        ))}
      </View>
      <View style={NAVBAR}>
        {props.buttons.map(({ label, icon, iconActive }, i) => (
          <Button style={NAV_BUTTON} onPress={() => setSelected(i)} key={i}>
            {i === selected ? icon : iconActive}
            <Text style={i === selected ? LABEL_ACTIVE : LABEL}>{label}</Text>
          </Button>
        ))}
      </View>
    </View>
  )
})
