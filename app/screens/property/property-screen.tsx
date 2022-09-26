import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { RefreshControl, ScrollView, TouchableOpacity, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { navigate, NavigatorParamList } from "../../navigators"
import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { PieChart } from "react-native-chart-kit"
import { TouchableHighlight } from "react-native-gesture-handler"
import { Text } from "../../components"
import { MaterialCommunityIcons, MaterialIcons, Entypo } from "@expo/vector-icons"
import { LIST, LIST_ITEM, LIST_ITEM_TEXT, PieSeries } from "../../global"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
  paddingTop: spacing[5],
  alignItems: 'center',
}

const CONTAINER: ViewStyle = {
  paddingHorizontal: 10,
}

const PIE_BLOCK: ViewStyle = {
  borderRadius: spacing[2],
  marginBottom: spacing[4],
  paddingRight: spacing[4],
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: color.backgroundDarker,
}

const INFO_GROUP: ViewStyle = {
  borderRadius: spacing[2],
  marginBottom: spacing[4],
  paddingVertical: spacing[4],
  flexDirection: 'row',
  backgroundColor: color.backgroundDarker,
  alignItems: 'center',
  justifyContent: 'space-evenly',
}

const BUTTON_GROUP: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-evenly',
  backgroundColor: color.backgroundDarker,
  borderColor: '#0002',
  borderWidth: 1,
  width: 140,
  paddingHorizontal: spacing[2],
  paddingVertical: spacing[1],
  borderRadius: spacing[2],
  marginTop: -spacing[6],
  marginLeft: -4,
  shadowColor: '#000',
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 0.1,
}

const INFO_GROUP_HIGHLIGHT: ViewStyle = {
  flexGrow: 1,
  marginHorizontal: spacing[1],
  borderRadius: spacing[1],
  paddingHorizontal: spacing[2],
  paddingVertical: spacing[1],
}

const INFO_GROUP_ITEM: ViewStyle = {
  alignItems: 'center',
}

const INFO_GROUP_DIVIDER: ViewStyle = {
  height: 40,
  width: 1,
  backgroundColor: 'rgba(0,0,0,0.1)'
}

export const PropertyScreen: FC<StackScreenProps<NavigatorParamList, "property">> = observer(function PropertyScreen() {
  const { userStore, entityStore } = useStores()
  const [refreshing, setRefreshing] = React.useState(false)
  const [pieData, setPieData] = useState<PieSeries[]>([])

  const { statistic } = userStore

  const refresh = useCallback(() => {
    userStore.getStatistics()
      .then(() => entityStore.listSeries())
      .then(() => setRefreshing(false))
  }, [])

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    if (statistic) {
      setPieData([
        { name: '空闲', count: statistic.availableCount, color: color.secondary, legendFontColor: '#333', legendFontSize: 12 },
        { name: '使用中', count: statistic.occupiedCount, color: color.primary, legendFontColor: '#333', legendFontSize: 12 },
        { name: '维护中', count: statistic.unavailableCount, color: "#888", legendFontColor: '#333', legendFontSize: 12 },
        { name: '已注销', count: statistic.destroyedCount, color: "#333", legendFontColor: '#333', legendFontSize: 12 },
      ])
    }
  }, [statistic])

  return (
    <View style={ROOT}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        contentContainerStyle={CONTAINER}
      >
        {statistic && (
          <>
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigate('bikes')}>
              <View style={PIE_BLOCK}>
                <PieChart
                  data={pieData}
                  width={320}
                  height={180}
                  accessor='count'
                  backgroundColor={color.transparent}
                  paddingLeft='10'
                  chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
                  absolute
                />
                <Entypo name='chevron-small-right' size={24} />
              </View>
            </TouchableOpacity>

            <View style={INFO_GROUP}>
              <View style={INFO_GROUP_ITEM}>
                <Text preset='fieldLabel' text='本月支出' />
                <Text preset='header' text={statistic.expenditure + ' 元'} />
              </View>
              <View style={INFO_GROUP_DIVIDER} />
              <View style={INFO_GROUP_ITEM}>
                <Text preset='fieldLabel' text='本月收入' />
                <Text preset='header' text={statistic.income + ' 元'} />
              </View>
              <View style={INFO_GROUP_DIVIDER} />
              <TouchableHighlight activeOpacity={0.9} underlayColor='#FFF5' onPress={() => navigate('billTotal')} style={INFO_GROUP_HIGHLIGHT}>
                <View style={INFO_GROUP_ITEM}>
                  <Text preset='fieldLabel' text='总账本' />
                  <MaterialIcons name='account-balance-wallet' size={32} color={color.primary} />
                </View>
              </TouchableHighlight>
            </View>
            <View style={BUTTON_GROUP}>
              <TouchableHighlight activeOpacity={0.9} underlayColor='#FFF5' onPress={() => navigate('billOfBike')} style={INFO_GROUP_HIGHLIGHT}>
                <MaterialIcons name='pedal-bike' size={24} color={color.primary} />
              </TouchableHighlight>
              <TouchableHighlight activeOpacity={0.9} underlayColor='#FFF5' onPress={() => navigate('billOfSouvenir')} style={INFO_GROUP_HIGHLIGHT}>
                <MaterialCommunityIcons name='gift' size={24} color={color.primary} />
              </TouchableHighlight>
              <TouchableHighlight activeOpacity={0.9} underlayColor='#FFF5' onPress={() => navigate('billOfOther')} style={INFO_GROUP_HIGHLIGHT}>
                <MaterialIcons name='more-horiz' size={24} color={color.primary} />
              </TouchableHighlight>
            </View>

            <View style={LIST}>
              <TouchableHighlight activeOpacity={0.7} underlayColor='#FFF' onPress={() => navigate('seriesSet')}>
                <View style={LIST_ITEM}>
                  <Text style={LIST_ITEM_TEXT}>管理单车型号</Text>
                  <Entypo name='chevron-small-right' size={24} />
                </View>
              </TouchableHighlight>
              <TouchableHighlight activeOpacity={0.7} underlayColor='#FFF' onPress={() => navigate('souvenirSet')}>
                <View style={LIST_ITEM}>
                  <Text style={LIST_ITEM_TEXT}>管理纪念品种类</Text>
                  <Entypo name='chevron-small-right' size={24} />
                </View>
              </TouchableHighlight>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  )
})
