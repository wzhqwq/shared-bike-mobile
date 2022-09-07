import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { ScrollView, TextStyle, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { goBack, NavigatorParamList } from "../../navigators"
import { Button, Header, Screen, Text, TextField } from "../../components"
import { Configuration, ConfigurationModel, useStores } from "../../models"
import { color, spacing } from "../../theme"
import { MaterialIcons } from "@expo/vector-icons"
import global from "../../global"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
}

const CONTAINER: ViewStyle = {
  paddingHorizontal: spacing[6],
}

const LEFT: ViewStyle = {
  position: 'absolute',
  marginLeft: -25,
  marginTop: 44,
}

const BUTTON: ViewStyle = {
  marginTop: spacing[6],
  marginBottom: 200,
}

const HEADER: TextStyle = {
  marginTop: spacing[6],
}

const toValue = (c: Configuration) => c.is_float ? c.value.toFixed(2) : (Math.abs(c.value).toString())

export const ConfigSetScreen: FC<StackScreenProps<NavigatorParamList, "configSet">> = observer(function ConfigSetScreen() {
  // Pull in one of our MST stores
  const { entityStore } = useStores()
  const [values, setValues] = useState([])
  const [loading, setLoading] = useState(false)

  const configs = useMemo(() => {
    if (!entityStore.configs.length) return []
    const groups: { name: string, list: Configuration[] }[] = []
    entityStore.configs.forEach(c => {
      const category = c.key.split('-')[0]
      let list = groups.find(g => g.name === category)?.list
      if (!list) {
        list = []
        groups.push({ name: category, list })
      }
      list.push(c)
    })
    setValues(entityStore.configs.map(toValue))
    return groups
  }, [entityStore.configs.length])

  useEffect(() => {
    if (!entityStore.configs.length) entityStore.fetchConfig()
  }, [])

  const modify = useCallback(() => {
    const modifies: Configuration[] = []
    entityStore.configs.forEach(c => {
      if (values[c.id - 1] === toValue(c)) return
      modifies.push(ConfigurationModel.create({
        id: c.id,
        value: parseFloat(values[c.id - 1]) * (c.value < 0 ? -1 : 1)
      }))
    })
    if (!modifies.length) return

    setLoading(true)
    entityStore.modifyConfigs(modifies).then(success => {
      if (success) global.toast.show('系统设置已更新', { type: 'success' })
      setLoading(false)
    })
  }, [values])

  return (
    <Screen style={ROOT}>
      <Header headerText="系统设置" hasBack onLeftPress={() => goBack()} />
      <ScrollView style={CONTAINER}>
        {configs.map(({ name, list }) => (
          <View key={name}>
            <Text preset='header' text={name} style={HEADER} />
            {list.map(({ key, id, is_float: isFloat, value }) => (
              <View key={id}>
                {value < 0 && (<MaterialIcons name='remove' style={LEFT} size={20} />)}
                <TextField
                  label={key.split('-')[1] + (value < 0 ? '（负值）' : '')}
                  value={values[id - 1]}
                  keyboardType={isFloat ? 'numbers-and-punctuation' : 'number-pad'}
                  onChangeText={t => setValues(vs => vs.map((v, i) => i === id - 1 ? t : v))}
                />
              </View>
            ))}
          </View>
        ))}
        <Button text='更新设置' style={BUTTON} loading={loading} onPress={modify} />
        <View />
      </ScrollView>
    </Screen>
  )
})
