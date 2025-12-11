import { Cl } from "@stacks/transactions";
import { describe, expect, it, beforeEach } from "vitest";

// Get test accounts from simnet
const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;
const wallet4 = accounts.get("wallet_4")!;

// CONTRACT_OWNER constant from contract
const CONTRACT_OWNER = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

describe("Issue #1: initialize function", () => {
  beforeEach(() => {
    // Reset contract state before each test
    // Note: In a real scenario, we would reset the simnet state
  });

  describe("Successful initialization", () => {
    it("should successfully initialize with valid signers and threshold", () => {
      const signers = [wallet1, wallet2, wallet3];
      const threshold = 2;

      const result = simnet.callPublicFn(
        "multisig",
        "initialize",
        [Cl.list(signers.map((s) => Cl.principal(s))), Cl.uint(threshold)],
        CONTRACT_OWNER
      );

      expect(result.result).toBeOk(Cl.bool(true));

      // Verify signers list is stored correctly
      const storedSigners = simnet.getDataVar("multisig", "signers");
      expect(storedSigners).toBeList(signers.map((s) => Cl.principal(s)));

      // Verify threshold is stored correctly
      const storedThreshold = simnet.getDataVar("multisig", "threshold");
      expect(storedThreshold).toBeUint(threshold);

      // Verify initialized flag is set to true
      const initialized = simnet.getDataVar("multisig", "initialized");
      expect(initialized).toBeBool(true);
    });

    it("should allow initialization with single signer and threshold 1", () => {
      const signers = [wallet1];
      const threshold = 1;

      const result = simnet.callPublicFn(
        "multisig",
        "initialize",
        [Cl.list(signers.map((s) => Cl.principal(s))), Cl.uint(threshold)],
        CONTRACT_OWNER
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should allow initialization with threshold equal to signers count", () => {
      const signers = [wallet1, wallet2, wallet3];
      const threshold = 3; // threshold = signers count

      const result = simnet.callPublicFn(
        "multisig",
        "initialize",
        [Cl.list(signers.map((s) => Cl.principal(s))), Cl.uint(threshold)],
        CONTRACT_OWNER
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });
  });

  describe("Owner-only restriction", () => {
    it("should reject initialization from non-owner", () => {
      const signers = [wallet1, wallet2];
      const threshold = 2;

      // Try to initialize from wallet1 (not the owner)
      const result = simnet.callPublicFn(
        "multisig",
        "initialize",
        [Cl.list(signers.map((s) => Cl.principal(s))), Cl.uint(threshold)],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(1)); // ERR_OWNER_ONLY
    });

    it("should reject initialization from deployer (if not owner)", () => {
      const signers = [wallet1, wallet2];
      const threshold = 2;

      // Try to initialize from deployer (if deployer is not CONTRACT_OWNER)
      const result = simnet.callPublicFn(
        "multisig",
        "initialize",
        [Cl.list(signers.map((s) => Cl.principal(s))), Cl.uint(threshold)],
        deployer
      );

      // This will fail if deployer is not CONTRACT_OWNER
      expect(result.result).toBeErr(Cl.uint(1)); // ERR_OWNER_ONLY
    });
  });

  describe("One-time initialization", () => {
    it("should prevent re-initialization after successful initialization", () => {
      const signers1 = [wallet1, wallet2];
      const threshold1 = 2;

      // First initialization
      const result1 = simnet.callPublicFn(
        "multisig",
        "initialize",
        [Cl.list(signers1.map((s) => Cl.principal(s))), Cl.uint(threshold1)],
        CONTRACT_OWNER
      );

      expect(result1.result).toBeOk(Cl.bool(true));

      // Try to initialize again with different signers
      const signers2 = [wallet3, wallet4];
      const threshold2 = 2;

      const result2 = simnet.callPublicFn(
        "multisig",
        "initialize",
        [Cl.list(signers2.map((s) => Cl.principal(s))), Cl.uint(threshold2)],
        CONTRACT_OWNER
      );

      expect(result2.result).toBeErr(Cl.uint(2)); // ERR_ALREADY_INITIALIZED
    });
  });

  describe("Max signers limit", () => {
    it("should reject initialization with more than 100 signers", () => {
      // Create a list with 101 signers
      const signers: string[] = [];
      for (let i = 0; i < 101; i++) {
        signers.push(`ST${i.toString().padStart(38, "0")}`);
      }

      const threshold = 50;

      const result = simnet.callPublicFn(
        "multisig",
        "initialize",
        [Cl.list(signers.map((s) => Cl.principal(s))), Cl.uint(threshold)],
        CONTRACT_OWNER
      );

      expect(result.result).toBeErr(Cl.uint(3)); // ERR_TOO_MANY_SIGNERS
    });

    it("should accept initialization with exactly 100 signers", () => {
      // Create a list with exactly 100 signers
      const signers: string[] = [];
      for (let i = 0; i < 100; i++) {
        signers.push(`ST${i.toString().padStart(38, "0")}`);
      }

      const threshold = 50;

      const result = simnet.callPublicFn(
        "multisig",
        "initialize",
        [Cl.list(signers.map((s) => Cl.principal(s))), Cl.uint(threshold)],
        CONTRACT_OWNER
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });
  });

  describe("Threshold validation", () => {
    it("should reject threshold less than 1", () => {
      const signers = [wallet1, wallet2];
      const threshold = 0; // Invalid: less than MIN_SIGNATURES_REQUIRED

      const result = simnet.callPublicFn(
        "multisig",
        "initialize",
        [Cl.list(signers.map((s) => Cl.principal(s))), Cl.uint(threshold)],
        CONTRACT_OWNER
      );

      expect(result.result).toBeErr(Cl.uint(4)); // ERR_INVALID_THRESHOLD
    });

    it("should reject threshold greater than signers count", () => {
      const signers = [wallet1, wallet2, wallet3];
      const threshold = 4; // Invalid: greater than signers count (3)

      const result = simnet.callPublicFn(
        "multisig",
        "initialize",
        [Cl.list(signers.map((s) => Cl.principal(s))), Cl.uint(threshold)],
        CONTRACT_OWNER
      );

      expect(result.result).toBeErr(Cl.uint(4)); // ERR_INVALID_THRESHOLD
    });

    it("should accept threshold equal to 1 (minimum)", () => {
      const signers = [wallet1, wallet2];
      const threshold = 1; // Valid: minimum threshold

      const result = simnet.callPublicFn(
        "multisig",
        "initialize",
        [Cl.list(signers.map((s) => Cl.principal(s))), Cl.uint(threshold)],
        CONTRACT_OWNER
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should accept threshold equal to signers count (maximum)", () => {
      const signers = [wallet1, wallet2, wallet3];
      const threshold = 3; // Valid: equal to signers count

      const result = simnet.callPublicFn(
        "multisig",
        "initialize",
        [Cl.list(signers.map((s) => Cl.principal(s))), Cl.uint(threshold)],
        CONTRACT_OWNER
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });
  });

  describe("Storage verification", () => {
    it("should store signers list correctly", () => {
      const signers = [wallet1, wallet2, wallet3];
      const threshold = 2;

      const result = simnet.callPublicFn(
        "multisig",
        "initialize",
        [Cl.list(signers.map((s) => Cl.principal(s))), Cl.uint(threshold)],
        CONTRACT_OWNER
      );

      expect(result.result).toBeOk(Cl.bool(true));

      // Verify signers list is stored correctly
      const storedSigners = simnet.getDataVar("multisig", "signers");
      expect(storedSigners).toBeList(signers.map((s) => Cl.principal(s)));
      expect(storedSigners.list.length).toBe(3);
    });

    it("should store threshold correctly", () => {
      const signers = [wallet1, wallet2, wallet3];
      const threshold = 2;

      const result = simnet.callPublicFn(
        "multisig",
        "initialize",
        [Cl.list(signers.map((s) => Cl.principal(s))), Cl.uint(threshold)],
        CONTRACT_OWNER
      );

      expect(result.result).toBeOk(Cl.bool(true));

      // Verify threshold is stored correctly
      const storedThreshold = simnet.getDataVar("multisig", "threshold");
      expect(storedThreshold).toBeUint(threshold);
    });

    it("should set initialized flag to true", () => {
      const signers = [wallet1, wallet2];
      const threshold = 2;

      // Verify initialized is false before initialization
      const initializedBefore = simnet.getDataVar("multisig", "initialized");
      expect(initializedBefore).toBeBool(false);

      const result = simnet.callPublicFn(
        "multisig",
        "initialize",
        [Cl.list(signers.map((s) => Cl.principal(s))), Cl.uint(threshold)],
        CONTRACT_OWNER
      );

      expect(result.result).toBeOk(Cl.bool(true));

      // Verify initialized is true after initialization
      const initializedAfter = simnet.getDataVar("multisig", "initialized");
      expect(initializedAfter).toBeBool(true);
    });
  });
});
