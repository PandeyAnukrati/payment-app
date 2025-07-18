import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  TextInput,
  Button,
  Title,
  Card,
  Text,
  ActivityIndicator,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { authAPI } from "../services/api";
import { storeToken, storeUser } from "../utils/auth";

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login({ username, password });
      await storeToken(response.access_token);
      await storeUser(response.user);
      onLogin();
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Payment Dashboard</Title>
              <Text style={styles.subtitle}>Sign in to continue</Text>

              <TextInput
                label="Username"
                value={username}
                onChangeText={setUsername}
                mode="outlined"
                style={styles.input}
                autoCapitalize="none"
                disabled={loading}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                style={styles.input}
                disabled={loading}
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.button}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : "Sign In"}
              </Button>

              <View style={styles.credentialsContainer}>
                <Text style={styles.credentialsTitle}>Demo Credentials:</Text>
                <Text style={styles.credentialsText}>
                  Admin: admin / admin123
                </Text>
                <Text style={styles.credentialsText}>
                  Viewer: viewer / viewer123
                </Text>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    elevation: 8,
    borderRadius: 12,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    color: "#666",
    fontSize: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  credentialsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  credentialsTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  credentialsText: {
    color: "#666",
    fontSize: 14,
    marginBottom: 4,
  },
});

export default LoginScreen;
