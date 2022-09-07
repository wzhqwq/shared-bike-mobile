import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { RefreshControl, ScrollView, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { navigate, NavigatorParamList } from "../../navigators"
import { useNavigation } from "@react-navigation/native"
import { Statistic, useStores } from "../../models"
import { color, spacing } from "../../theme"
import { PieChart } from "react-native-chart-kit"
import { TouchableHighlight } from "react-native-gesture-handler"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
  padding: spacing[5],
  alignItems: 'center',
}

const PIE_BLOCK: ViewStyle = {
  borderRadius: spacing[2],
  width: 350,
  overflow: 'hidden',
}

type PieSeries = {
  name: string,
  count: number,
  color: string,
  legendFontColor: string,
  legendFontSize: number,
}

export const PropertyScreen: FC<StackScreenProps<NavigatorParamList, "property">> = observer(function PropertyScreen() {
  const { userStore } = useStores()
  const [refreshing, setRefreshing] = React.useState(false)

  const refresh = useCallback(() => {
    userStore.getStatistics().then(() => setRefreshing(false))
  }, [])

  return (<StatisticView statistic={userStore.statistic} refresh={refresh} refreshing={refreshing} />)
})

const StatisticView = observer(({ statistic, refreshing, refresh }: { statistic: Statistic, refreshing: boolean, refresh: () => void }) => {
  const [pieData, setPieData] = useState<PieSeries[]>([])

  useEffect(() => {
    if (statistic) {
      setPieData([
        { name: '空闲', count: statistic.availableCount, color: color.primary, legendFontColor: '#333', legendFontSize: 12 },
        { name: '使用中', count: statistic.occupiedCount, color: color.secondary, legendFontColor: '#333', legendFontSize: 12 },
        { name: '维护中', count: statistic.unavailableCount, color: "#888", legendFontColor: '#333', legendFontSize: 12 },
        { name: '已销毁', count: statistic.destroyedCount, color: "#333", legendFontColor: '#333', legendFontSize: 12 },
      ])
    }
    else refresh()
  }, [statistic])

  return (
    <View style={ROOT}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        {statistic && (
          <>
            <TouchableHighlight activeOpacity={0.7} underlayColor='#FFF' onPress={() => navigate('bikes')}>
              <PieChart
                style={PIE_BLOCK}
                data={pieData}
                width={350}
                height={200}
                accessor='count'
                backgroundColor={color.backgroundDarker}
                paddingLeft='15'
                chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
              />
            </TouchableHighlight>
          </>
        )}
      </ScrollView>
    </View>
  )
})
