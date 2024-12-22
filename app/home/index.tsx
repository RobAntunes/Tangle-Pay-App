import React, { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getFontFamily } from "../../lib/utils/fontFamily";
import {  useRouter } from "expo-router";

export interface ClientTanglePayAccount {
  debits_pending: bigint;
  debits_posted: bigint;
  credits_pending: bigint;
  credits_posted: bigint;
  user_data_128: bigint;
  user_data_64: bigint;
  user_data_32: number;
  reserved: number;
  ledger: number;
  code: number;
  flags: QueryFilterFlags;
  timestamp: bigint;
}

export interface ClientTanglePayTransfer {
  id: bigint;
  debit_account_id: bigint;
  credit_account_id: bigint;
  amount: bigint;
  pending_id?: bigint;
  user_data_128?: bigint;
  user_data_64?: bigint;
  user_data_32?: number;
  timeout?: number;
  ledger: number;
  code?: number;
  flags?: QueryFilterFlags;
  timestamp: bigint;
}

export declare enum QueryFilterFlags {
  none = 0,
  reversed = 1,
}

const HomeScreen = () => {
  const [accounts, setAccounts] = useState<ClientTanglePayAccount[]>([]);
  // const [transfers, setTransfers] = useState<ClientTanglePayTransfer[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const router = useRouter();


  const handleSignOut = async () => {
    const res = await fetch("http://10.0.2.2:8000/auth/signout");
    if (!res.ok || res.status !== 200) {
      if (res.status === 400) {
        setError("Bad Request");
      } else if (res.status === 401) {
        setError("Unauthorized");
      } else {
        setError("Internal Server Error, please try again");
      }
    }
    router.dismissTo("/auth/login");
  };

  const fetchAccounts = async () => {
    const lookup = await fetch(`http://10.0.2.2:8000/accounts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!lookup || !lookup.ok) {
      console.log(lookup.status);
      setError("Something went wrong");
    }
    const data = await lookup.json();
    console.log("data", data);
    setAccounts(data);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    console.log("accounts", accounts);
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, Alex</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowDrawer(true)}
          >
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <Modal
          transparent
          visible={showDrawer}
          animationType="slide"
          onRequestClose={() => setShowDrawer(false)}
        >
          <Pressable
            style={styles.overlay}
            onPress={() => setShowDrawer(false)}
          >
            <View style={styles.drawer}>
              <TouchableOpacity style={styles.option} onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={24} color="#333" />
                <Text style={styles.optionText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
        <Modal
          transparent
          visible={!!error}
          animationType="fade"
          onRequestClose={() => setError(undefined)}
        >
          <View style={styles.errorOverlay}>
            <View style={styles.errorModal}>
              <Text style={styles.errorTitle}>Error</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <TouchableOpacity
                style={styles.errorButton}
                onPress={() => setError(undefined)}
              >
                <Text style={styles.errorButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>$2,459.50</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle-outline" size={24} color="#fff" />

            <Text style={styles.actionButtonText}>Add Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons
              name="arrow-forward-circle-outline"
              size={24}
              color="#fff"
            />
            <Text style={styles.actionButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionItem}>
          <Ionicons name="card-outline" size={24} color="#4A90E2" />
          <Text style={styles.quickActionText}>Cards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionItem}>
          <Ionicons name="people-outline" size={24} color="#4A90E2" />
          <Text style={styles.quickActionText}>Transfer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionItem}>
          <Ionicons name="receipt-outline" size={24} color="#4A90E2" />
          <Text style={styles.quickActionText}>Bills</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionItem}>
          <Ionicons name="grid-outline" size={24} color="#4A90E2" />
          <Text style={styles.quickActionText}>More</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <View style={styles.transactions}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <ScrollView>
          <TransactionItem
            title="Netflix Subscription"
            amount="-$14.99"
            date="Today"
            icon="play-circle-outline"
          />
          <TransactionItem
            title="Sarah Johnson"
            amount="+$250.00"
            date="Yesterday"
            icon="person-outline"
          />
          <TransactionItem
            title="Grocery Store"
            amount="-$86.24"
            date="Yesterday"
            icon="cart-outline"
          />
        </ScrollView>
      </View>
    </View>
  );
};

const TransactionItem = ({
  title,
  amount,
  date,
  icon,
}: {
  title: string;
  amount: string;
  date: string;
  icon: any;
}) => (
  <View style={styles.transactionItem}>
    <View style={styles.transactionIcon}>
      <Ionicons name={icon} size={24} color="#4A90E2" />
    </View>
    <View style={styles.transactionDetails}>
      <Text style={styles.transactionTitle}>{title}</Text>
      <Text style={styles.transactionDate}>{date}</Text>
    </View>
    <Text
      style={[
        styles.transactionAmount,
        { color: amount.includes("+") ? "#2ECC71" : "#E74C3C" },
      ]}
    >
      {amount}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 20,
    fontFamily: getFontFamily(),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  balanceCard: {
    backgroundColor: "#4A90E2",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  balanceLabel: {
    color: "#fff",
    opacity: 0.8,
    fontSize: 16,
  },
  balanceAmount: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  actionButtonText: {
    color: "#fff",
    marginLeft: 8,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  quickActionItem: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    width: "22%",
  },
  quickActionText: {
    marginTop: 5,
    fontSize: 12,
    color: "#333",
  },
  transactions: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  transactionIcon: {
    backgroundColor: "#F8F9FA",
    padding: 10,
    borderRadius: 12,
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 15,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  transactionDate: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 15,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  drawer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  errorOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  errorModal: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E74C3C",
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: "#E74C3C",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  errorButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default HomeScreen;
