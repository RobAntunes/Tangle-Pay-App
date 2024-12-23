import { Router } from "expo-router";
// Frontend (googleAuth.ts)
import { Alert } from "react-native";
import * as Linking from "expo-linking";
import { supabase } from "@/lib/supabase";
import * as WebBrowser from "expo-web-browser";
import { Buffer } from "buffer";

export default async (router: Router) => {
  WebBrowser.maybeCompleteAuthSession();

  try {
    // Get OAuth URL from backend
    const response = await fetch(`http://10.0.2.2:8000/auth/oauth`, {
      method: "GET",
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to start login");
    }

    // Open auth URL in browser
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      "tangle://home"
    );

    if (result.type === "success") {
      const url = new URL(result.url);
      console.log(url);
      const code = url.searchParams.get("code");

      if (code) {
        const callbackResponse = await fetch(`http://10.0.2.2:8000/auth/oauth/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        const callbackData = await callbackResponse.json();

        if (!callbackResponse.ok) {
          throw new Error(
            callbackData.message || "Failed to complete authentication"
          );
        }

        // Successfully authenticated
        router.replace("/home");
      }
    } else {
      router.replace("/auth/login");
    }
  } catch (error) {
    Alert.alert("Authentication Error", (error as Error).message, [
      { text: "OK", onPress: () => router.replace("/auth/login") },
    ]);
  }
};
