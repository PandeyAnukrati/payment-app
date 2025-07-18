import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { getToken, getUser, logout } from "./src/utils/auth";
import WebSocketService from "./src/services/websocket";
import NotificationService from "./src/services/notifications";

// Screens
import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import TransactionListScreen from "./src/screens/TransactionListScreen";
import TransactionDetailsScreen from "./src/screens/TransactionDetailsScreen";
import AddPaymentScreen from "./src/screens/AddPaymentScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#667eea",
    secondary: "#764ba2",
  },
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 18, marginBottom: 10 }}>
            Something went wrong
          </Text>
          <Text style={{ textAlign: "center" }}>Please restart the app</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function TabNavigator({ onLogout }: { onLogout: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          if (route.name === "Dashboard") {
            iconName = "dashboard";
          } else if (route.name === "Transactions") {
            iconName = "list";
          } else {
            iconName = "help";
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#667eea",
        tabBarInactiveTintColor: "gray",
        headerStyle: {
          backgroundColor: "#667eea",
        },
        headerTintColor: "white",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: "Dashboard",
          headerRight: () => (
            <MaterialIcons
              name="logout"
              size={24}
              color="white"
              style={{ marginRight: 16 }}
              onPress={onLogout}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionListScreen}
        options={{
          title: "Transactions",
          headerRight: () => (
            <MaterialIcons
              name="logout"
              size={24}
              color="white"
              style={{ marginRight: 16 }}
              onPress={onLogout}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator({ onLogout }: { onLogout: () => void }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" options={{ headerShown: false }}>
        {(props) => <TabNavigator {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen
        name="TransactionDetails"
        component={TransactionDetailsScreen}
        options={{
          title: "Transaction Details",
          headerStyle: {
            backgroundColor: "#667eea",
          },
          headerTintColor: "white",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="AddPayment"
        component={AddPaymentScreen}
        options={{
          title: "Add Payment",
          headerStyle: {
            backgroundColor: "#667eea",
          },
          headerTintColor: "white",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("App useEffect triggered");
    checkAuthStatus();
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      const hasPermission = await NotificationService.requestPermissions();
      if (hasPermission) {
        await NotificationService.getExpoPushToken();
        NotificationService.setupNotificationListeners();
      }
    } catch (error) {
      console.error("Error setting up notifications:", error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      console.log("Checking auth status...");
      const token = await getToken();
      const user = await getUser();
      console.log("Token:", !!token, "User:", !!user);
      setIsAuthenticated(!!(token && user));
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
    } finally {
      console.log("Setting loading to false");
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await logout();
    // Disconnect WebSocket when logging out
    WebSocketService.disconnect();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={{ marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar style="light" />
          {isAuthenticated ? (
            <AppNavigator onLogout={handleLogout} />
          ) : (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Login">
                {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
              </Stack.Screen>
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </PaperProvider>
    </ErrorBoundary>
  );
}
