import React, { FC, useCallback, useState } from "react"
import { observer } from "mobx-react-lite"
import { ScrollView, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { Button, Header, Screen, Text, TextField } from "../../components"
import { CUSTOMER_USER, Manager, useStores } from "../../models"
import { color, spacing } from "../../theme"
import global from "../../global"
import { Upload } from "../../components/upload/upload"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
}

const CONTAINER: ViewStyle = {
  padding: spacing[4],
}

const BUTTON: ViewStyle = {
  marginBottom: spacing[8],
}

export const EditProfileScreen: FC<StackScreenProps<NavigatorParamList, "editProfile">> = observer(function EditProfileScreen() {
  const { userStore } = useStores()

  const [nickname, setNickname] = useState(userStore.me.nickname)
  const [name, setName] = useState((userStore.me.extended as Manager).name)
  const [phone, setPhone] = useState((userStore.me.extended as Manager).phone)
  const [avatarKey, setAvatarKey] = useState(userStore.me.avatar_key)

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const updateProfile = useCallback(() => {
    userStore.changeProfile(nickname, name, phone, avatarKey).then(success => {
      if (success) goBack()
    })
  }, [nickname, name, phone, avatarKey])

  const updatePassword = useCallback(() => {
    if (newPassword !== confirmPassword) {
      global.toast.show('两次输入的密码不一致', { type: 'error' })
      userStore.changePassword(oldPassword, newPassword).then(success => {
        if (success) goBack()
      })
    }
  }, [oldPassword, newPassword, confirmPassword])

  return (
    <Screen style={ROOT}>
      <Header headerText="编辑个人资料" hasBack onLeftPress={goBack} />
      <ScrollView contentContainerStyle={CONTAINER}>
        <Upload label="头像" imageKey={avatarKey} onChange={setAvatarKey} />
        <TextField label="昵称" textContentType="nickname" onChangeText={t => setNickname(t)} value={nickname} />
        {userStore.me.role > CUSTOMER_USER && (
          <>
            <TextField label="姓名" textContentType="name" onChangeText={t => setName(t)} value={name} />
            <TextField label="电话" keyboardType="phone-pad" textContentType="telephoneNumber" onChangeText={t => setPhone(t)} value={phone} />
          </>
        )}
        <Button preset="primary" text="更新个人资料" onPress={updateProfile} style={BUTTON} />

        <TextField label="旧密码" textContentType="password" secureTextEntry onChangeText={t => setOldPassword(t)} value={oldPassword} />
        <TextField label="新密码" textContentType="newPassword" secureTextEntry onChangeText={t => setNewPassword(t)} value={newPassword} />
        <TextField label="确认密码" textContentType="password" secureTextEntry onChangeText={t => setConfirmPassword(t)} value={confirmPassword} />

        <Button preset="primary" text="更新密码" onPress={updatePassword} style={BUTTON} />
      </ScrollView>
    </Screen>
  )
})
