import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import LoginScreen from "./auth/login";
import HomeScreen from "./home";

export default () => {
  const [error, setError] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);

  const queryTokens = async () => {
    const res = await fetch("http://10.0.2.2:8000/auth/tokens", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
    });
    const data = await res.json();
    if (!res.ok || res.status !== 200) {
      if (res.status === 400) {
        setError("Bad Request");
      } else if (res.status === 401) {
        setError("Unauthorized");
      } else {
        setError("Internal Server Error, please try again");
      }
    }
    return res.status === 200;
  };

  useEffect(() => {
    (async () => {
      const success = await queryTokens();
      if (success) {
        setHasToken(true);
      } else {
        setHasToken(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {hasToken ? <HomeScreen /> : <LoginScreen />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
