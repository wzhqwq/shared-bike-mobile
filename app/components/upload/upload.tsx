import * as React from "react"
import { ActivityIndicator, Image, ImageStyle, StyleProp, TouchableOpacity, View, ViewStyle } from "react-native"
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
  shadowColor: '#000',
  shadowOffset: { width: -2, height: 2 },
  shadowOpacity: 0.2,
}

const DELETE: ViewStyle = {
  ...BUTTON,
  backgroundColor: color.error,
}

const UPLOAD: ViewStyle = {
  ...BUTTON,
  backgroundColor: color.primary,
}

const BUTTON_GROUP: ViewStyle = {
  flexDirection: 'row',
  position: 'absolute',
  justifyContent: 'space-between',
  width: 60,
  left: 88,
  top: 4,
}

const UPLOADED: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  marginLeft: 10,
}

export const Upload = observer(function Upload(props: UploadProps) {
  const { style } = props
  const styles = Object.assign({}, CONTAINER, style)
  const [image, setImage] = useState<string>(null)
  const [uploaded, setUploaded] = useState<boolean>(false)
  const [uploading, setUploading] = useState<boolean>(false)

  const { userStore } = useStores()

  useEffect(() => {
    if (props.imageKey) {
      setImage(BASE_URL + '/image/show?key=' + props.imageKey)
      setUploaded(true)
    }
    else {
      setImage(null)
      setUploaded(false)
    }
    setUploading(false)
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

    if (!result.cancelled) {
      setImage(result.uri)
    }
  }

  const upload = async () => {
    setUploading(true)
    const response = await FileSystem.uploadAsync(
      BASE_URL + '/image/upload',
      image,
      {
        httpMethod: "PUT",
        headers: { Authorization: 'Bearer ' + userStore.environment.jwt },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      }
    )
    setUploading(false)
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
          <View style={BUTTON_GROUP}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => {
              setImage(null)
              setUploaded(false)
              setUploading(false)
            }} >
              <View style={DELETE}>
                <MaterialIcons name="close" size={20} color={color.palette.white} />
              </View>
            </TouchableOpacity>
            {!uploaded ? (
              uploading ? (
                <View style={UPLOADED}>
                  <ActivityIndicator size="small" color={color.primaryDarker} />
                  <Text>上传中</Text>
                </View>
              ) : (
                <TouchableOpacity activeOpacity={0.7} onPress={upload} >
                  <View style={UPLOAD}>
                    <MaterialIcons name="file-upload" size={20} color={color.palette.white} />
                  </View>
                </TouchableOpacity>
              )
            ) : (
              <View style={UPLOADED}>
                <MaterialIcons name="check" size={20} color={color.primaryDarker} />
                <Text>已上传</Text>
              </View>
            )}
          </View>
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
