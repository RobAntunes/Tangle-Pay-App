// LoginScreen.tsx

import "react-native-get-random-values";
import { getFontFamily } from "../../lib/utils/fontFamily";
import React, { useState } from "react";
import {
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  View,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Logo from "../../assets/images/loogoo.svg";
import { Link, useRouter } from "expo-router";
import { storage } from "@/lib/storage";
import styles from "../../lib/shared/styles/auth";
import { decryptStringFromXChaCha20Poly1305 } from "@/lib/utils/encrypt";

const LoginScreen = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const signInWithPassword = async () => {
    setLoading(true);
    setError(null); // Reset previous errors

    try {
      if (!password) {
        throw new Error("Password is required");
      }

      const salt = await storage.getItem("salt");

      if (!salt) {
        // No salt found implies no wallet exists; redirect to signup
        router.replace("/auth/signup");
        return;
      }

      try {
        const masterSeedEncryptedRaw = await storage.getItem("masterSeed");
        if (!masterSeedEncryptedRaw) {
          throw new Error("Wallet data is corrupted. Please restore from your recovery phrase.");
        }

        const masterSeedEncrypted = JSON.parse(masterSeedEncryptedRaw);

        const decryptedBytes = await decryptStringFromXChaCha20Poly1305(
          {
            salt,
            ...masterSeedEncrypted
          },
          password
        );

        // If decryption succeeds, the password is correct
        await storage.setItem("currentSession", password);
        router.replace("/home");
      } catch (e) {
        // Decryption failed implies incorrect password or corrupted data
        throw new Error("Invalid password or wallet data");
      }

    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.logo}>
            <Logo width={125} height={125} />
          </View>
          <View style={styles.form}>
            <View style={styles.loaderContainer}>
              {loading && <ActivityIndicator size="large" color="#007AFF" />}
            </View>
            <View style={styles.formWrapper}>
              <Text style={styles.errorText}>
                {error && (
                  <Text style={[{ fontFamily: getFontFamily() }]}>{error}</Text>
                )}
              </Text>
              <Text style={[styles.title, { fontFamily: getFontFamily() }]}>
                Login
              </Text>
              <Text style={[styles.subtitle, { fontFamily: getFontFamily() }]}>
                Sign in to your wallet.
              </Text>
              <TextInput
                style={[styles.input, { fontFamily: getFontFamily() }]}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={styles.button}
                onPress={signInWithPassword}
                disabled={loading} // Prevent multiple presses
              >
                <Text
                  style={[styles.buttonText, { fontFamily: getFontFamily() }]}
                >
                  Login
                </Text>
              </TouchableOpacity>

              <Link href={"/auth/signup"}>
                <Text
                  style={[styles.linkText, { fontFamily: getFontFamily() }]}
                >
                  Don't have a wallet? Create one
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;