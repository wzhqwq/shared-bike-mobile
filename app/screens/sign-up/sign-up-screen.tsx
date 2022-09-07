import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { Button, Screen, Text, TextField } from "../../components"
import { spacing } from "../../theme"
import { useStores } from "../../models"
import { useNavigation } from "@react-navigation/native"
import global from "../../global"

const ROOT: ViewStyle = {
  flexDirection: 'column',
  flex: 1,
  justifyContent: 'center',
  paddingHorizontal: spacing[6],
}

const BUTTON_GROUP: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'center',
  paddingTop: spacing[4],
}

const BUTTON_RIGHT: ViewStyle = {
  marginLeft: spacing[6],
}

export const SignUpScreen: FC<StackScreenProps<NavigatorParamList, "signUp">> = observer(function SignUpScreen() {
  const { userStore } = useStores()
  const navigation = useNavigation()

  const [nickname, setNickname] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [submitLoading, setSubmitLoading] = useState(false)

  const signUp = async () => {
    if (!nickname.length || !password.length) {
      global.toast.show('昵称和密码不能为空', { type: 'danger' })
      return
    }
    if (password !== passwordConfirm) {
      global.toast.show('两次密码不同', { type: 'danger' })
      return
    }
    setSubmitLoading(true)
    const success = await userStore.signUp(nickname, password)
    setSubmitLoading(false)
    if (success) {
      await userStore.fetch()
      navigation.goBack()
      navigation.goBack()
    }
  }

  return (
    <Screen style={ROOT}>
      <Text preset="header" text="注册" />
      <TextField label="昵称" textContentType="nickname" onChangeText={t => setNickname(t)} value={nickname} />
      <TextField label="密码" textContentType="password" secureTextEntry onChangeText={t => setPassword(t)} value={password} />
      <TextField label="确认密码" textContentType="password" secureTextEntry onChangeText={t => setPasswordConfirm(t)} value={passwordConfirm} />
      <View style={BUTTON_GROUP}>
        <Button text='注册' onPress={signUp} loading={submitLoading}></Button>
        <Button text='返回' style={BUTTON_RIGHT} onPress={() => navigation.goBack()}></Button>
      </View>
    </Screen>
  )
})
