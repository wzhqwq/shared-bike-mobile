import React, { useCallback, useEffect, useState } from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { Button } from "../button/button"
import { Entypo } from "@expo/vector-icons"
import { BarCodeScanner } from 'expo-barcode-scanner'

const CONTAINER: ViewStyle = {
}

const BACK: ViewStyle = {
  position: 'absolute',
  left: 10,
  top: -490,
}

const FULL: ViewStyle = {
  position: 'absolute',
  left: 0,
  top: -500,
  right: 0,
  bottom: -100,
}


export interface ScannerProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  show: boolean
  onCancel: () => void
  onResult: (seriesNo: string) => void
}

/**
 * Describe your component here
 */
export const Scanner = observer(function Scanner(props: ScannerProps) {
  const { style } = props
  const styles = Object.assign({}, CONTAINER, style)
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    if (!props.show || hasPermission) return
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    }

    getBarCodeScannerPermissions()
  }, [props.show])

  const handleScanned = useCallback(({ type, data }: { type: string, data: string }) => {
    if (type !== 'org.iso.QRCode') return
    props.onResult(data)
  }, [])

  return (
    <View style={styles}>
      {props.show && hasPermission && (
        <>
          <BarCodeScanner
            onBarCodeScanned={handleScanned}
            style={FULL}
          />
          <Button preset='link' style={BACK} onPress={props.onCancel}>
            <Entypo name='chevron-small-down' size={32} color='white' />
          </Button>
        </>
      )}
    </View>
  )
})
