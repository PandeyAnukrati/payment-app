import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import {
  Searchbar,
  FAB,
  Text,
  ActivityIndicator,
  Menu,
  Button,
  Chip,
} from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { paymentsAPI, Payment, PaymentQuery } from "../services/api";
import TransactionCard from "../components/TransactionCard";
import WebSocketService from "../services/websocket";
import { exportTransactionsToCSV } from "../utils/csvExport";

interface TransactionListScreenProps {
  navigation: any;
}

const TransactionListScreen: React.FC<TransactionListScreenProps> = ({
  navigation,
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<PaymentQuery>({});
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showMethodMenu, setShowMethodMenu] = useState(false);

  const fetchPayments = async (pageNum = 1, reset = false) => {
    try {
      const query: PaymentQuery = {
        page: pageNum,
        limit: 10,
        ...filters,
        ...(searchQuery && { receiver: searchQuery }),
      };

      const response = await paymentsAPI.getPayments(query);

      if (reset) {
        setPayments(response.payments);
      } else {
        setPayments((prev) => [...prev, ...response.payments]);
      }

      setHasMore(pageNum < response.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching payments:", error);
      Alert.alert("Error", "Failed to fetch payments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPayments(1, true);

      // Connect to WebSocket for real-time updates
      const socket = WebSocketService.connect();

      WebSocketService.onNewPayment((newPayment) => {
        setPayments((prev) => [newPayment, ...prev]);
      });

      return () => {
        WebSocketService.removeAllListeners();
      };
    }, [filters, searchQuery])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPayments(page + 1, false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLoading(true);
    fetchPayments(1, true);
  };

  const applyStatusFilter = (status: string | null) => {
    setFilters((prev) => ({ ...prev, status: status || undefined }));
    setShowStatusMenu(false);
    setLoading(true);
    fetchPayments(1, true);
  };

  const applyMethodFilter = (method: string | null) => {
    setFilters((prev) => ({ ...prev, method: method || undefined }));
    setShowMethodMenu(false);
    setLoading(true);
    fetchPayments(1, true);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
    setLoading(true);
    fetchPayments(1, true);
  };

  const handleExportCSV = async () => {
    try {
      await exportTransactionsToCSV(payments);
      Alert.alert("Success", "Transactions exported successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to export transactions");
    }
  };

  const renderTransaction = ({ item }: { item: Payment }) => (
    <TransactionCard
      payment={item}
      onPress={() =>
        navigation.navigate("TransactionDetails", { paymentId: item._id })
      }
    />
  );

  const renderFooter = () => {
    if (!loading || page === 1) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No transactions found</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by receiver..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View style={styles.filtersContainer}>
        <Menu
          visible={showStatusMenu}
          onDismiss={() => setShowStatusMenu(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setShowStatusMenu(true)}
              style={styles.filterButton}
            >
              Status: {filters.status || "All"}
            </Button>
          }
        >
          <Menu.Item onPress={() => applyStatusFilter(null)} title="All" />
          <Menu.Item
            onPress={() => applyStatusFilter("success")}
            title="Success"
          />
          <Menu.Item
            onPress={() => applyStatusFilter("failed")}
            title="Failed"
          />
          <Menu.Item
            onPress={() => applyStatusFilter("pending")}
            title="Pending"
          />
        </Menu>

        <Menu
          visible={showMethodMenu}
          onDismiss={() => setShowMethodMenu(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setShowMethodMenu(true)}
              style={styles.filterButton}
            >
              Method: {filters.method || "All"}
            </Button>
          }
        >
          <Menu.Item onPress={() => applyMethodFilter(null)} title="All" />
          <Menu.Item
            onPress={() => applyMethodFilter("credit_card")}
            title="Credit Card"
          />
          <Menu.Item
            onPress={() => applyMethodFilter("debit_card")}
            title="Debit Card"
          />
          <Menu.Item
            onPress={() => applyMethodFilter("paypal")}
            title="PayPal"
          />
          <Menu.Item
            onPress={() => applyMethodFilter("bank_transfer")}
            title="Bank Transfer"
          />
          <Menu.Item
            onPress={() => applyMethodFilter("crypto")}
            title="Crypto"
          />
        </Menu>

        {(filters.status || filters.method || searchQuery) && (
          <Chip onPress={clearFilters} style={styles.clearChip}>
            Clear Filters
          </Chip>
        )}

        <Button
          mode="contained"
          onPress={handleExportCSV}
          style={styles.exportButton}
          icon="download"
          disabled={payments.length === 0}
        >
          Export CSV
        </Button>
      </View>

      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderTransaction}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            payments.length === 0 ? styles.emptyList : undefined
          }
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate("AddPayment")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchbar: {
    margin: 16,
    elevation: 4,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexWrap: "wrap",
    alignItems: "center",
  },
  filterButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  clearChip: {
    marginLeft: 8,
    marginBottom: 8,
  },
  exportButton: {
    marginLeft: 8,
    marginBottom: 8,
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
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  emptyList: {
    flexGrow: 1,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#667eea",
  },
});

export default TransactionListScreen;
