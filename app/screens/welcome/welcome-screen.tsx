/* eslint-disable react-native/no-inline-styles */
import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { Animated, View, ViewStyle } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { Button, Checkbox, Screen, Text, TextField } from "../../components"
import { useNavigation } from "@react-navigation/native"
import { CUSTOMER_USER, MAINTAINER_USER, MANAGER_USER, UNLINKED_USER, useStores } from "../../models"
import { spacing } from "../../theme"
import { color } from "@storybook/theming"

const ROOT: ViewStyle = {
  justifyContent: 'center',
  flex: 1,
  paddingHorizontal: spacing[5],
}

const BUTTON_GROUP: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'center',
}

const BUTTON_RIGHT: ViewStyle = {
  marginLeft: spacing[6],
}

const HIDE: ViewStyle = {
  position: 'absolute',
  width: '100%',
  marginTop: spacing[4],
}

const DIVIDER: ViewStyle = {
  height: 1,
  width: '100%',
  backgroundColor: color.border,
  marginVertical: spacing[4],
}

export const WelcomeScreen: FC<StackScreenProps<NavigatorParamList, "welcome">> = observer(function WelcomeScreen() {
  const { userStore } = useStores()
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
  const [showGuide, setShowGuide] = useState(false)
  const [selection, setSelection] = useState(-1)
  const fadeAnim1 = useRef(new Animated.Value(0)).current
  const fadeAnim2 = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(0)).current
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [asCustomerLoading, setAsCustomerLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [checkLoading, setCheckLoading] = useState(false)

  useEffect(() => {
    (async () => {
      if (!userStore.me && !await userStore.fetch()) return
      if (userStore.me.role !== UNLINKED_USER) {
        if (navigation.getState().index) {
          navigation.goBack()
        }
        else {
          switch (userStore.me.role) {
            case CUSTOMER_USER:
              navigation.reset({ index: 0, routes: [{ name: 'customer' }] })
              break
            case MAINTAINER_USER:
              navigation.reset({ index: 0, routes: [{ name: 'maintainer' }] })
              break
            case MANAGER_USER:
              navigation.reset({ index: 0, routes: [{ name: 'manager' }] })
              break
          }
        }
        return
      }
      setShowGuide(true)
    })()
  }, [userStore.me?.role])

  useEffect(() => {
    Animated.parallel([
      Animated.timing(
        fadeAnim1,
        {
          toValue: selection === 0 ? 1 : 0,
          duration: 300,
          useNativeDriver: false,
        }
      ),
      Animated.timing(
        fadeAnim2,
        {
          toValue: selection > 0 ? 1 : 0,
          duration: 300,
          useNativeDriver: false,
        }
      ),
      Animated.timing(
        slideAnim,
        {
          toValue: [0, -100, -500, -500][selection + 1],
          duration: 300,
          useNativeDriver: false,
        }
      )
    ]).start()
  }, [selection])

  const registerAsCustomer = useCallback(() => {
    setAsCustomerLoading(true)
    userStore.registerAsCustomer().then(success => {
      setAsCustomerLoading(false)
      if (success) navigation.reset({ index: 0, routes: [{ name: 'customer' }] })
    })
  }, [])

  const registerAs = useCallback(() => {
    setSubmitLoading(true)
    userStore.registerAs(selection - 1, name, phone).then(() => {
      setSubmitLoading(false)
    })
  }, [selection, name, phone])

  const check = useCallback(() => {
    setCheckLoading(true)
    userStore.checkRole().then(success => {
      setCheckLoading(false)
      if (success) {
        switch (userStore.me.role) {
          case MAINTAINER_USER:
            navigation.reset({ index: 0, routes: [{ name: 'maintainer' }] })
            break
          case MANAGER_USER:
            navigation.reset({ index: 0, routes: [{ name: 'manager' }] })
            break
        }
      }
    })
  }, [userStore.me])

  const logOut = useCallback(() => {
    userStore.logOut().then(() => {
      navigation.reset({ index: 0, routes: [{ name: 'welcome' }] })
    })
  }, [])

  return (
    <Screen style={ROOT}>
      {
        showGuide ? (
          <Animated.View style={{ marginTop: slideAnim }}>
            <View style={BUTTON_GROUP}>
              <Text preset='header' text='选择您注册的用户类型' />
              <Button style={BUTTON_RIGHT} text='退出登录' onPress={logOut} />
            </View>
            <View style={DIVIDER} />
            <View style={BUTTON_GROUP}>
              <Checkbox text='学生' onToggle={() => setSelection(0)} value={selection === 0} />
              <Checkbox text='维护员' style={BUTTON_RIGHT} onToggle={() => setSelection(1)} value={selection === 1} />
              <Checkbox text='管理员' style={BUTTON_RIGHT} onToggle={() => setSelection(2)} value={selection === 2} />
            </View>
            <View>
              <Animated.View style={[HIDE, { opacity: fadeAnim2 }]}>
              <View style={DIVIDER} />
                <Text text='填写个人信息表单，等待管理员审核：' />
                <TextField label="真实姓名" autoCompleteType="name" onChangeText={t => setName(t)} value={name} returnKeyType='done' />
                <TextField label="手机号" keyboardType="phone-pad" autoCompleteType="tel" onChangeText={t => setPhone(t)} value={phone} returnKeyType='done' />
                <Button text="提交审核" style={{ alignSelf: 'center' }} loading={submitLoading} onPress={registerAs} disabled={!name || !phone} />
                <View style={DIVIDER} />
                <Text text='我已经提交过了：' />
                <Button text="检查审核状态" style={{ alignSelf: 'center' }} loading={checkLoading} onPress={check} />
              </Animated.View>
              <Animated.View style={[HIDE, { opacity: fadeAnim1, alignItems: 'center' }]}>
                <View style={DIVIDER} />
                <Button text="注册为学生" loading={asCustomerLoading} onPress={registerAsCustomer} />
              </Animated.View>
            </View>
          </Animated.View>
        ) : (
          <Button text='登录' onPress={() => navigation.navigate('login')} />
        )
      }
    </Screen>
  )
})
