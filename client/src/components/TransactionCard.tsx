import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text, Chip, Avatar } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { Payment } from "../services/api";

interface TransactionCardProps {
  payment: Payment;
  onPress: () => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  payment,
  onPress,
}) => {
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
      currency: payment.currency || "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMethod = (method: string) => {
    return method.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.leftSection}>
              <Avatar.Icon
                size={40}
                icon={getMethodIcon(payment.method)}
                style={[
                  styles.avatar,
                  { backgroundColor: getStatusColor(payment.status) },
                ]}
              />
              <View style={styles.info}>
                <Text style={styles.receiver}>{payment.receiver}</Text>
                <Text style={styles.transactionId}>
                  #{payment.transactionId}
                </Text>
              </View>
            </View>
            <View style={styles.rightSection}>
              <Text style={styles.amount}>
                {formatCurrency(payment.amount)}
              </Text>
              <Text style={styles.date}>{formatDate(payment.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.footer}>
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
            <Text style={styles.method}>{formatMethod(payment.method)}</Text>
          </View>

          {payment.description && (
            <Text style={styles.description} numberOfLines={2}>
              {payment.description}
            </Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  receiver: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  transactionId: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  rightSection: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  date: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusChip: {
    height: 28,
  },
  method: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    fontStyle: "italic",
  },
});

export default TransactionCard;
