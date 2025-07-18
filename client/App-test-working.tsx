import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function App() {
  console.log("App component rendering...");

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World!</Text>
      <Text style={styles.text}>Payment Dashboard Test</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});
