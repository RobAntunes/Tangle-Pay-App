import { AppState } from "react-native";
import { SupportedStorage, createClient } from "@supabase/supabase-js";
import * as secureStore from "expo-secure-store";


export interface StorageInterface {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export class ExpoSecureStore implements StorageInterface {
  async getItem(key: string): Promise<string | null> {
    return await secureStore.getItemAsync(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await secureStore.setItemAsync(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await secureStore.deleteItemAsync(key);
  }
}

export const storage = new ExpoSecureStore();
