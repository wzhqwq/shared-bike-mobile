import React, { createContext, FC, useCallback, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ListRenderItemInfo, TextStyle, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { Button, Header, Screen, Text } from "../../components"
import { Maintainer, User, useStores } from "../../models"
import { color, spacing } from "../../theme"
import { RouteProp, useRoute } from "@react-navigation/native"
import { MaterialIcons } from "@expo/vector-icons"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

const SPLIT_VIEW: ViewStyle = {
  flex: 1,
}

const SPLIT: ViewStyle = {
  height: 1,
  backgroundColor: color.line,
}

const SPLIT_HEADER: ViewStyle = {
  paddingVertical: spacing[2],
  paddingHorizontal: spacing[4],
}

const SPLIT_CONTAINER: ViewStyle = {
  flex: 1,
}

const Context = createContext<{ revoke: (id: number) => void, grant: (id: number) => void }>({ revoke: null, grant: null })

export const SectionPermissionScreen: FC<StackScreenProps<NavigatorParamList, "sectionPermission">> = observer(function SectionPermissionScreen() {
  const { userStore, entityStore } = useStores()
  const { params } = useRoute<RouteProp<NavigatorParamList, "sectionPermission">>()

  const [userRefreshing, setUserRefreshing] = useState(false)
  const [maintainerRefreshing, setMaintainerRefreshing] = useState(false)

  useEffect(() => {
    if (!params.sectionId) {
      goBack()
      return
    }
    refreshMaintainer()
    refreshUser()
  }, [params])

  const [notInSection, inSection] = useMemo(
    () => {
      const inSectionIds = userStore.maintainers.map(m => m.user_id)
      return [
        entityStore.users.length ? entityStore.users.filter(u => !inSectionIds.includes(u.id)) : [],
        userStore.maintainers.slice(),
      ]
    },
    [userStore.maintainersVersion, entityStore.usersVersion]
  )

  const refreshUser = useCallback(() => {
    setUserRefreshing(true)
    entityStore.listUsers('maintainer', false).then(() => setUserRefreshing(false))
  }, [])

  const refreshMaintainer = useCallback(() => {
    setMaintainerRefreshing(true)
    userStore.listMaintainersInSection(params.sectionId).then(() => setMaintainerRefreshing(false))
  }, [])

  const nextUser = useCallback(() => {
    setUserRefreshing(true)
    entityStore.listUsers('maintainer', true).then(() => setUserRefreshing(false))
  }, [])

  const revoke = useCallback((id: number) => {
    userStore.revokeSectionFrom(params.sectionId, id)
  }, [])
  const grant = useCallback((id: number) => {
    userStore.grantSectionTo(params.sectionId, id)
  }, [])

  return (
    <Screen style={ROOT}>
      <Header headerText='调整管理区内维护员' hasBack />
      <View style={SPLIT_CONTAINER}>
        <Context.Provider value={{ revoke, grant }}>
          <View style={SPLIT_VIEW}>
            <View style={SPLIT_HEADER}><Text preset='header'>在管理区内</Text></View>
            <InSectionMaintainers
              users={inSection}
              refresh={refreshMaintainer}
              refreshing={maintainerRefreshing}
            />
          </View>
          <View style={SPLIT} />
          <View style={SPLIT_VIEW}>
            <View style={SPLIT_HEADER}><Text preset='header'>不在管理区内</Text></View>
            <AllMaintainers
              users={notInSection}
              next={nextUser}
              refresh={refreshUser}
              refreshing={userRefreshing}
            />
          </View>
        </Context.Provider>
      </View>
    </Screen>
  )
})

const NO_DATA: TextStyle = {
  alignSelf: 'center',
  color: color.primary,
  marginTop: spacing[4],
}

const AllMaintainers = observer(({ users, next, refresh, refreshing }: { users: User[], next: () => void, refresh: () => void, refreshing: boolean }) => (
  <FlatList
    onEndReached={next}
    data={users}
    renderItem={userRenderItem}
    keyExtractor={item => item.id.toString()}
    onRefresh={refresh}
    refreshing={refreshing}
    ListEmptyComponent={(
      <Text style={NO_DATA}>没有可以加入这个区域的维护员</Text>
    )}
  />
))

const InSectionMaintainers = observer(({ users, refresh, refreshing }: { users: Maintainer[], refresh: () => void, refreshing: boolean }) => (
  <FlatList
    data={users}
    renderItem={maintainerRenderItem}
    keyExtractor={item => item.user_id.toString()}
    onRefresh={refresh}
    refreshing={refreshing}
    ListEmptyComponent={(
      <Text style={NO_DATA}>这个区域内还没有维护员</Text>
    )}
  />
))

const LINE: ViewStyle = {
  flexDirection: 'row',
  paddingVertical: spacing[2],
  paddingHorizontal: spacing[6],
  borderBottomColor: color.line,
  borderBottomWidth: 1,
  alignItems: 'center',
  justifyContent: 'space-between',
}

const UserItem: FC<{ item: User }> = observer(({ item }) => (
  <Context.Consumer>
    {({ grant }) => (
      <View style={LINE}>
        <Text preset='default'>{(item.extended as Maintainer).name}</Text>
        <Button onPress={() => grant(item.id)}><MaterialIcons name='add' size={24} color='white' /></Button>
      </View>
    )}
  </Context.Consumer>
))

const userRenderItem = ({ item }: ListRenderItemInfo<User>) => (<UserItem item={item} />)

const MaintainerItem: FC<{ item: Maintainer }> = observer(({ item }) => (
  <Context.Consumer>
    {({ revoke }) => (
      <View style={LINE}>
        <Text preset='default'>{item.name}</Text>
        <Button onPress={() => revoke(item.user_id)}><MaterialIcons name='remove' size={24} color='white' /></Button>
      </View>
    )}
  </Context.Consumer>
))

const maintainerRenderItem = ({ item }: ListRenderItemInfo<Maintainer>) => (<MaintainerItem item={item} />)
