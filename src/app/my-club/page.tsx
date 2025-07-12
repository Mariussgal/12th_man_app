"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS, TWELFTH_MAN_ABI } from "../../config/contracts";

export default function MyClubPage() {
  const { address, isConnected } = useAccount();
  const [accountType, setAccountType] = useState<string | null>(null);
  const [kycValidated, setKycValidated] = useState<boolean>(false);
  const [kycStatus, setKycStatus] = useState<string>("pending");
  const [loading, setLoading] = useState(true);

  // Form
  const [form, setForm] = useState({
    clubName: "",
    targetAmount: "",
    annualInterestRate: "",
    duration: "",
  });
  const [txHash, setTxHash] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Get user info
  useEffect(() => {
    if (!isConnected || !address) return;
    setLoading(true);
    fetch(`/api/user?walletAddress=${address}`)
      .then(async (res) => {
        if (res.ok) {
          const user = await res.json();
          setAccountType(user.accountType);
          setKycValidated(!!user.kycValidated);
          setKycStatus(user.kycStatus || (user.kycValidated ? "validated" : "pending"));
        }
      })
      .finally(() => setLoading(false));
  }, [isConnected, address]);

  // Wagmi for writing to smart contract
  const { writeContract, data: txData, isPending: isTxLoading, error: txError } = useWriteContract();

  const { isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash && txHash.startsWith('0x') ? (txHash as `0x${string}`) : undefined
  });

  // Handle success and errors
  useEffect(() => {
    if (txData) {
      setTxHash(txData);
      setSuccess("Transaction sent!");
    }
  }, [txData]);

  useEffect(() => {
    if (txError) {
      setError(txError.message || "Error during transaction");
    }
  }, [txError]);

  useEffect(() => {
    if (isTxSuccess) {
      setSuccess("Campaign created successfully!");
      setForm({
        clubName: "",
        targetAmount: "",
        annualInterestRate: "",
        duration: "",
      });
    }
  }, [isTxSuccess]);

  // Form management
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.clubName || !form.targetAmount || !form.annualInterestRate || !form.duration) {
      setError("All fields are required");
      return;
    }
    // Convert values for smart contract
    const targetAmount = BigInt(Math.floor(Number(form.targetAmount) * 1e18));
    const annualInterestRate = BigInt(Math.floor(Number(form.annualInterestRate) * 100)); // in basis points
    const duration = BigInt(Number(form.duration) * 24 * 3600); // days -> seconds
    writeContract({
      address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
      abi: TWELFTH_MAN_ABI,
      functionName: "createCampaign",
      args: [form.clubName, targetAmount, annualInterestRate, duration] as [string, bigint, bigint, bigint],
    });
  };

  if (!isConnected) {
    return <div className="max-w-xl mx-auto mt-10 text-center text-white">Please connect to access this page.</div>;
  }
  if (loading) {
    return <div className="max-w-xl mx-auto mt-10 text-center text-white">Loading...</div>;
  }
  if (accountType !== "club") {
    return <div className="max-w-xl mx-auto mt-10 text-center text-white">Access restricted to clubs only.</div>;
  }
  if (!kycValidated) {
    // Determine status to display
    let displayStatus = "Not submitted";
    if (typeof window !== "undefined" && address && localStorage.getItem(`kyc_submitted_${address}`) === 'true') {
      displayStatus = "Pending";
    }
    return (
      <div className="max-w-xl mx-auto mt-10 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">KYC Status</h2>
        <p>
          Your KYC is:
          <span className={`font-bold ml-2 ${displayStatus === "Pending" ? "text-yellow-400" : "text-red-400"}`}>
            {displayStatus}
          </span>
        </p>
        <p className="mt-4 text-gray-400">You can only create a campaign once your KYC is validated.</p>
        <button
          className="mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
          onClick={() => window.location.href = "/kyc"}
        >
          Submit KYC Request
        </button>
      </div>
    );
  }
  return (
    <div className="max-w-xl mx-auto mt-10 bg-gray-900 p-8 rounded-xl border border-gray-700 shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-6 text-center">Create a Campaign</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-1">Club Name *</label>
          <input name="clubName" value={form.clubName} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Target Amount (USDC) *</label>
          <input name="targetAmount" type="number" min="100" step="0.01" value={form.targetAmount} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Annual Interest Rate (%) *</label>
          <input name="annualInterestRate" type="number" min="0.01" max="100" step="0.01" value={form.annualInterestRate} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Duration (days) *</label>
          <input name="duration" type="number" min="7" max="365" value={form.duration} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" />
        </div>
        {error && <div className="bg-red-900/30 text-red-300 p-2 rounded text-center">{error}</div>}
        {success && <div className="bg-green-900/30 text-green-300 p-2 rounded text-center">{success}</div>}
        <button type="submit" disabled={isTxLoading} className="w-full py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all">
          {isTxLoading ? "Creating..." : "Create Campaign"}
        </button>
      </form>
      {isTxSuccess && <div className="mt-4 text-green-400 text-center">Campaign created successfully!</div>}
    </div>
  );
} 