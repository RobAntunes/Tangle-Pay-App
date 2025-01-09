import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import LoginScreen from "./auth/login";
import HomeScreen from "./home";

export default () => {
  return (
    <SafeAreaView style={styles.container}>
      <HomeScreen />
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
