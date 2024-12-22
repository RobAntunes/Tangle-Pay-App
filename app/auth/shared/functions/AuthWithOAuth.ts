import { encryptStringWithXChaCha20Poly1305 } from "@/lib/utils/encrypt";
import { Router } from "expo-router";
import { Linking, Alert } from "react-native";

export const AuthWithOAuth = async (router: Router) => {
    const handleDeepLink = async (event: any) => {
      Linking.removeAllListeners("url");
      try {
        if (!event || !event.url) {
          throw new Error("Deep link event or URL is missing.");
        }
        const data = event.url
          .split("#")[1]
          .split("&")
          .reduce((acc: any, curr: any) => {
            const [key, value] = curr.split("=");
            acc[key] = decodeURIComponent(value); // Decode URI components
            return acc;
          }, {} as { [key: string]: string });
  
        const { access_token: accessToken, refresh_token: refreshToken } = data;
        if (!accessToken || !refreshToken) {
          throw new Error("Access token or refresh token is missing.");
        }
  
        const at = await encryptStringWithXChaCha20Poly1305(accessToken);
        const rt = await encryptStringWithXChaCha20Poly1305(refreshToken);
  
        console.log(at, rt);
  
        await fetch("http://10.0.2.2:8000/auth/oauth", {
          method: "PUT",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            access_token: at,
            refresh_token: rt,
          }),
        });
  
        router.navigate("/");
      } catch (error) {
        Alert.alert("Authentication Error", (error as Error).message);
      }
    };
  
    Linking.addEventListener("url", handleDeepLink);
  
    try {
      const res = await fetch("http://10.0.2.2:8000/auth/oauth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider: "google" }),
      });
  
      if (!res.ok) {
        const errorMessage =
          res.statusText || `Failed to fetch OAuth URL: ${res.status}`;
        throw new Error(errorMessage);
      }
      let { url: oauthUrl } = await res.json();
      oauthUrl = oauthUrl.replaceAll("%2F", "/").replaceAll("%3A", ":");
      await Linking.openURL(oauthUrl);
    } catch (error) {
      console.log(error);
      Alert.alert("Authentication Error", (error as Error).message);
    }
  };