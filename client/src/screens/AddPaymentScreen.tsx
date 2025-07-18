import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  TextInput,
  Button,
  Title,
  Card,
  Text,
  ActivityIndicator,
  Menu,
  Divider,
} from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { paymentsAPI, CreatePaymentDto } from "../services/api";
import NotificationService from "../services/notifications";

interface AddPaymentScreenProps {
  navigation: any;
}

const AddPaymentScreen: React.FC<AddPaymentScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState<CreatePaymentDto>({
    amount: 0,
    receiver: "",
    status: "pending",
    method: "credit_card",
    description: "",
    currency: "USD",
  });
  const [loading, setLoading] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showMethodMenu, setShowMethodMenu] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!formData.receiver.trim()) {
      Alert.alert("Error", "Please enter receiver name");
      return;
    }

    if (formData.amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const response = await paymentsAPI.createPayment(formData);

      // Trigger notification based on payment status
      if (formData.status === "success") {
        await NotificationService.notifyPaymentSuccess({
          ...formData,
          _id: response._id || "new-payment",
        });
      } else if (formData.status === "failed") {
        await NotificationService.notifyPaymentFailed({
          ...formData,
          _id: response._id || "new-payment",
        });
      }

      Alert.alert("Success", "Payment has been created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create payment"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof CreatePaymentDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatMethod = (method: string) => {
    return method.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const testNotification = async () => {
    try {
      await NotificationService.scheduleLocalNotification(
        "Test Notification 🔔",
        "This is a test notification from the Payment Dashboard!",
        { type: "test" }
      );
      Alert.alert("Success", "Test notification sent!");
    } catch (error) {
      Alert.alert("Error", "Failed to send test notification");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Create New Payment</Title>
            <Text style={styles.subtitle}>Fill in the payment details</Text>

            <TextInput
              label="Amount *"
              value={formData.amount.toString()}
              onChangeText={(text) =>
                updateFormData("amount", parseFloat(text) || 0)
              }
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
              disabled={loading}
              left={<TextInput.Icon icon="currency-usd" />}
            />

            <TextInput
              label="Receiver *"
              value={formData.receiver}
              onChangeText={(text) => updateFormData("receiver", text)}
              mode="outlined"
              style={styles.input}
              disabled={loading}
              left={<TextInput.Icon icon="account" />}
            />

            <Menu
              visible={showStatusMenu}
              onDismiss={() => setShowStatusMenu(false)}
              anchor={
                <TextInput
                  label="Status *"
                  value={formatStatus(formData.status)}
                  mode="outlined"
                  style={styles.input}
                  editable={false}
                  onPressIn={() => setShowStatusMenu(true)}
                  right={<TextInput.Icon icon="chevron-down" />}
                  left={<TextInput.Icon icon="check-circle" />}
                />
              }
            >
              <Menu.Item
                onPress={() => {
                  updateFormData("status", "success");
                  setShowStatusMenu(false);
                }}
                title="Success"
              />
              <Menu.Item
                onPress={() => {
                  updateFormData("status", "failed");
                  setShowStatusMenu(false);
                }}
                title="Failed"
              />
              <Menu.Item
                onPress={() => {
                  updateFormData("status", "pending");
                  setShowStatusMenu(false);
                }}
                title="Pending"
              />
            </Menu>

            <Menu
              visible={showMethodMenu}
              onDismiss={() => setShowMethodMenu(false)}
              anchor={
                <TextInput
                  label="Payment Method *"
                  value={formatMethod(formData.method)}
                  mode="outlined"
                  style={styles.input}
                  editable={false}
                  onPressIn={() => setShowMethodMenu(true)}
                  right={<TextInput.Icon icon="chevron-down" />}
                  left={<TextInput.Icon icon="credit-card" />}
                />
              }
            >
              <Menu.Item
                onPress={() => {
                  updateFormData("method", "credit_card");
                  setShowMethodMenu(false);
                }}
                title="Credit Card"
              />
              <Menu.Item
                onPress={() => {
                  updateFormData("method", "debit_card");
                  setShowMethodMenu(false);
                }}
                title="Debit Card"
              />
              <Menu.Item
                onPress={() => {
                  updateFormData("method", "paypal");
                  setShowMethodMenu(false);
                }}
                title="PayPal"
              />
              <Menu.Item
                onPress={() => {
                  updateFormData("method", "bank_transfer");
                  setShowMethodMenu(false);
                }}
                title="Bank Transfer"
              />
              <Menu.Item
                onPress={() => {
                  updateFormData("method", "crypto");
                  setShowMethodMenu(false);
                }}
                title="Crypto"
              />
            </Menu>

            <TextInput
              label="Currency"
              value={formData.currency}
              onChangeText={(text) => updateFormData("currency", text)}
              mode="outlined"
              style={styles.input}
              disabled={loading}
              left={<TextInput.Icon icon="currency-usd" />}
            />

            <TextInput
              label="Description (Optional)"
              value={formData.description}
              onChangeText={(text) => updateFormData("description", text)}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
              disabled={loading}
              left={<TextInput.Icon icon="text" />}
            />

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={[styles.button, styles.cancelButton]}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={[styles.button, styles.submitButton]}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  "Create Payment"
                )}
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={styles.infoTitle}>Payment Simulation</Title>
            <Text style={styles.infoText}>
              This is a simulated payment system for demonstration purposes. No
              real money will be transferred.
            </Text>
            <Divider style={styles.divider} />
            <Text style={styles.infoText}>
              • Success: Payment will be marked as completed
            </Text>
            <Text style={styles.infoText}>
              • Failed: Payment will be marked as failed
            </Text>
            <Text style={styles.infoText}>
              • Pending: Payment will be marked as processing
            </Text>
            <Divider style={styles.divider} />
            <Button
              mode="outlined"
              onPress={testNotification}
              style={styles.testButton}
              icon="bell"
            >
              Test Notification
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
    fontSize: 16,
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
  },
  cancelButton: {
    marginRight: 8,
  },
  submitButton: {
    marginLeft: 8,
    backgroundColor: "#667eea",
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: "#e0e0e0",
  },
  testButton: {
    marginTop: 8,
    borderColor: "#667eea",
  },
});

export default AddPaymentScreen;
