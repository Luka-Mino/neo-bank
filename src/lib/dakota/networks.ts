export const NETWORKS = {
  "base-mainnet": { caip2: "eip155:8453" },
  "base-sepolia": { caip2: "eip155:84532" },
} as const;

export type NetworkId = keyof typeof NETWORKS;

export function isSupportedNetwork(id: string): id is NetworkId {
  return id in NETWORKS;
}

export function defaultNetworkId(): NetworkId {
  const id = process.env.DAKOTA_NETWORK_ID || "base-sepolia";
  if (!isSupportedNetwork(id)) {
    throw new Error(
      `Unsupported DAKOTA_NETWORK_ID "${id}" — supported: ${Object.keys(NETWORKS).join(", ")}`
    );
  }
  return id;
}

export function caip2ForNetwork(networkId: NetworkId): string {
  return NETWORKS[networkId].caip2;
}
