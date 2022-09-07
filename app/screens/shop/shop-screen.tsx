import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Image, ImageStyle, Modal, RefreshControl, ScrollView, TextStyle, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { BottomModal, Button, Full, Text } from "../../components"
import { color, spacing } from "../../theme"
import { Customer, ExchangeRecordModel, Souvenir, useStores } from "../../models"
import { MaterialIcons } from "@expo/vector-icons"
import global from "../../global"
import { SafeAreaView } from "react-native-safe-area-context"

const ROOT: ViewStyle = {
  justifyContent: "center",
  flex: 1,
  backgroundColor: color.background,
}

const SOUVENIR_CONTAINER: ViewStyle = {
  padding: spacing[4],
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
}

const SOUVENIR: ViewStyle = {
  padding: spacing[4],
  borderRadius: spacing[2],
  backgroundColor: color.backgroundDarker,
  width: 180,
  marginBottom: spacing[4],
}

const IMAGE: ImageStyle = {
  width: 100,
  height: 100,
  borderRadius: spacing[0],
  alignSelf: 'center',
  resizeMode: 'contain',
  marginBottom: spacing[2],
}

const TITLE: TextStyle = {
  fontSize: 20,
}

const BUTTON: ViewStyle = {
  width: 40,
  height: 40,
  flexShrink: 0,
}

const PRICE_UNAVAILABLE: TextStyle = {
  color: color.error
}

const INFO_LINE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
}

const BOTTOM_CONTAINER: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
}

const INFO_CONTAINER: ViewStyle = {
  flexGrow: 1,
}


export const ShopScreen: FC<StackScreenProps<NavigatorParamList, "shop">> = observer(function ShopScreen() {
  const [userPoints, setUserPoints] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [show, setShow] = useState(false)
  const [souvenir, setSouvenir] = useState<Souvenir>(null)

  const { entityStore, userStore } = useStores()

  useEffect(() => {
    if (!entityStore.souvenirs.length) entityStore.listSouvenirs()
    if (!userStore.me) userStore.fetch()
  }, [])

  useEffect(() => {
    if (userStore.me) {
      setUserPoints((userStore.me.extended as Customer).points)
    }
  }, [userStore.me])

  const refresh = useCallback(() => {
    entityStore.listSouvenirs().then(() => setRefreshing(false))
  }, [])

  return (
    <View style={ROOT}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        {entityStore.souvenirs.length ? (
          <View style={SOUVENIR_CONTAINER}>
            {entityStore.souvenirs?.map((s, i) => (
              <View style={SOUVENIR} key={i}>
                <Image source={s.image_url} style={IMAGE} />
                <Text style={TITLE}>{s.name}</Text>
                <View style={BOTTOM_CONTAINER}>
                  <View style={INFO_CONTAINER}>
                    <View style={INFO_LINE}>
                      <Text preset='fieldLabel'>兑换点数：</Text>
                      <Text style={s.price > userPoints ? PRICE_UNAVAILABLE : {}}>{s.price}</Text>
                    </View>
                    <View style={INFO_LINE}>
                      <Text preset='fieldLabel'>库存数：</Text>
                      <Text style={s.total_amount === 0 ? PRICE_UNAVAILABLE : {}}>{s.total_amount}</Text>
                    </View>
                  </View>
                  <Button style={BUTTON} disabled={s.price > userPoints || s.total_amount === 0} onPress={() => {
                    setShow(true)
                    setSouvenir(s)
                  }}>
                    <MaterialIcons name='shopping-cart' color='white' size={18} />
                  </Button>
                </View>
              </View>
            ))}
          </View>
        ) : (<Full message='暂无纪念品' />)}
      </ScrollView>
      <PurchasePage show={show} onClose={() => setShow(false)} souvenir={souvenir} />
    </View>
  )
})

const EXCHANGE_CONTAINER: ViewStyle = {
  justifyContent: 'flex-end',
  flex: 1,
}
const EXCHANGE_MODAL: ViewStyle = {
  height: 500,
  backgroundColor: color.background,
  borderRadius: spacing[2],
  shadowColor: '#000',
  shadowRadius: 2,
  shadowOpacity: 0.3,
  shadowOffset: { width: -0.5, height: 0.5 },
  marginHorizontal: spacing[4],
  padding: spacing[4],
}

const IMAGE_LARGE: ImageStyle = {
  ...IMAGE,
  width: 300,
  height: 300,
  marginVertical: spacing[2],
}

const MODAL_HEADER: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const COUNT_CONTAINER: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
}

const BUTTON_CIRCLE: ViewStyle = {
  marginHorizontal: spacing[3],
  backgroundColor: color.secondary,
  width: 38,
  height: 38,
  borderRadius: 19,
}

const PurchasePage = ({ show, souvenir, onClose }: { show: boolean, souvenir: Souvenir, onClose: () => void }) => {
  const { recordStore, userStore, entityStore } = useStores()
  const [count, setCount] = useState(1)
  const [userPoints, setUserPoints] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userStore.me) {
      setUserPoints((userStore.me.extended as Customer).points)
    }
  }, [userStore.me])

  useEffect(() => {
    if (show) setCount(1)
  }, [show])

  const exchange = useCallback(() => {
    setLoading(true)
    recordStore.exchange(ExchangeRecordModel.create({ souvenir_id: souvenir.id, amount: count })).then(success => {
      if (success) {
        global.toast.show('兑换成功', { type: 'success' })
        onClose()
        entityStore.listSouvenirs()
      }
      setLoading(false)
    })
  }, [count, souvenir])

  return (
    <BottomModal onClose={onClose} show={show} title='兑换纪念品'>
      {
        Boolean(souvenir && userPoints) && (
          <>
            <Image source={souvenir.image_url} style={IMAGE_LARGE} />
            <Text style={TITLE}>{souvenir.name}</Text>
            <View style={INFO_CONTAINER}>
              <View style={INFO_LINE}>
                <Text preset='fieldLabel'>兑换点数：</Text>
                <Text style={souvenir.price > userPoints ? PRICE_UNAVAILABLE : {}}>{souvenir.price}</Text>
              </View>
              <View style={INFO_LINE}>
                <Text preset='fieldLabel'>库存数：</Text>
                <Text style={souvenir.total_amount === 0 ? PRICE_UNAVAILABLE : {}}>{souvenir.total_amount}</Text>
              </View>
            </View>
            <View style={BOTTOM_CONTAINER}>
              <View style={COUNT_CONTAINER}>
                <Text>设置数量</Text>
                <Button onPress={() => setCount(c => c - 1)} style={BUTTON_CIRCLE} disabled={count <= 1}>
                  <MaterialIcons name='remove' size={24} />
                </Button>
                <Text preset='header'>{count}</Text>
                <Button onPress={() => setCount(c => c + 1)} style={BUTTON_CIRCLE} disabled={
                  (count + 1) * souvenir.price > userPoints || count >= souvenir.total_amount
                }>
                  <MaterialIcons name='add' size={24} />
                </Button>
              </View>
              <Button loading={loading} onPress={exchange} text='确定兑换' />
            </View>
          </>
        )
      }
    </BottomModal>
  )
}