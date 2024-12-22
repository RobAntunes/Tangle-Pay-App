import GoogleAuthButton from "@/components/GoogleAuthButton";
import { getFontFamily } from "@/lib/utils/fontFamily";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import styles from "./shared/styles/styles";
import { AuthWithOAuth } from "./shared/functions/AuthWithOAuth";
import Logo from "../../assets/images/loogoo.svg";

const SignupScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSignupWithPassword = async (email: string, password: string) => {
    setLoading(true);

    try {
      if (!email || !password) {
        const msg = "Email and password are required.";
        console.log(msg);
        setError(msg);
        throw new Error(msg);
      }
      //TODO: Migrate to Yum or Zod
      if (!/\S+@\S+\.\S+/.test(email)) {
        const msg = "Invalid email address.";
        setError(msg);
        throw new Error(msg);
      }
      if (password !== confirmPassword) {
        const msg = "Passwords do not match.";
        setError(msg);
        throw new Error(msg);
      }
      if (password.length < 8) {
        const msg = "Password must be at least 8 characters long.";
        setError(msg);
        throw new Error(msg);
      }
      if (!/[A-Z0-9]/.test(password)) {
        const msg =
          "Password must contain at least one uppercase letter and one number.";
        setError(msg);
        throw new Error(msg);
      }

      const res = await fetch("http://10.0.2.2:8000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || res.status !== 200) {
        setLoading(false);
        setError(data.message || "Signup failed."); // Display error from server if available.
        return;
      }

      router.navigate("/auth/login");
    } catch (e) {
      (e as Error).message ? setError((e as Error).message) : setError(error);
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.logo}>
            <Logo width={125} height={125} />
          </View>

          <View style={styles.form}>
            <View style={styles.loaderContainer}>
              {loading && <ActivityIndicator size="large" color="#007AFF" />}
            </View>
            <View>
              <Text style={styles.errorText}>
                {error && (
                  <Text style={[{ fontFamily: getFontFamily() }]}>{error}</Text>
                )}
              </Text>
            </View>
            <View style={styles.formWrapper}>
              <Text style={[styles.title, { fontFamily: getFontFamily() }]}>
                Sign Up
              </Text>
              <Text style={[styles.subtitle, { fontFamily: getFontFamily() }]}>
                Create an account to get started.
              </Text>
              <TextInput
                style={[styles.input, { fontFamily: getFontFamily() }]}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={[styles.input, { fontFamily: getFontFamily() }]}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TextInput
                style={[styles.input, { fontFamily: getFontFamily() }]}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleSignupWithPassword(email, password)}
              >
                <Text
                  style={[styles.buttonText, { fontFamily: getFontFamily() }]}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
              <GoogleAuthButton
                handler={() => AuthWithOAuth(router)}
                content="Sign up with Google"
              />
              <Link
                href="/auth/login"
                style={[styles.linkText, { fontFamily: getFontFamily() }]}
              >
                <Text>Already have an account? Login</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;
