import { afterEach, describe, expect, it } from "vitest";
import { caip2ForNetwork, defaultNetworkId, isSupportedNetwork } from "./networks";

afterEach(() => {
  delete process.env.DAKOTA_NETWORK_ID;
});

describe("networks", () => {
  it("maps Base networks to their CAIP-2 chain ids", () => {
    expect(caip2ForNetwork("base-mainnet")).toBe("eip155:8453");
    expect(caip2ForNetwork("base-sepolia")).toBe("eip155:84532");
  });

  it("defaults to base-sepolia when DAKOTA_NETWORK_ID is unset", () => {
    delete process.env.DAKOTA_NETWORK_ID;
    expect(defaultNetworkId()).toBe("base-sepolia");
  });

  it("reads DAKOTA_NETWORK_ID when set", () => {
    process.env.DAKOTA_NETWORK_ID = "base-mainnet";
    expect(defaultNetworkId()).toBe("base-mainnet");
  });

  it("throws on unsupported network ids", () => {
    process.env.DAKOTA_NETWORK_ID = "ethereum-mainnet";
    expect(() => defaultNetworkId()).toThrow(/Unsupported DAKOTA_NETWORK_ID/);
  });

  it("type-guards network ids", () => {
    expect(isSupportedNetwork("base-sepolia")).toBe(true);
    expect(isSupportedNetwork("dogecoin")).toBe(false);
  });
});
