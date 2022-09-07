import React, { FC, useCallback, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ListRenderItemInfo, TextStyle, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { Button, Header, Screen, Text } from "../../components"
import { REQUEST_ACCEPTED, REQUEST_REJECTED, REQUEST_UNHANDLED, SignUpRequest, useStores } from "../../models"
import { color, spacing } from "../../theme"
import moment from "moment"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

export const RequestScreen: FC<StackScreenProps<NavigatorParamList, "request">> = observer(function RequestScreen() {
  const { recordStore } = useStores()

  useEffect(() => {
    if (!recordStore.signUpRequests.length) recordStore.listSignUpRequests()
  }, [recordStore.signUpRequests.length])

  return (<RequestView requests={recordStore.signUpRequests} next={() => recordStore.listSignUpRequests()} />)
})

const RequestView = observer(({ requests, next }: { requests: SignUpRequest[], next: () => void }) => (
  <Screen style={ROOT}>
    <Header headerText="注册请求" hasBack onLeftPress={goBack} />
    <FlatList
      onEndReached={next}
      data={requests}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
    />
  </Screen>
))

const INFO_LINE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
}

const LINE: ViewStyle = {
  flexDirection: 'row',
  paddingVertical: spacing[4],
  paddingHorizontal: spacing[6],
  borderBottomColor: color.line,
  borderBottomWidth: 1,
  alignItems: 'center',
  justifyContent: 'space-between',
}

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
