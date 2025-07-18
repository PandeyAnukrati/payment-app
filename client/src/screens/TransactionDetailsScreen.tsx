import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Card,
  Title,
  Text,
  Chip,
  Divider,
  ActivityIndicator,
  Avatar,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { paymentsAPI, Payment } from "../services/api";

interface TransactionDetailsScreenProps {
  route: any;
  navigation: any;
}

const TransactionDetailsScreen: React.FC<TransactionDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { paymentId } = route.params;
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentDetails();
  }, [paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      const data = await paymentsAPI.getPayment(paymentId);
      setPayment(data);
    } catch (error) {
      console.error("Error fetching payment details:", error);
      Alert.alert("Error", "Failed to fetch payment details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "#4CAF50";
      case "failed":
        return "#F44336";
      case "pending":
        return "#FF9800";
      default:
        return "#666";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "credit_card":
      case "debit_card":
        return "credit-card";
      case "paypal":
        return "account-balance-wallet";
      case "bank_transfer":
        return "account-balance";
      case "crypto":
        return "currency-bitcoin";
      default:
        return "payment";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: payment?.currency || "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMethod = (method: string) => {
    return method.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading transaction details...</Text>
      </View>
    );
  }

  if (!payment) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Transaction not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <Avatar.Icon
            size={60}
            icon={getMethodIcon(payment.method)}
            style={[
              styles.headerAvatar,
              { backgroundColor: getStatusColor(payment.status) },
            ]}
          />
          <View style={styles.headerInfo}>
            <Title style={styles.amount}>
              {formatCurrency(payment.amount)}
            </Title>
            <Text style={styles.receiver}>To: {payment.receiver}</Text>
            <Chip
              mode="outlined"
              style={[
                styles.statusChip,
                { borderColor: getStatusColor(payment.status) },
              ]}
              textStyle={{ color: getStatusColor(payment.status) }}
            >
              {payment.status.toUpperCase()}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.detailsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Transaction Details</Title>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailValue}>{payment.transactionId}</Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>
              {formatMethod(payment.method)}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Currency</Text>
            <Text style={styles.detailValue}>{payment.currency}</Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created At</Text>
            <Text style={styles.detailValue}>
              {formatDate(payment.createdAt)}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last Updated</Text>
            <Text style={styles.detailValue}>
              {formatDate(payment.updatedAt)}
            </Text>
          </View>

          {payment.description && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.descriptionValue}>
                  {payment.description}
                </Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.statusCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Status Information</Title>

          <View style={styles.statusInfo}>
            <MaterialIcons
              name={
                payment.status === "success"
                  ? "check-circle"
                  : payment.status === "failed"
                  ? "error"
                  : "schedule"
              }
              size={24}
              color={getStatusColor(payment.status)}
            />
            <View style={styles.statusText}>
              <Text style={styles.statusTitle}>
                {payment.status === "success"
                  ? "Payment Successful"
                  : payment.status === "failed"
                  ? "Payment Failed"
                  : "Payment Pending"}
              </Text>
              <Text style={styles.statusDescription}>
                {payment.status === "success"
                  ? "This payment has been processed successfully."
                  : payment.status === "failed"
                  ? "This payment could not be processed."
                  : "This payment is currently being processed."}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
  },
  headerCard: {
    margin: 16,
    elevation: 4,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
  },
  headerAvatar: {
    marginRight: 20,
  },
  headerInfo: {
    flex: 1,
  },
  amount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  receiver: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  statusChip: {
    alignSelf: "flex-start",
  },
  detailsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailColumn: {
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  descriptionValue: {
    fontSize: 14,
    color: "#333",
    marginTop: 8,
    lineHeight: 20,
  },
  divider: {
    backgroundColor: "#e0e0e0",
  },
  statusCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  statusText: {
    marginLeft: 16,
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});

export default TransactionDetailsScreen;
