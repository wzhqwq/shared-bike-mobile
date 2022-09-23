import * as React from "react"
import { Image, ImageStyle, StyleProp, TouchableOpacity, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color, spacing, typography } from "../../theme"
import * as FileSystem from "expo-file-system"
import * as ImagePicker from 'expo-image-picker'
import { ImageInfo } from 'expo-image-picker'
import { useEffect, useState } from "react"
import { Entypo, MaterialIcons } from "@expo/vector-icons"
import { Text } from "../text/text"
import { BASE_URL } from "../../services/api/api-config"
import global from "../../global"
import { useStores } from "../../models"

const CONTAINER: ViewStyle = {
  marginVertical: spacing[2],
}

export interface UploadProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  label?: string
  imageKey?: string
  onChange?: (imageKey: string) => void
}

const BLOCK: ViewStyle = {
  width: 100,
  height: 100,
  borderRadius: spacing[2],
  backgroundColor: color.backgroundDarker,
  justifyContent: 'center',
  alignItems: 'center',
}

const IMAGE: ImageStyle = {
  width: 100,
  height: 100,
  borderRadius: spacing[2],
}

const BUTTON: ViewStyle = {
  width: 24,
  height: 24,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  shadowColor: '#000',
  shadowOffset: { width: -2, height: 2 },
  shadowOpacity: 0.2,
}

const DELETE: ViewStyle = {
  ...BUTTON,
  left: 88,
  top: -112,
  backgroundColor: color.error,
}

const UPLOAD: ViewStyle = {
  ...BUTTON,
  left: 88,
  top: -80,
  backgroundColor: color.primary,
}

export const Upload = observer(function Upload(props: UploadProps) {
  const { style } = props
  const styles = Object.assign({}, CONTAINER, style)
  const [image, setImage] = useState<string>(null)
  const [uploaded, setUploaded] = useState<boolean>(false)

  const { userStore } = useStores()

  useEffect(() => {
    if (props.imageKey) {
      setImage(BASE_URL + '/image/show?key=' + props.imageKey)
      setUploaded(true)
    }
  }, [props.imageKey])

  const pickImage = async () => {
    if (!await ImagePicker.requestMediaLibraryPermissionsAsync()) {
      global.toast.show('需要相册权限', { type: 'error' })
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    }) as ImageInfo

    console.log(result)

    if (!result.cancelled) {
      setImage(result.uri)
    }
  }

  const upload = async () => {
    const response = await FileSystem.uploadAsync(
      BASE_URL + '/image/upload',
      image,
      {
        httpMethod: "PUT",
        headers: { Authorization: 'Bearer ' + userStore.environment.jwt },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      }
    )
    console.log(response)
    if (response.status === 200) {
      const data = JSON.parse(response.body) as { status: boolean, data: string }
      if (data.status) {
        props.onChange?.(data.data)
        setUploaded(true)
      }
    }
  }

  return (
    <View style={styles}>
      {props.label && <Text preset="fieldLabel" text={props.label} />}
      {image ? (
        <>
          <Image source={{ uri: image }} style={IMAGE} />
          <TouchableOpacity activeOpacity={0.7} onPress={() => setImage(null)} >
            <View style={DELETE}>
              <MaterialIcons name="close" size={20} color={color.palette.white} />
            </View>
          </TouchableOpacity>
          {!uploaded && (
            <TouchableOpacity activeOpacity={0.7} onPress={upload} >
              <View style={UPLOAD}>
                <MaterialIcons name="file-upload" size={20} color={color.palette.white} />
              </View>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <TouchableOpacity activeOpacity={0.7} onPress={pickImage} >
          <View style={BLOCK}>
            <Entypo name='plus' size={24} color={color.dim} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  )
})
