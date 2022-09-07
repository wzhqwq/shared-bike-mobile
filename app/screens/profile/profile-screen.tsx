import React, { FC, useCallback, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ActivityIndicator, FlatList, Image, ImageStyle, RefreshControl, ScrollView, TextStyle, TouchableHighlight, View, ViewStyle } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import { navigate, NavigatorParamList } from "../../navigators"
import { Button, Screen, Text } from "../../components"
import { useNavigation } from "@react-navigation/native"
import { Customer, CUSTOMER_USER, getBanTimeIfExist, getNameIfExist, MAINTAINER_USER, Manager, MANAGER_USER, User, useStores } from "../../models"
import { color, spacing } from "../../theme"
import { MaterialIcons } from "@expo/vector-icons"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
  padding: spacing[5],
}

const LOGOUT: ViewStyle = {
  backgroundColor: color.error,
  marginTop: spacing[6],
  borderRadius: spacing[2],
}

export const ProfileScreen: FC<StackScreenProps<NavigatorParamList, "profile">> = observer(function ProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()

  const [refreshing, setRefreshing] = React.useState(false)
  const { userStore } = useStores()
  useEffect(() => {
    if (!userStore.me) userStore.fetch()
  }, [])

  const refresh = useCallback(() => {
    userStore.fetch().then(() => setRefreshing(false))
  }, [])

  const logOut = useCallback(() => {
    userStore.logOut().then(() => {
      navigation.reset({ index: 0, routes: [{ name: 'welcome' }] })
    })
  }, [])

  return (<ShowUser me={userStore.me} refreshing={refreshing} refresh={refresh} logOut={logOut} />)
})

const ShowUser = observer(({ me, refreshing, refresh, logOut }: { me: User, refreshing: boolean, refresh: () => void, logOut: () => void }) => (
  <View style={ROOT}>
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
      {
        me ? (
          <>
            <UserPanel user={me} />
            {me.role === MANAGER_USER && (<ManagerList />)}
            <Button style={LOGOUT} text="退出登录" onPress={logOut} />
          </>
        ) : (
          <ActivityIndicator color={color.primary} />
        )
      }
    </ScrollView>
  </View>
))

const USER_PANEL: ViewStyle = {
  backgroundColor: color.backgroundDarker,
  padding: spacing[3],
  borderRadius: spacing[2],
}

const PROFILE_LINE: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const USER: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
}

const AVATAR: ImageStyle = {
  resizeMode: 'contain',
  width: 40,
  height: 40,
  borderRadius: 20,
  marginRight: spacing[2],
}

const BUTTON: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
}

const UserPanel = observer(({ user }: { user: User }) => {
  return (
    <View style={USER_PANEL}>
      <View style={PROFILE_LINE}>
        <View style={USER}>
          <Image source={user.avatar_url} style={AVATAR} />
          <Text preset='default'>{user.nickname}{getNameIfExist(user)}{getBanTimeIfExist(user)}</Text>
        </View>
        <Button preset='link' style={BUTTON}>
          <Text>编辑个人资料</Text>
          <MaterialIcons name='chevron-right' size={24} />
        </Button>
      </View>
      {user.role === CUSTOMER_USER && (<CustomerInfoGroup customer={user.extended as Customer} />)}
    </View>
  )
})

const INFO_GROUP: ViewStyle = {
  alignItems: 'center',
  flexDirection: 'row',
  marginHorizontal: -spacing[3],
  paddingTop: spacing[4],
}

const INFO_GROUP_ITEM: ViewStyle = {
  alignItems: 'center',
  flexGrow: 1,
}

const INFO_GROUP_DIVIDER: ViewStyle = {
  height: 40,
  width: 1,
  backgroundColor: 'rgba(0,0,0,0.3)'
}

const CustomerInfoGroup = observer(({ customer }: { customer: Customer }) => (
  <View style={INFO_GROUP}>
    <View style={INFO_GROUP_ITEM}>
      <Text preset='fieldLabel' text='积分' />
      <Text preset='header' text={customer.points.toString()} />
    </View>
    <View style={INFO_GROUP_DIVIDER} />
    <View style={INFO_GROUP_ITEM}>
      <Text preset='fieldLabel' text='押金' />
      <Text preset='header' text={customer.deposit + ' 元'} />
    </View>
    <View style={INFO_GROUP_DIVIDER} />
    <View style={INFO_GROUP_ITEM}>
      <Text preset='fieldLabel' text='累计行程' />
      <Text preset='header' text={`${customer.mileage_total.toFixed(1)} 公里`} />
    </View>
  </View>
))

const LIST: ViewStyle = {
  marginTop: spacing[4],
  borderRadius: spacing[2],
  overflow: 'hidden',
}

const LIST_ITEM: ViewStyle = {
  padding: spacing[4],
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: color.backgroundDarker,
  borderBottomColor: '#0001',
  borderBottomWidth: 1,
}
const LIST_ITEM_LAST: ViewStyle = {
  ...LIST_ITEM,
  borderBottomWidth: 0,
}

const LIST_ITEM_TEXT: TextStyle = {
  fontSize: 16,
}

const getListItem = (to: keyof NavigatorParamList, label: string, last: boolean, hasArrow = false) => (
  <TouchableHighlight activeOpacity={0.7} underlayColor='#FFF' onPress={() => navigate(to)}>
    <View style={last ? LIST_ITEM_LAST : LIST_ITEM}>
      <Text style={LIST_ITEM_TEXT}>{label}</Text>
      {hasArrow && (<MaterialIcons name='chevron-right' size={24} />)}
    </View>
  </TouchableHighlight>
)

const ManagerList = () => (
  <View style={LIST}>
    {getListItem('member', '所有人员', false, true)}
    {getListItem('request', '注册请求', false, true)}
    {getListItem('configSet', '系统设置', true, true)}
  </View>
)