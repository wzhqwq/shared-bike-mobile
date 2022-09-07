/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import React from "react"
import { useColorScheme } from "react-native"
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { BikesScreen, ConfigSetScreen, LoginScreen, MemberScreen, ProfileScreen, PropertyScreen, RequestScreen, RideScreen, ShopScreen, SignUpScreen, WelcomeScreen } from "../screens"
import { navigationRef, useBackButtonHandler } from "./navigation-utilities"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import { color } from "../theme"

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, we
 * recommend using your MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 */
export type NavigatorParamList = {
  welcome: undefined
  customer: undefined
  maintainer: undefined
  manager: undefined
  login: undefined
  ride: undefined
  shop: undefined
  profile: undefined
  signUp: undefined
  configSet: undefined
  seriesSet: undefined
  souvenirSet: undefined
  editProfile: undefined
  property: undefined
  geoEdit: undefined
  member: undefined
  request: undefined
  bikes: undefined
}

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<NavigatorParamList>()

const CTab = createBottomTabNavigator<NavigatorParamList>()

const CustomerTabs = () => {
  return (
    <CTab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        switch (route.name) {
          case 'ride':
            return <MaterialIcons size={size} name='pedal-bike' color={color} />
          case 'shop':
            return <Feather size={20} name='package' color={color} />
          default:
            return <MaterialIcons size={size} name='person-outline' color={color} />
        }
      },
      title: route.name === 'ride' ? '骑行' : (route.name === 'shop' ? '兑换' : '我'),
      headerBackgroundContainerStyle: {
        backgroundColor: color.background,
      },
      tabBarActiveTintColor: color.primaryDarker,
    })}>
      <CTab.Screen name="ride" component={RideScreen} />
      <CTab.Screen name="shop" component={ShopScreen} />
      <CTab.Screen name="profile" component={ProfileScreen} />
    </CTab.Navigator>
  )
}

const MTTab = createBottomTabNavigator<NavigatorParamList>()

const MaintainerTabs = () => {
  return (
    <MTTab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        switch (route.name) {
          case 'ride':
            return <MaterialIcons size={size} name='pedal-bike' color={color} />
          case 'shop':
            return <Feather size={20} name='package' color={color} />
          default:
            return <MaterialIcons size={size} name='person-outline' color={color} />
        }
      },
      title: route.name === 'ride' ? '骑行' : (route.name === 'shop' ? '兑换' : '我'),
      headerBackgroundContainerStyle: {
        backgroundColor: color.background,
      },
      tabBarActiveTintColor: color.primaryDarker,
    })}>
      <MTTab.Screen name="ride" component={RideScreen} />
      <MTTab.Screen name="shop" component={ShopScreen} />
      <MTTab.Screen name="profile" component={ProfileScreen} />
    </MTTab.Navigator>
  )
}

const MNTab = createBottomTabNavigator<NavigatorParamList>()

const ManagerTabs = () => {
  return (
    <MNTab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        switch (route.name) {
          case 'property':
            return <FontAwesome5 name='chart-pie' size={20} color={color} />
          case 'geoEdit':
            return <MaterialIcons size={size} name='pin-drop' color={color} />
          default:
            return <MaterialIcons size={size} name='person-outline' color={color} />
        }
      },
      title: route.name === 'property' ? '资产管理' : (route.name === 'geoEdit' ? '区域管理' : '我'),
      headerBackgroundContainerStyle: {
        backgroundColor: color.background,
      },
      tabBarActiveTintColor: color.primaryDarker,
    })}>
      <MNTab.Screen name="property" component={PropertyScreen} />
      <MNTab.Screen name="geoEdit" component={ShopScreen} />
      <MNTab.Screen name="profile" component={ProfileScreen} />
    </MNTab.Navigator>
  )
}

const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="welcome"
    >
      <Stack.Screen name="welcome" component={WelcomeScreen} />
      <Stack.Screen name="customer" component={CustomerTabs} />
      <Stack.Screen name="maintainer" component={MaintainerTabs} />
      <Stack.Screen name="manager" component={ManagerTabs} />
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="signUp" component={SignUpScreen} />
      <Stack.Screen name="configSet" component={ConfigSetScreen} />
      <Stack.Screen name="member" component={MemberScreen} />
      <Stack.Screen name="request" component={RequestScreen} />
      <Stack.Screen name="bikes" component={BikesScreen} />
    </Stack.Navigator>
  )
}

interface NavigationProps extends Partial<React.ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = (props: NavigationProps) => {
  const colorScheme = useColorScheme()
  useBackButtonHandler(canExit)
  return (
    <NavigationContainer
      ref={navigationRef}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      {...props}
    >
      <AppStack />
    </NavigationContainer>
  )
}

AppNavigator.displayName = "AppNavigator"

/**
 * A list of routes from which we're allowed to leave the app when
 * the user presses the back button on Android.
 *
 * Anything not on this list will be a standard `back` action in
 * react-navigation.
 *
 * `canExit` is used in ./app/app.tsx in the `useBackButtonHandler` hook.
 */
const exitRoutes = ["customer"]
export const canExit = (routeName: string) => exitRoutes.includes(routeName)
