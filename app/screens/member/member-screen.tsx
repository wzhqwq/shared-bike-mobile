import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, Image, ImageStyle, ListRenderItemInfo, TextStyle, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, navigate, NavigatorParamList } from "../../navigators"
import { Button, Header, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { Customer, CUSTOMER_USER, getBanTimeIfExist, getNameIfExist, MAINTAINER_USER, MANAGER_USER, User, useStores } from "../../models"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

const roles: { name: string, category: 'customer' | 'maintainer' | 'manager' }[] = [
  { name: '学生', category: 'customer' },
  { name: '维护员', category: 'maintainer' },
  { name: '管理员', category: 'manager' },
]

const SELECTOR: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  borderBottomColor: color.line,
  borderBottomWidth: 1,
  padding: spacing[3],
}

const NOT_ACTIVE: { v: ViewStyle, t: TextStyle} = {
  v: {
    backgroundColor: color.transparent,
  },
  t: {
    color: color.primaryDarker,
  },
}

const NO_DATA: TextStyle = {
  alignSelf: 'center',
  color: color.primary,
  marginTop: spacing[4],
}

export const MemberScreen: FC<StackScreenProps<NavigatorParamList, "member">> = observer(function MemberScreen() {
  const { entityStore } = useStores()
  const [type, setType] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const version = entityStore.usersVersion

  const refresh = useCallback(() => {
    entityStore.listUsers(roles[type].category, false).then(() => setRefreshing(false))
  }, [type])

  const next = useCallback(() => {
    if (refreshing) return
    entityStore.listUsers(roles[type].category, true)
    console.log('next!!!')
  }, [type])

  useEffect(() => refresh(), [type])

  return (
    <Screen style={ROOT}>
      <Header headerText="所有用户" hasBack onLeftPress={goBack} />
      <View style={SELECTOR}>
        {roles.map(({ name }, i) => (
          <Button
            style={i !== type ? NOT_ACTIVE.v : undefined}
            textStyle={i !== type ? NOT_ACTIVE.t : undefined}
            text={name}
            key={i}
            onPress={() => setType(i)}
          />
        ))}
      </View>
      {!entityStore.users.length && (<Text style={NO_DATA}>没有{roles[type].name}</Text>)}
      <FlatList
        onEndReached={next}
        data={entityStore.users}
        renderItem={renderItem}
        keyExtractor={item => {
          console.log(item.id)
          return item.id.toString()
        }}
        onRefresh={refresh}
        refreshing={refreshing}
      />
    </Screen>
  )
})

const LINE: ViewStyle = {
  flexDirection: 'row',
  paddingVertical: spacing[4],
  paddingHorizontal: spacing[6],
  borderBottomColor: color.line,
  borderBottomWidth: 1,
  alignItems: 'center',
  justifyContent: 'space-between',
}

const AVATAR: ImageStyle = {
  resizeMode: 'contain',
  width: 30,
  height: 30,
  borderRadius: 15,
  marginRight: spacing[2],
}

const USER: ViewStyle = {
  alignItems: 'center',
  flexDirection: 'row'
}

const UserItem: FC<{ item: User }> = observer(({ item }) => (
  <View style={LINE}>
    <View style={USER}>
      <Image source={item.avatar_url} style={AVATAR} />
      <Text preset='default'>{item.nickname}{getNameIfExist(item)}</Text>
    </View>
    {item.role === CUSTOMER_USER && (
      <>
        {getBanTimeIfExist(item) && (
          <Button text='解封' onPress={() => (item.extended as Customer).liftTheBan()} />
        )}
        <Button text='查看兑换记录' onPress={() => navigate('exchangeSet', { customerId: item.id })} />
      </>
    )}
  </View>
))

const renderItem = ({ item }: ListRenderItemInfo<User>) => (<UserItem item={item} />)
