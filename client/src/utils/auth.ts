import * as SecureStore from "expo-secure-store";

export const storeToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync("access_token", token);
  } catch (error) {
    console.error("Error storing token:", error);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync("access_token");
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync("access_token");
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

export const storeUser = async (user: any): Promise<void> => {
  try {
    await SecureStore.setItemAsync("user", JSON.stringify(user));
  } catch (error) {
    console.error("Error storing user:", error);
  }
};

export const getUser = async (): Promise<any | null> => {
  try {
    const userString = await SecureStore.getItemAsync("user");
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

export const removeUser = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync("user");
  } catch (error) {
    console.error("Error removing user:", error);
  }
};

export const logout = async (): Promise<void> => {
  await removeToken();
  await removeUser();
};
