import AsyncStorage from '@react-native-async-storage/async-storage';
import { blake3 } from '@noble/hashes/blake3';
import { bytesToHex } from '@noble/hashes/utils';

// Types for our transaction history
export interface Transaction {
    id: string;
    timestamp: number;
    type: 'send' | 'receive' | 'evolve';
    amount: string;
    fromAddress: string;
    toAddress: string;
    status: 'pending' | 'completed' | 'failed';
    metadata?: {
        note?: string;
        category?: string;
        socketState?: string;
    };
}

// Keys for storage
const STORAGE_KEYS = {
    TX_PREFIX: '@tangle_tx_',
    TX_INDEX: '@tangle_tx_index',
    LAST_BACKUP: '@tangle_last_backup'
};

export class TransactionManager {
    // Store a new transaction
    static async addTransaction(tx: Omit<Transaction, 'id'>): Promise<string> {
        try {
            // Generate unique ID using timestamp and tx data
            const txData = JSON.stringify(tx);
            const hash = blake3(Buffer.from(txData));
            const id = bytesToHex(hash).slice(0, 16); // Take first 8 bytes for ID

            const transaction: Transaction = {
                ...tx,
                id
            };

            // Store transaction
            await AsyncStorage.setItem(
                `${STORAGE_KEYS.TX_PREFIX}${id}`,
                JSON.stringify(transaction)
            );

            // Update transaction index
            await this.addToIndex(id);

            return id;
        } catch (error) {
            console.error('Failed to store transaction:', error);
            throw error;
        }
    }

    // Retrieve all transactions with pagination
    static async getTransactions(
        page: number = 1,
        limit: number = 20
    ): Promise<{ transactions: Transaction[]; hasMore: boolean }> {
        try {
            const index = await this.getTransactionIndex();
            const start = (page - 1) * limit;
            const end = start + limit;
            const pageIds = index.slice(start, end);

            const transactions = await Promise.all(
                pageIds.map(id => this.getTransaction(id))
            );

            return {
                transactions: transactions.filter((tx): tx is Transaction => tx !== null),
                hasMore: end < index.length
            };
        } catch (error) {
            console.error('Failed to retrieve transactions:', error);
            throw error;
        }
    }

    // Get a single transaction by ID
    static async getTransaction(id: string): Promise<Transaction | null> {
        try {
            const data = await AsyncStorage.getItem(`${STORAGE_KEYS.TX_PREFIX}${id}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Failed to retrieve transaction ${id}:`, error);
            return null;
        }
    }

    // Update transaction status
    static async updateTransactionStatus(
        id: string,
        status: Transaction['status']
    ): Promise<void> {
        try {
            const tx = await this.getTransaction(id);
            if (tx) {
                tx.status = status;
                await AsyncStorage.setItem(
                    `${STORAGE_KEYS.TX_PREFIX}${id}`,
                    JSON.stringify(tx)
                );
            }
        } catch (error) {
            console.error(`Failed to update transaction ${id}:`, error);
            throw error;
        }
    }

    // Backup all transactions
    static async backupTransactions(): Promise<string> {
        try {
            const index = await this.getTransactionIndex();
            const transactions = await Promise.all(
                index.map(id => this.getTransaction(id))
            );

            const backup = {
                timestamp: Date.now(),
                transactions: transactions.filter((tx): tx is Transaction => tx !== null)
            };

            const backupData = JSON.stringify(backup);
            await AsyncStorage.setItem(STORAGE_KEYS.LAST_BACKUP, backupData);

            return backupData;
        } catch (error) {
            console.error('Failed to create backup:', error);
            throw error;
        }
    }

    // Restore from backup
    static async restoreFromBackup(backupData: string): Promise<void> {
        try {
            const backup = JSON.parse(backupData);
            
            // Clear existing data
            await this.clearAllTransactions();

            // Restore transactions
            for (const tx of backup.transactions) {
                await AsyncStorage.setItem(
                    `${STORAGE_KEYS.TX_PREFIX}${tx.id}`,
                    JSON.stringify(tx)
                );
            }

            // Rebuild index
            await AsyncStorage.setItem(
                STORAGE_KEYS.TX_INDEX,
                JSON.stringify(backup.transactions.map((tx: any) => tx.id))
            );
        } catch (error) {
            console.error('Failed to restore from backup:', error);
            throw error;
        }
    }

    // Private helper methods
    private static async getTransactionIndex(): Promise<string[]> {
        try {
            const index = await AsyncStorage.getItem(STORAGE_KEYS.TX_INDEX);
            return index ? JSON.parse(index) : [];
        } catch (error) {
            console.error('Failed to get transaction index:', error);
            return [];
        }
    }

    private static async addToIndex(id: string): Promise<void> {
        try {
            const index = await this.getTransactionIndex();
            index.unshift(id); // Add new transaction at the beginning
            await AsyncStorage.setItem(STORAGE_KEYS.TX_INDEX, JSON.stringify(index));
        } catch (error) {
            console.error('Failed to update transaction index:', error);
            throw error;
        }
    }

    private static async clearAllTransactions(): Promise<void> {
        try {
            const index = await this.getTransactionIndex();
            const keys = index.map(id => `${STORAGE_KEYS.TX_PREFIX}${id}`);
            await AsyncStorage.multiRemove([...keys, STORAGE_KEYS.TX_INDEX]);
        } catch (error) {
            console.error('Failed to clear transactions:', error);
            throw error;
        }
    }
}