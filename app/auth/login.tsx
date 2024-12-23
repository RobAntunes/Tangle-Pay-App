import GoogleAuthButton from "../../components/GoogleAuthButton";
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
import styles from "../../lib/shared/styles/styles";
import AuthWithOAuth from "../../lib/shared/functions/AuthWithOAuth";
import { Link, useRouter } from "expo-router";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const signInWithPassword = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://10.0.2.2:8000/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password }),
      });
      console.log(res);

      if (!res.ok || res.status !== 200) {
        if (!email || !password) {
          const msg = "Email and password are required.";
          console.log(msg);
          setError(msg);
        }
        //TODO: Migrate to Yum or Zod
        else if (!/\S+@\S+\.\S+/.test(email)) {
          const msg = "Invalid email address.";
          setError(msg);
        } else if (res.status === 400) {
          setError("Bad Request");
        } else if (res.status === 401) {
          setError("Please verify your account before logging in.");
        } else if (res.status === 404) {
          setError("This email address is not associated with an account");
        } else if (res.status === 500) {
          setError("Internal Server Error, please try again");
        } else {
          setError("Login failed. Please check your credentials.");
        }
        setLoading(false);
        return;
      }
      router.setParams({ email });
      router.navigate("/home");
    } catch (e) {
      console.log(e);
      (e as Error).message ? setError((e as Error).message) : setError(error);
      setLoading(false);
    }
    setLoading(false);
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
                Sign in to your account.
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
              <TouchableOpacity
                style={styles.button}
                onPress={signInWithPassword}
              >
                <Text
                  style={[styles.buttonText, { fontFamily: getFontFamily() }]}
                >
                  Login
                </Text>
              </TouchableOpacity>
              <GoogleAuthButton
                handler={() => AuthWithOAuth(router)}
                content="Sign in with Google"
              />
              <Link href={"/auth/signup"}>
                <Text
                  style={[styles.linkText, { fontFamily: getFontFamily() }]}
                >
                  Don't have an account? Sign up
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
