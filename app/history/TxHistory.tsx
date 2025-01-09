import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  TransactionManager,
  Transaction,
} from "../../lib/classes/TxHistoryManager";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";

const TransactionHistoryScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadTransactions = useCallback(async (pageNum: number = 1) => {
    try {
      const { transactions: newTxs, hasMore: more } =
        await TransactionManager.getTransactions(pageNum);

      if (pageNum === 1) {
        setTransactions(newTxs);
      } else {
        setTransactions((prev) => [...prev, ...newTxs]);
      }

      setHasMore(more);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadTransactions(1);
  }, [loadTransactions]);

  const loadMore = () => {
    if (!hasMore || loading) return;

    const nextPage = page + 1;
    setPage(nextPage);
    loadTransactions(nextPage);
  };

  const TransactionItem = ({ item }: { item: Transaction }) => {
    const isPositive = item.type === "receive";

    return (
      <View style={styles.transactionItem}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={isPositive ? "arrow-down-circle" : "arrow-up-circle"}
            size={24}
            color={isPositive ? "#2ECC71" : "#E74C3C"}
          />
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.topRow}>
            <Text style={styles.addressText}>
              {isPositive ? "From: " : "To: "}
              {isPositive ? item.fromAddress : item.toAddress}
            </Text>
            <Text
              style={[
                styles.amountText,
                { color: isPositive ? "#2ECC71" : "#E74C3C" },
              ]}
            >
              {isPositive ? "+" : "-"}
              {item.amount}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.timeText}>
              {formatDistanceToNow(item.timestamp, { addSuffix: true })}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    item.status === "completed" ? "#2ECC71" : "#F1C40F",
                },
              ]}
            >
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        renderItem={({ item }) => <TransactionItem item={item} />}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && hasMore ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color="#4A90E2" />
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E8ED",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  refreshButton: {
    padding: 8,
  },
  transactionItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E8ED",
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: "center",
  },
  detailsContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addressText: {
    fontSize: 14,
    color: "#4A4A4A",
    flex: 1,
    marginRight: 8,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "600",
  },
  timeText: {
    fontSize: 12,
    color: "#8F8F8F",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    textTransform: "capitalize",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#8F8F8F",
    textAlign: "center",
  },
  loadingFooter: {
    padding: 16,
    alignItems: "center",
  },
});

export default TransactionHistoryScreen;
