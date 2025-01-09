import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { blake3 } from "@noble/hashes/blake3";
import { hexToBytes, bytesToHex } from "@noble/hashes/utils";

interface AddressEvolutionCardProps {
  currentAddress: string;
  onEvolve?: (newAddress: string) => void;
}

const AddressEvolutionCard: React.FC<AddressEvolutionCardProps> = ({
  currentAddress = "", // Provide default empty string
  onEvolve,
}) => {
  const [isEvolving, setIsEvolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Validate prop on mount and changes
  useEffect(() => {
    if (!currentAddress) {
      setError("No address available");
    } else {
      setError(null);
    }
  }, [currentAddress]);

  function evolveAddress(currentAddress: string): string {
    const currentBytes = hexToBytes(currentAddress.slice(2));
    const newHashBytes = blake3(currentBytes);
    return "0x" + bytesToHex(newHashBytes);
  }

  const handleEvolve = async () => {
    setIsEvolving(true);
    setError(null);

    try {
      // Early return if no address
      if (!currentAddress) {
        throw new Error("No address available to evolve");
      }

      // Evolve the address
      const newAddress = evolveAddress(currentAddress);

      // Call the callback with the new address
      if (onEvolve) {
        onEvolve(newAddress);
      }

      setError(null);
    } catch (err) {
      console.error("Evolution error:", err);
      // More user-friendly error message
      setError(err instanceof Error ? err.message : "Failed to evolve address");
    } finally {
      setIsEvolving(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      if (!currentAddress) {
        throw new Error("No address available to copy");
      }
      await Clipboard.setStringAsync(currentAddress);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to copy address");
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Current Address</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.addressContainer}>
          {currentAddress ? (
            <Text style={styles.addressText} numberOfLines={3}>
              {currentAddress}
            </Text>
          ) : (
            <Text style={styles.placeholderText}>No address available</Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.outlineButton,
              !currentAddress && styles.buttonDisabled,
            ]}
            onPress={copyToClipboard}
            disabled={!currentAddress}
          >
            <Ionicons
              name="copy-outline"
              size={20}
              color={currentAddress ? "#4A90E2" : "#999"}
            />
            <Text
              style={[
                styles.buttonText,
                styles.outlineButtonText,
                !currentAddress && styles.buttonTextDisabled,
              ]}
            >
              {copySuccess ? "Copied!" : "Copy"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              (!currentAddress || isEvolving) && styles.buttonDisabled,
            ]}
            onPress={handleEvolve}
            disabled={!currentAddress || isEvolving}
          >
            {isEvolving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="refresh"
                  size={20}
                  color={currentAddress ? "#fff" : "#999"}
                />
                <Text
                  style={[
                    styles.buttonText,
                    styles.primaryButtonText,
                    !currentAddress && styles.buttonTextDisabled,
                  ]}
                >
                  Evolve Address
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#E74C3C" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholderText: {
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextDisabled: {
    color: "#999",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    gap: 15,
  },
  addressContainer: {
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 10,
  },
  addressText: {
    fontFamily: "monospace",
    fontSize: 14,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    flex: 1,
    gap: 8,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#4A90E2",
    backgroundColor: "transparent",
  },
  primaryButton: {
    backgroundColor: "#4A90E2",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  outlineButtonText: {
    color: "#4A90E2",
  },
  primaryButtonText: {
    color: "#fff",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDEAEA",
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 14,
  },
});

export default AddressEvolutionCard;
