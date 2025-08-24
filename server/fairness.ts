import crypto from 'crypto';

export interface FairnessData {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  combinedHash: string;
  resultHash: string;
}

export class FairnessSystem {
  // Generate a cryptographically secure server seed
  static generateServerSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate client seed (can be user-provided or random)
  static generateClientSeed(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  // Create combined hash from server seed, client seed, and nonce
  static createCombinedHash(serverSeed: string, clientSeed: string, nonce: number): string {
    const combined = `${serverSeed}:${clientSeed}:${nonce}`;
    return crypto.createHash('sha256').update(combined).digest('hex');
  }

  // Generate a deterministic result from the combined hash
  static generateResult(combinedHash: string, itemCount: number): number {
    // Use the first 8 bytes of the hash to create a number
    const hashBytes = Buffer.from(combinedHash.slice(0, 16), 'hex');
    const number = hashBytes.readBigUInt64BE(0);
    
    // Convert to a number between 0 and itemCount-1
    return Number(number % BigInt(itemCount));
  }

  // Create result hash for verification
  static createResultHash(result: number): string {
    return crypto.createHash('sha256').update(result.toString()).digest('hex');
  }

  // Verify a fairness proof
  static verifyProof(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    expectedCombinedHash: string,
    expectedResultHash: string,
    expectedResult: number
  ): boolean {
    // Recreate combined hash
    const combinedHash = this.createCombinedHash(serverSeed, clientSeed, nonce);
    
    // Recreate result hash
    const resultHash = this.createResultHash(expectedResult);
    
    // Verify both hashes match
    return combinedHash === expectedCombinedHash && resultHash === expectedResultHash;
  }

  // Generate complete fairness data for a box opening
  static generateFairnessData(clientSeed: string, nonce: number, itemCount: number): FairnessData & { result: number } {
    const serverSeed = this.generateServerSeed();
    const combinedHash = this.createCombinedHash(serverSeed, clientSeed, nonce);
    const result = this.generateResult(combinedHash, itemCount);
    const resultHash = this.createResultHash(result);

    return {
      serverSeed,
      clientSeed,
      nonce,
      combinedHash,
      resultHash,
      result
    };
  }

  // Generate weighted random selection with fairness proof
  static generateWeightedResult(
    combinedHash: string,
    weights: number[]
  ): number {
    // Calculate total weight
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    // Use hash to generate a number between 0 and totalWeight-1
    const hashBytes = Buffer.from(combinedHash.slice(0, 16), 'hex');
    const number = hashBytes.readBigUInt64BE(0);
    const randomValue = Number(number % BigInt(totalWeight));
    
    // Find which item this random value corresponds to
    let currentWeight = 0;
    for (let i = 0; i < weights.length; i++) {
      currentWeight += weights[i];
      if (randomValue < currentWeight) {
        return i;
      }
    }
    
    // Fallback to last item (shouldn't happen with proper weights)
    return weights.length - 1;
  }

  // Get public verification info (without revealing server seed)
  static getPublicVerificationInfo(fairnessData: FairnessData): {
    clientSeed: string;
    nonce: number;
    combinedHashPreview: string;
    resultHash: string;
  } {
    return {
      clientSeed: fairnessData.clientSeed,
      nonce: fairnessData.nonce,
      combinedHashPreview: fairnessData.combinedHash.slice(0, 8) + '...',
      resultHash: fairnessData.resultHash
    };
  }

  // Reveal complete proof for verification
  static revealProof(fairnessData: FairnessData): {
    serverSeed: string;
    clientSeed: string;
    nonce: number;
    combinedHash: string;
    resultHash: string;
    verificationUrl: string;
  } {
    const verificationUrl = `/verify-fairness?server=${fairnessData.serverSeed}&client=${fairnessData.clientSeed}&nonce=${fairnessData.nonce}&hash=${fairnessData.combinedHash}&result=${fairnessData.resultHash}`;
    
    return {
      ...fairnessData,
      verificationUrl
    };
  }
}