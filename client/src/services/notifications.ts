import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  }

  static async getExpoPushToken(): Promise<string | null> {
    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Expo Push Token:", token);
      return token;
    } catch (error) {
      console.error("Error getting push token:", error);
      return null;
    }
  }

  static async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    seconds: number = 0
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: "default",
        },
        trigger: seconds > 0 ? { seconds } : null,
      });

      return notificationId;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      throw error;
    }
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error("Error canceling notification:", error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error canceling all notifications:", error);
    }
  }

  // Simulated push notifications for different payment events
  static async notifyPaymentSuccess(paymentData: any): Promise<void> {
    await this.scheduleLocalNotification(
      "Payment Successful! 💳",
      `Payment of $${paymentData.amount} to ${paymentData.receiver} completed successfully.`,
      { type: "payment_success", paymentId: paymentData._id }
    );
  }

  static async notifyPaymentFailed(paymentData: any): Promise<void> {
    await this.scheduleLocalNotification(
      "Payment Failed ❌",
      `Payment of $${paymentData.amount} to ${paymentData.receiver} failed. Please try again.`,
      { type: "payment_failed", paymentId: paymentData._id }
    );
  }

  static async notifyNewPaymentReceived(paymentData: any): Promise<void> {
    await this.scheduleLocalNotification(
      "New Payment Received! 💰",
      `You received a payment of $${paymentData.amount} from ${
        paymentData.sender || "Unknown"
      }.`,
      { type: "payment_received", paymentId: paymentData._id }
    );
  }

  static async notifyDailyReport(stats: any): Promise<void> {
    await this.scheduleLocalNotification(
      "Daily Payment Report 📊",
      `Today: ${stats.totalPaymentsToday} payments, $${stats.totalRevenueToday} revenue.`,
      { type: "daily_report" }
    );
  }

  static async notifyLowBalance(balance: number): Promise<void> {
    await this.scheduleLocalNotification(
      "Low Balance Warning ⚠️",
      `Your account balance is low: $${balance}. Consider adding funds.`,
      { type: "low_balance" }
    );
  }

  // Setup notification listeners
  static setupNotificationListeners() {
    // Handle notification received while app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    // Handle notification response (when user taps notification)
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        const data = response.notification.request.content.data;

        // Handle different notification types
        if (
          data?.type === "payment_success" ||
          data?.type === "payment_failed"
        ) {
          // Navigate to transaction details
          console.log("Navigate to payment:", data.paymentId);
        } else if (data?.type === "daily_report") {
          // Navigate to dashboard
          console.log("Navigate to dashboard");
        }
      });

    return {
      notificationListener,
      responseListener,
    };
  }

  static removeNotificationListeners(listeners: any) {
    Notifications.removeNotificationSubscription(
      listeners.notificationListener
    );
    Notifications.removeNotificationSubscription(listeners.responseListener);
  }
}

export default NotificationService;
