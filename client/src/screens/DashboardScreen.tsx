import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  Alert,
} from "react-native";
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
  Surface,
  Button,
} from "react-native-paper";
import { LineChart } from "react-native-chart-kit";
import { MaterialIcons } from "@expo/vector-icons";
import { paymentsAPI, PaymentStats } from "../services/api";
import WebSocketService from "../services/websocket";
import { exportStatsToCSV } from "../utils/csvExport";

const screenWidth = Dimensions.get("window").width;

const DashboardScreen: React.FC = () => {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await paymentsAPI.getStats();
      // Ensure revenueChart has valid data
      if (data.revenueChart) {
        data.revenueChart = data.revenueChart.filter(
          (item) => item && typeof item.revenue === "number" && item.date
        );
      }
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Set default stats to prevent crashes
      setStats({
        totalPaymentsToday: 0,
        totalPaymentsWeek: 0,
        totalRevenueToday: 0,
        totalRevenueWeek: 0,
        failedTransactions: 0,
        revenueChart: [],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Connect to WebSocket for real-time updates
    const socket = WebSocketService.connect();
    WebSocketService.joinRoom("dashboard");

    WebSocketService.onStatsUpdate((updatedStats) => {
      setStats(updatedStats);
    });

    return () => {
      WebSocketService.leaveRoom("dashboard");
      WebSocketService.removeAllListeners();
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleExportStats = async () => {
    if (!stats) {
      Alert.alert("Error", "No stats data available to export");
      return;
    }

    try {
      await exportStatsToCSV(stats);
      Alert.alert("Success", "Dashboard stats exported successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to export dashboard stats");
    }
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#667eea",
    },
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Title style={styles.headerTitle}>Dashboard</Title>
            <Text style={styles.headerSubtitle}>Payment Overview</Text>
          </View>
          <Button
            mode="contained-tonal"
            onPress={handleExportStats}
            icon="download"
            style={styles.exportButton}
            labelStyle={styles.exportButtonLabel}
          >
            Export
          </Button>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, styles.successCard]}>
            <Card.Content style={styles.statContent}>
              <MaterialIcons name="trending-up" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>
                {stats?.totalPaymentsToday || 0}
              </Text>
              <Text style={styles.statLabel}>Payments Today</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.infoCard]}>
            <Card.Content style={styles.statContent}>
              <MaterialIcons name="calendar-today" size={24} color="#2196F3" />
              <Text style={styles.statNumber}>
                {stats?.totalPaymentsWeek || 0}
              </Text>
              <Text style={styles.statLabel}>This Week</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, styles.revenueCard]}>
            <Card.Content style={styles.statContent}>
              <MaterialIcons name="attach-money" size={24} color="#FF9800" />
              <Text style={styles.statNumber}>
                {formatCurrency(stats?.totalRevenueToday || 0)}
              </Text>
              <Text style={styles.statLabel}>Revenue Today</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.errorCard]}>
            <Card.Content style={styles.statContent}>
              <MaterialIcons name="error" size={24} color="#F44336" />
              <Text style={styles.statNumber}>
                {stats?.failedTransactions || 0}
              </Text>
              <Text style={styles.statLabel}>Failed</Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      <Card style={styles.chartCard}>
        <Card.Content>
          <Title style={styles.chartTitle}>Revenue Trend (Last 7 Days)</Title>
          {stats?.revenueChart && stats.revenueChart.length > 0 ? (
            <LineChart
              data={{
                labels: stats.revenueChart.map((item) =>
                  new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                ),
                datasets: [
                  {
                    data: stats.revenueChart.map((item) => item.revenue || 0),
                    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                    strokeWidth: 2,
                  },
                ],
              }}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withDots={true}
              withShadow={false}
              withVerticalLabels={true}
              withHorizontalLabels={true}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No data available</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Surface style={styles.weeklyRevenueCard}>
        <View style={styles.weeklyRevenueContent}>
          <MaterialIcons
            name="account-balance-wallet"
            size={32}
            color="#667eea"
          />
          <View style={styles.weeklyRevenueText}>
            <Text style={styles.weeklyRevenueAmount}>
              {formatCurrency(stats?.totalRevenueWeek || 0)}
            </Text>
            <Text style={styles.weeklyRevenueLabel}>
              Total Revenue This Week
            </Text>
          </View>
        </View>
      </Surface>
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
  header: {
    padding: 20,
    backgroundColor: "#667eea",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    marginTop: 4,
  },
  exportButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  exportButtonLabel: {
    color: "white",
    fontSize: 12,
  },
  statsContainer: {
    padding: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 4,
  },
  statContent: {
    alignItems: "center",
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  successCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  infoCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  revenueCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  errorCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  chartCard: {
    margin: 16,
    elevation: 4,
  },
  chartTitle: {
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    color: "#666",
    fontSize: 16,
  },
  weeklyRevenueCard: {
    margin: 16,
    padding: 20,
    elevation: 4,
    borderRadius: 8,
  },
  weeklyRevenueContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  weeklyRevenueText: {
    marginLeft: 16,
    flex: 1,
  },
  weeklyRevenueAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  weeklyRevenueLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});

export default DashboardScreen;
