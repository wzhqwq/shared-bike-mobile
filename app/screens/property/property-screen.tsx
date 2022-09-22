import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { RefreshControl, ScrollView, TouchableOpacity, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { navigate, NavigatorParamList } from "../../navigators"
import { BikeSeries, Statistic, useStores } from "../../models"
import { color, spacing } from "../../theme"
import { PieChart } from "react-native-chart-kit"
import { TouchableHighlight } from "react-native-gesture-handler"
import { Text } from "../../components"
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
  padding: spacing[5],
  alignItems: 'center',
}

const PIE_BLOCK: ViewStyle = {
  borderRadius: spacing[2],
  marginBottom: spacing[4],
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
  position: 'absolute',
  backgroundColor: '#e5e0cd',
  width: 140,
  paddingHorizontal: spacing[2],
  paddingVertical: spacing[1],
  borderRadius: spacing[2],
  bottom: -30,
  left: 5,
  shadowColor: '#000',
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 0.1,
}

const MAGIC_DEPTH_1: ViewStyle = {
  width: 135,
  height: 14,
  position: 'absolute',
  bottom: 10,
  left: -5,
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  transform: [
    { skewX: '55deg' },
  ]
}

const MAGIC_DEPTH_2: ViewStyle = {
  width: 5,
  height: 30,
  position: 'absolute',
  bottom: -22,
  left: 0,
  backgroundColor: '#e5e0cd',
  transform: [
    { skewY: '55deg' },
  ]
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

type PieSeries = {
  name: string,
  count: number,
  color: string,
  legendFontColor: string,
  legendFontSize: number,
}

export const PropertyScreen: FC<StackScreenProps<NavigatorParamList, "property">> = observer(function PropertyScreen() {
  const { userStore, entityStore } = useStores()
  const [refreshing, setRefreshing] = React.useState(false)

  const refresh = useCallback(() => {
    userStore.getStatistics()
      .then(() => entityStore.listSeries())
      .then(() => setRefreshing(false))
  }, [])

  useEffect(() => {
    refresh()
  }, [])

  return (<StatisticView
    statistic={userStore.statistic}
    seriesList={entityStore.seriesList}
    refresh={refresh}
    refreshing={refreshing}
  />)
})

type StatisticProps = {
  statistic: Statistic
  seriesList: BikeSeries[]
  refreshing: boolean
  refresh: () => void
}

const colors = [
  "#d9ed92",
  "#b5e48c",
  "#99d98c",
  "#76c893",
  "#52b69a",
  "#34a0a4",
  "#168aad",
  "#1a759f",
  "#1e6091",
  "#184e77",
]

const StatisticView = observer(({ statistic, refreshing, refresh, seriesList }: StatisticProps) => {
  const [pieData1, setPieData1] = useState<PieSeries[]>([])
  const [pieData2, setPieData2] = useState<PieSeries[]>([])

  useEffect(() => {
    if (statistic) {
      setPieData1([
        { name: '空闲', count: statistic.availableCount, color: color.primary, legendFontColor: '#333', legendFontSize: 12 },
        { name: '使用中', count: statistic.occupiedCount, color: color.secondary, legendFontColor: '#333', legendFontSize: 12 },
        { name: '维护中', count: statistic.unavailableCount, color: "#888", legendFontColor: '#333', legendFontSize: 12 },
        { name: '已注销', count: statistic.destroyedCount, color: "#333", legendFontColor: '#333', legendFontSize: 12 },
      ])
    }
  }, [statistic])

  useEffect(() => {
    if (seriesList.length) {
      setPieData2(seriesList.map((s, i) => (
        { name: s.name, count: s.amount, color: colors[i], legendFontColor: '#333', legendFontSize: 12 }
      )))
    }
  }, [seriesList.length])

  return (
    <View style={ROOT}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        {statistic && (
          <>
            <Text preset='bold'>单车状态分布</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigate('bikes')}>
              <PieChart
                style={PIE_BLOCK}
                data={pieData1}
                width={350}
                height={200}
                accessor='count'
                backgroundColor={color.backgroundDarker}
                paddingLeft='15'
                chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
                absolute
              />
            </TouchableOpacity>
            <Text preset='bold'>单车型号分布</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigate('seriesSet')}>
              <PieChart
                style={PIE_BLOCK}
                data={pieData2}
                width={350}
                height={220}
                accessor='count'
                backgroundColor={color.backgroundDarker}
                paddingLeft='20'
                chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
                absolute
              />
            </TouchableOpacity>
            <View style={INFO_GROUP}>
              <View style={INFO_GROUP_ITEM}>
                <Text preset='fieldLabel' text='本月支出' />
                <Text preset='header' text={statistic.expenditure + ' 元'} />
              </View>
              <View style={INFO_GROUP_DIVIDER} />
              <TouchableHighlight activeOpacity={0.9} underlayColor='#FFF5' onPress={() => navigate('incomeSet')} style={INFO_GROUP_HIGHLIGHT}>
                <View style={INFO_GROUP_ITEM}>
                  <Text preset='fieldLabel' text='本月收入' />
                  <Text preset='header' text={statistic.income + ' 元'} />
                </View>
              </TouchableHighlight>
              <View style={INFO_GROUP_DIVIDER} />
              <TouchableHighlight activeOpacity={0.9} underlayColor='#FFF5' onPress={() => navigate('billTotal')} style={INFO_GROUP_HIGHLIGHT}>
                <View style={INFO_GROUP_ITEM}>
                  <Text preset='fieldLabel' text='总账本' />
                  <MaterialIcons name='account-balance-wallet' size={36} color={color.primary} />
                </View>
              </TouchableHighlight>
              <View style={MAGIC_DEPTH_1} />
              <View style={MAGIC_DEPTH_2} />
              <View style={BUTTON_GROUP}>
                <TouchableHighlight activeOpacity={0.9} underlayColor='#FFF5' onPress={() => navigate('')} style={INFO_GROUP_HIGHLIGHT}>
                  <MaterialIcons name='pedal-bike' size={24} color={color.primary} />
                </TouchableHighlight>
                <TouchableHighlight activeOpacity={0.9} underlayColor='#FFF5' onPress={() => navigate('')} style={INFO_GROUP_HIGHLIGHT}>
                  <MaterialCommunityIcons name='gift' size={24} color={color.primary} />
                </TouchableHighlight>
                <TouchableHighlight activeOpacity={0.9} underlayColor='#FFF5' onPress={() => navigate('')} style={INFO_GROUP_HIGHLIGHT}>
                  <MaterialCommunityIcons name='cash' size={24} color={color.primary} />
                </TouchableHighlight>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  )
})
