import "react-native-get-random-values";
import { getFontFamily } from "../../lib/utils/fontFamily";
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
  Modal,
  StyleSheet,
} from "react-native";
import {modalStyles} from "../../lib/shared/styles/auth";
import styles from "../../lib/shared/styles/styles";
import Logo from "../../assets/images/loogoo.svg";
import { storage } from "@/lib/storage";
import { generateMasterSeed } from "../../lib/evo_addresses/LWE_SaP"
import { MnemonicGenerator } from "../../lib/evo_addresses/Mnemonic/generator";
import { deserializeBigInts } from "@/lib/utils/BigInt";
import { encryptStringWithXChaCha20Poly1305 } from "@/lib/utils/encrypt";
import { bytesToHex } from "@noble/hashes/utils";

const SignupScreen = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMnemonicModal, setShowMnemonicModal] = useState(false);
  const [mnemonic, setMnemonic] = useState("");

  const router = useRouter();

  const MnemonicModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showMnemonicModal}
      onRequestClose={() => {
        setShowMnemonicModal(false);
        router.navigate("/auth/login");
      }}
    >
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <Text
            style={[modalStyles.modalTitle, { fontFamily: getFontFamily() }]}
          >
            Your Recovery Phrase
          </Text>
          <Text
            style={[modalStyles.modalText, { fontFamily: getFontFamily() }]}
          >
            Please write down these 24 words along with your password in order
            to keep them secure. You'll need them to recover your account and
            funds. We offer multiple account recovery mechanisms.{" "}
            <Link href={"/auth/login"}>Learn more</Link>
          </Text>
          <View style={modalStyles.mnemonicContainer}>
            <Text
              style={[
                modalStyles.mnemonicText,
                { fontFamily: getFontFamily() },
              ]}
            >
              {mnemonic}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.button, modalStyles.modalButton]}
            onPress={() => {
              setShowMnemonicModal(false);
              router.navigate("/auth/login");
            }}
          >
            <Text style={[styles.buttonText, { fontFamily: getFontFamily() }]}>
              I've Saved My Recovery Phrase
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const handleSignupWithPassword = async (password: string) => {
    setLoading(true);
    setError(null); // Reset previous errors

    try {
      console.log("Starting signup process...");
      const existingSalt = await storage.getItem("salt");
      console.log("Retrieved existing salt:", existingSalt);

      if (!existingSalt) {
        // Create new wallet
        console.log("No existing salt found. Generating master seed...");
        const { seedBytes, salt } = await generateMasterSeed(password);
        console.log("Generated seed bytes:", {
          seedBytesLength: seedBytes?.length,
          saltLength: salt?.length,
        });

        if (!seedBytes || !seedBytes.length) {
          throw new Error("Failed to generate valid seed bytes");
        }

        // Encrypt the seed bytes directly
        console.log("Encrypting seed bytes...");
        const encryptedData = await encryptStringWithXChaCha20Poly1305(
          seedBytes,
          password
        );
        console.log("Encryption successful:", encryptedData);

        // Store salt and encrypted data
        console.log("Storing salt and master seed...");
        await storage.setItem("salt", encryptedData.salt);
        await storage.setItem(
          "masterSeed",
          JSON.stringify({
            nonce: encryptedData.nonce,
            ciphertext: encryptedData.ciphertext,
          })
        );

        await storage.setItem("currentSession", password);
        console.log("Stored current session.");

        // Convert to BigInt only for mnemonic generation
        console.log("Generating mnemonic...");
        const seedHex = bytesToHex(seedBytes);
        const seed = BigInt("0x" + seedHex);
        const generatedMnemonic = MnemonicGenerator.seedToMnemonic(seed);
        console.log("Mnemonic generated:", generatedMnemonic);

        setMnemonic(generatedMnemonic);
        setShowMnemonicModal(true);
        console.log("Displayed mnemonic modal.");
      } else {
        storage.removeItem("masterSeed");
        storage.removeItem("salt");
        throw new Error("A wallet already exists. Please use login instead.");
      }
    } catch (e) {
      console.error("Detailed error:", e);
      if ((e as Error).message.includes("libsodium")) {
        setError("Encryption system initialization failed. Please try again.");
      } else {
        setError((e as Error).message);
      }
    } finally {
      console.log("Setting loading to false.");
      setLoading(false);
    }
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
                onPress={() => handleSignupWithPassword(password)}
              >
                <Text
                  style={[styles.buttonText, { fontFamily: getFontFamily() }]}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>

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
      <MnemonicModal />
    </SafeAreaView>
  );
};

export default SignupScreen;
