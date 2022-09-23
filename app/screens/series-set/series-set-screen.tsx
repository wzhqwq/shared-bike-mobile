import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { RefreshControl, ScrollView, useWindowDimensions, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { BottomModal, Button, Header, Screen, Text, TextField } from "../../components"
import { BikeSeries, BikeSeriesModel, useStores } from "../../models"
import { color, spacing } from "../../theme"
import { Feather, MaterialIcons } from "@expo/vector-icons"
import { PieChart } from "react-native-chart-kit"
import { PieSeries, spreadColors } from "../../global"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

export const SeriesSetScreen: FC<StackScreenProps<NavigatorParamList, "seriesSet">> = observer(function SeriesSetScreen() {
  const { entityStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  const [show, setShow] = useState(false)
  const [series, setSeries] = useState<BikeSeries>(null)
  const [pieData, setPieData] = useState<PieSeries[]>([])
 
  useEffect(() => {
    if (!entityStore.seriesList.length) entityStore.listSeries()
  }, [])

  useEffect(() => {
    if (entityStore.seriesList.length) {
      setPieData(entityStore.seriesList.map((s, i) => (
        { name: s.name, count: s.amount, color: spreadColors[i], legendFontColor: '#333', legendFontSize: 12 }
      )))
    }
  }, [entityStore.seriesListVersion])

  const refresh = useCallback(() => {
    entityStore.listSeries().then(() => setRefreshing(false))
  }, [])

  const add = useCallback(() => {
    setSeries(null)
    setShow(true)
  }, [])

  const modify = useCallback((series: BikeSeries) => {
    setSeries(series)
    setShow(true)
  }, [])

  const remove = useCallback((seriesId: number) => {
    entityStore.removeSeries(seriesId)
  }, [])

  return (
    <Screen style={ROOT}>
      <Header headerText="管理单车型号" hasBack rightIcon={<MaterialIcons name='add' size={24} />} onLeftPress={goBack} onRightPress={add} />
      <PieChart
        data={pieData}
        width={useWindowDimensions().width}
        height={200}
        accessor='count'
        backgroundColor={color.background}
        paddingLeft='10'
        chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
        absolute
      />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        {useMemo(
          () => entityStore.seriesList.map(s => (
            <OneSeries s={s} key={s.id} onModify={modify} onRemove={remove} />
          )),
          [entityStore.seriesListVersion]
        )}
      </ScrollView>
      <SetSeriesModal show={show} onClose={() => setShow(false)} series={series} />
    </Screen>
  )
})

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

const REMOVE: ViewStyle = {
  backgroundColor: color.error,
  marginLeft: spacing[2],
}

const OneSeries: FC<{ s: BikeSeries, onModify: (s: BikeSeries) => void, onRemove: (id: number) => void }> = observer(({ s, onModify, onRemove }) => (
  <View style={LINE}>
    <View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>型号名称：</Text>
        <Text>{s.name}</Text>
      </View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>现役数量：</Text>
        <Text>{s.amount}</Text>
      </View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>最高骑行总里程：</Text>
        <Text>{s.mileage_limit} 公里</Text>
      </View>
      <View style={INFO_LINE}>
        <Text preset='fieldLabel'>押金：</Text>
        <Text>{s.rent} 元</Text>
      </View>
    </View>
    <View style={INFO_LINE}>
      <Button onPress={() => onModify(s)}><Feather name='edit-2' color='white' size={18} /></Button>
      <Button onPress={() => onRemove(s.id)} style={REMOVE}><Feather name='trash' color='white' size={18} /></Button>
    </View>
  </View>
))

const SetSeriesModal: FC<{ show: boolean, series: BikeSeries, onClose: () => void }> = ({ show, series, onClose }) => {
  const { entityStore } = useStores()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState('')
  const [limit, setLimit] = useState('')
  const [rent, setRent] = useState('')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (show) {
      setName(series?.name ?? '')
      setLimit(series?.mileage_limit.toString() ?? '')
      setRent(series?.rent ?? '')
    }
    else {
      setFocused(false)
    }
  }, [show])

  const submit = useCallback(() => {
    setLoading(true)
    let p: Promise<boolean>
    if (series) {
      p = series.modify(name, parseInt(limit), rent)
    }
    else {
      p = entityStore.addSeries(BikeSeriesModel.create({ name, mileage_limit: parseInt(limit), rent, id: -1 }))
    }
    p.then(success => {
      setLoading(false)
      if (success) onClose()
    })
  }, [series, name, limit, rent])

  const ok = useMemo(() => {
    if (!name || !limit || !rent) return false
    if (parseInt(limit) <= 0) return false
    if (parseFloat(rent) <= 0) return false
    return true
  }, [name, limit, rent])

  return (
    <BottomModal onClose={onClose} show={show} title={series ? '修改车型' : '创建车型'} up={focused}>
      <TextField label="型号名称" onChangeText={t => setName(t)} value={name} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} returnKeyType='done' />
      <TextField label="最高骑行总里程（公里）" keyboardType='number-pad' onChangeText={t => setLimit(t)} value={limit} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} returnKeyType='done' />
      <TextField label="押金（元）" keyboardType='numbers-and-punctuation' onChangeText={t => setRent(t.split(/\D/).slice(0, 2).join('.'))} value={rent} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} returnKeyType='done' />
      <Button loading={loading} onPress={submit} text={series ? '修改' : '创建'} disabled={!ok} />
    </BottomModal>
  )
}
