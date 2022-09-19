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
      setPieData2(seriesList.map((s, i) => ({ name: s.name, count: s.amount, color: colors[i], legendFontColor: '#333', legendFontSize: 12 })))
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
          </>
        )}
      </ScrollView>
    </View>
  )
})
