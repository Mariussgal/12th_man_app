"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

export default function KycPage() {
  const { address } = useAccount();
  const router = useRouter();
  const [form, setForm] = useState({
    clubWalletAddress: address || "",
    clubName: "",
    legalStatus: "",
    registrationNumber: "",
    address: "",
    representativeName: "",
    documentUrl: "",
    idCardUrl: "",
    affiliationNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, clubWalletAddress: address }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Your KYC application has been successfully submitted and is pending validation.");
        // Store locally that KYC has been submitted
        if (address) {
          localStorage.setItem(`kyc_submitted_${address}`, 'true');
        }
        // Redirect to home page after 2 seconds
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setError(data.message || "Error occurred during KYC submission.");
      }
    } catch (e) {
      setError("Network error during KYC submission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-gray-900 rounded-xl mt-10 border border-gray-700 shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-6 text-center">Club KYC Form</h1>
      {success ? (
        <div className="bg-green-900/30 text-green-300 p-4 rounded mb-4 text-center">{success}</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="clubWalletAddress" value={address || ""} />
          <div>
            <label className="block text-gray-300 mb-1">Club Name *</label>
            <input name="clubName" value={form.clubName} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Legal Status *</label>
            <input name="legalStatus" value={form.legalStatus} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" placeholder="e.g., Association, Corporation, Ltd." />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Registration Number *</label>
            <input name="registrationNumber" value={form.registrationNumber} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" placeholder="Official registration number" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Address *</label>
            <input name="address" value={form.address} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" placeholder="Full business address" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Representative Name *</label>
            <input name="representativeName" value={form.representativeName} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" placeholder="Legal representative full name" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Legal Document URL *</label>
            <input name="documentUrl" value={form.documentUrl} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" placeholder="Link to articles of incorporation, bylaws, etc." />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Representative ID Document URL *</label>
            <input name="idCardUrl" value={form.idCardUrl} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" placeholder="Link to representative's ID document" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Affiliation Number (Optional)</label>
            <input name="affiliationNumber" value={form.affiliationNumber} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white" placeholder="League/Federation affiliation number" />
          </div>
          {error && <div className="bg-red-900/30 text-red-300 p-2 rounded text-center">{error}</div>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all">
            {loading ? "Submitting..." : "Submit KYC Application"}
          </button>
        </form>
      )}
    </div>
  );
} 