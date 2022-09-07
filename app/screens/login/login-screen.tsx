import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, View, ViewStyle } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { Button, Screen, Text, TextField } from "../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../models"
import { color, spacing } from "../../theme"
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


export const LoginScreen: FC<StackScreenProps<NavigatorParamList, "login">> = observer(function LoginScreen() {
  const { userStore } = useStores()
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()

  const [nickname, setNickname] = useState("")
  const [password, setPassword] = useState("")
  const [submitLoading, setSubmitLoading] = useState(false)

  const login = async () => {
    if (!nickname.length || !password.length) global.toast.show('昵称和密码不能为空', { type: 'danger' })
    setSubmitLoading(true)
    const success = await userStore.signIn(nickname, password)
    setSubmitLoading(false)
    if (success) {
      await userStore.fetch()
      navigation.goBack()
    }
  }

  return (
    <Screen style={ROOT}>
      <Text preset="header" text="登录" />
      <TextField label="昵称" textContentType="nickname" onChangeText={t => setNickname(t)} value={nickname} />
      <TextField label="密码" textContentType="password" secureTextEntry onChangeText={t => setPassword(t)} value={password} />
      <View style={BUTTON_GROUP}>
        <Button text='登录' onPress={login} loading={submitLoading}></Button>
        <Button text='注册' style={BUTTON_RIGHT} onPress={() => navigation.navigate('signUp')}></Button>
      </View>
    </Screen>
  )
})
