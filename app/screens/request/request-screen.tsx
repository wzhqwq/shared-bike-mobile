import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ListRenderItemInfo, TextStyle, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { Button, Header, Screen, Text } from "../../components"
import { REQUEST_ACCEPTED, REQUEST_REJECTED, REQUEST_UNHANDLED, SignUpRequest, useStores } from "../../models"
import { color, spacing } from "../../theme"
import moment from "moment"
import { LINE, INFO_LINE } from "../../global"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

export const RequestScreen: FC<StackScreenProps<NavigatorParamList, "request">> = observer(function RequestScreen() {
  const { recordStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const version = recordStore.signUpRequests

  const refresh = useCallback(() => {
    recordStore.listSignUpRequests(false).then(() => setRefreshing(false))
  }, [])

  const next = useCallback(() => {
    recordStore.listSignUpRequests(true)
  }, [])

  useEffect(() => {
    if (!recordStore.signUpRequests.length) refresh()
  }, [])

  return (
    <Screen style={ROOT}>
      <Header headerText="注册请求" hasBack onLeftPress={goBack} />
      <FlatList
        onEndReached={next}
        data={recordStore.signUpRequests}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onRefresh={refresh}
        refreshing={refreshing}
      />
    </Screen>
  )
})

const REJECT: ViewStyle = {
  marginTop: spacing[2],
  backgroundColor: color.error
}

const ACCEPTED: TextStyle = {
  color: color.primary
}

const REJECTED: TextStyle = {
  color: color.error
}

const renderItem = ({ item }: ListRenderItemInfo<SignUpRequest>) => (<Request item={item} />)

const Request = observer(({ item }: { item: SignUpRequest }) => (
  <View style={LINE}>
    <View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>昵称：</Text>
        <Text>{item.nickname}</Text>
      </View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>姓名：</Text>
        <Text>{item.name}</Text>
      </View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>手机号：</Text>
        <Text>{item.phone}</Text>
      </View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>申请类型：</Text>
        <Text>{['维护员', '管理员'][item.type]}</Text>
      </View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>申请时间：</Text>
        <Text>{moment(item.time).locale('zh-cn').fromNow()}</Text>
      </View>
    </View>
    {item.status === REQUEST_UNHANDLED && (<View>
      <Button text='允许' onPress={() => item.handle(true)} />
      <Button text='拒绝' style={REJECT} onPress={() => item.handle(false)} />
    </View>)}
    {item.status === REQUEST_ACCEPTED && (<Text style={ACCEPTED}>已通过</Text>)}
    {item.status === REQUEST_REJECTED && (<Text style={REJECTED}>已拒绝</Text>)}
  </View>
))
