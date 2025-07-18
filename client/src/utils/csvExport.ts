import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Payment } from "../services/api";

export const exportTransactionsToCSV = async (payments: Payment[]) => {
  try {
    // Create CSV header
    const header =
      "ID,Amount,Currency,Receiver,Status,Method,Date,Description\n";

    // Create CSV rows
    const rows = payments
      .map((payment) => {
        const date = new Date(payment.createdAt).toLocaleDateString();
        const description = (payment.description || "").replace(/,/g, ";"); // Replace commas to avoid CSV issues

        return `${payment._id},${payment.amount},${payment.currency},${payment.receiver},${payment.status},${payment.method},${date},"${description}"`;
      })
      .join("\n");

    const csvContent = header + rows;

    // Create file path
    const fileName = `transactions_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    const fileUri = FileSystem.documentDirectory + fileName;

    // Write file
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: "Export Transactions",
      });
    } else {
      throw new Error("Sharing is not available on this device");
    }

    return true;
  } catch (error) {
    console.error("Error exporting CSV:", error);
    throw error;
  }
};

export const exportStatsToCSV = async (stats: any) => {
  try {
    const header = "Metric,Value\n";
    const rows = [
      `Total Payments Today,${stats.totalPaymentsToday}`,
      `Total Payments This Week,${stats.totalPaymentsWeek}`,
      `Total Revenue Today,${stats.totalRevenueToday}`,
      `Total Revenue This Week,${stats.totalRevenueWeek}`,
      `Failed Transactions,${stats.failedTransactions}`,
    ].join("\n");

    const csvContent = header + rows;

    const fileName = `dashboard_stats_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: "Export Dashboard Stats",
      });
    }

    return true;
  } catch (error) {
    console.error("Error exporting stats CSV:", error);
    throw error;
  }
};
