import { AppState } from "react-native";
import { SupportedStorage, createClient } from "@supabase/supabase-js";
import * as secureStore from "expo-secure-store";

const supabaseUrl = "https://gfsiyznswfgnylijruzv.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmc2l5em5zd2ZnbnlsaWpydXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MTEyNDcsImV4cCI6MjA0OTk4NzI0N30.yxiWfBmkQMpaXnYO2gftFaffYmDxr4ZzSqo75NxyoJ8";

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

const storage = new ExpoSecureStore();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
