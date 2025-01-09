import { bytesToHex, randomBytes } from "@noble/hashes/utils";
import { blake3 } from "@noble/hashes/blake3";
import { deriveKeyFromPassword } from "@/lib/utils/encrypt";
import sodium from "react-native-libsodium";

// Types for better type safety and documentation
export interface GenesisState {
  socket: bigint;
  matrixSeed: string;
  secretSeed: string;
}

export interface TransactionResult {
  isValid: boolean;
  nextSocket: bigint;
  matrixSeed: string;
  secretSeed: string;
}

export interface LWEConfig {
  dimension?: number;
  errorBound?: number;
  prime?: bigint;
}

export class LWEMechanism {
  private readonly PRIME: bigint;
  private readonly DIMENSION: number;
  private readonly ERROR_BOUND: number;

  constructor(
    private readonly masterSeed: bigint,
    private readonly password: string,
    config?: LWEConfig
  ) {
    // Allow customization of parameters while providing defaults
    this.PRIME = config?.prime ?? 2n ** 32n - 5n;
    this.DIMENSION = config?.dimension ?? 512;
    this.ERROR_BOUND = config?.errorBound ?? 16;
  }

  // Get current configuration
  public getConfig(): LWEConfig {
    return {
      dimension: this.DIMENSION,
      errorBound: this.ERROR_BOUND,
      prime: this.PRIME,
    };
  }

  private generateMatrix(seed: string): bigint[][] {
    const matrix: bigint[][] = [];

    for (let i = 0; i < this.DIMENSION; i++) {
      matrix[i] = [];
      for (let j = 0; j < this.DIMENSION; j++) {
        const element = this.hashToField(`${seed}-${i}-${j}`);
        matrix[i][j] = element;
      }
    }

    return matrix;
  }

  private generateSecretVector(seed: string): bigint[] {
    const vector: bigint[] = [];

    for (let i = 0; i < this.DIMENSION; i++) {
      vector[i] = this.hashToField(`${seed}-s-${i}`);
    }

    return vector;
  }

  private generateErrorVector(transaction: string): bigint[] {
    const vector: bigint[] = [];

    for (let i = 0; i < this.DIMENSION; i++) {
      const error = BigInt(
        Math.floor(Math.random() * (2 * this.ERROR_BOUND) - this.ERROR_BOUND)
      );
      vector[i] = error;
    }

    return vector;
  }

  private multiply(matrix: bigint[][], vector: bigint[]): bigint[] {
    const result: bigint[] = [];

    for (let i = 0; i < this.DIMENSION; i++) {
      let sum = 0n;
      for (let j = 0; j < this.DIMENSION; j++) {
        sum = (sum + matrix[i][j] * vector[j]) % this.PRIME;
      }
      result[i] = sum;
    }

    return result;
  }

  private addVectors(a: bigint[], b: bigint[]): bigint[] {
    const result: bigint[] = [];

    for (let i = 0; i < this.DIMENSION; i++) {
      result[i] = (a[i] + b[i]) % this.PRIME;
    }

    return result;
  }

  private hashToField(input: string): bigint {
    const inputBytes = new TextEncoder().encode(input);
    const hashBytes = blake3(inputBytes);
    const hashHex = bytesToHex(hashBytes);
    return BigInt("0x" + hashHex) % this.PRIME;
  }

  public createGenesisState(): GenesisState {
    const A = this.generateMatrix(this.masterSeed.toString());
    const s = this.generateSecretVector(this.password);
    const e = this.generateErrorVector("genesis");

    const As = this.multiply(A, s);
    const result = this.addVectors(As, e);
    const socket = this.hashToField(result.join("-"));

    return {
      socket,
      matrixSeed: this.masterSeed.toString(),
      secretSeed: this.password,
    };
  }

  public processTransaction(
    previousSocket: bigint,
    transaction: string
  ): TransactionResult {
    try {
      const newMatrixSeed = this.hashToField(
        `${this.masterSeed.toString()}-${transaction}`
      ).toString();
      const A = this.generateMatrix(newMatrixSeed);

      const newSecretSeed = this.hashToField(
        `${this.password}-${transaction}`
      ).toString();
      const s = this.generateSecretVector(newSecretSeed);

      const e = this.generateErrorVector(transaction);

      const As = this.multiply(A, s);
      const result = this.addVectors(As, e);
      const nextSocket = this.hashToField(result.join("-"));

      return {
        isValid: true,
        nextSocket,
        matrixSeed: newMatrixSeed,
        secretSeed: newSecretSeed,
      };
    } catch (error) {
      return {
        isValid: false,
        nextSocket: previousSocket,
        matrixSeed: "",
        secretSeed: "",
      };
    }
  }
}

// Utility functions for string/bigint conversion
export const utils = {
  // Convert a decimal string to BigInt safely
  stringToBigInt(value: string): bigint {
    try {
      return BigInt(value);
    } catch (e) {
      throw new Error(`Invalid BigInt string: ${value}`);
    }
  },

  // Convert a BigInt to a readable string
  bigIntToString(value: bigint): string {
    return value.toString();
  },

  // Format socket as hex string
  formatSocket(socket: bigint): string {
    return "0x" + socket.toString(16).padStart(16, "0");
  },
};

export const generateMasterSeed = async (
  password: string
): Promise<{ seedBytes: Uint8Array; salt: Uint8Array }> => {
  try {
    await sodium.ready;
    const libsodium = sodium;
    try {
      console.log("Generating master seed...");
      // Derive key and salt
      const { key, salt } = await deriveKeyFromPassword(password);
      console.log("Derived key and salt.");

      // Generate seed bytes (example: random 32 bytes)
      const seedBytes = sodium.randombytes_buf(32);
      console.log("Generated seed bytes.");

      return { seedBytes, salt };
    } catch (error) {
      console.error("Master seed generation failed:", error);
      throw error;
    }
  } catch (e) {
    console.error("Master seed generation failed:", e);
    throw e;
  }
};
