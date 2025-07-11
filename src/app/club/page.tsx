"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function ClubPage() {
  const { address, isConnected } = useAccount();
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [clubName, setClubName] = useState("");
  const [form, setForm] = useState({
    targetAmount: "",
    annualInterestRate: "",
    duration: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Vérifie le statut KYC du club connecté
  useEffect(() => {
    if (!isConnected || !address) return;
    setKycStatus(null);
    setClubName("");
    fetch(`/api/user?walletAddress=${address}`)
      .then(res => res.ok ? res.json() : null)
      .then(user => {
        if (user?.accountType === "club") {
          // On va chercher le KYC
          fetch(`/api/kyc/status?walletAddress=${address}`)
            .then(res => res.ok ? res.json() : null)
            .then(kyc => {
              setKycStatus(kyc?.status || null);
              setClubName(kyc?.clubName || "");
            });
        }
      });
  }, [address, isConnected]);

  // Gestion du formulaire de création de campagne (à brancher sur le smart contract)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    // Ici tu brancheras l'appel au smart contract (wagmi/ethers)
    setTimeout(() => {
      setSuccess("Campagne créée (simulation, à brancher sur le smart contract) !");
      setLoading(false);
    }, 1500);
  };

  if (!isConnected) {
    return <div className="max-w-xl mx-auto p-8 mt-10 text-center text-white">Connectez votre wallet pour accéder à l'espace club.</div>;
  }

  if (kycStatus === null) {
    return <div className="max-w-xl mx-auto p-8 mt-10 text-center text-white">Chargement du statut KYC...</div>;
  }

  // Affiche toujours le statut KYC
  let kycColor = "text-gray-300 bg-gray-800 border-gray-700";
  let kycLabel = "Statut KYC inconnu";
  if (kycStatus === "pending") {
    kycColor = "text-yellow-300 bg-yellow-900/20 border-yellow-700";
    kycLabel = "KYC en attente de validation";
  } else if (kycStatus === "rejected") {
    kycColor = "text-red-300 bg-red-900/20 border-red-700";
    kycLabel = "KYC refusé";
  } else if (kycStatus === "validated") {
    kycColor = "text-green-300 bg-green-900/20 border-green-700";
    kycLabel = "KYC validé";
  }

  return (
    <div className="max-w-xl mx-auto p-8 mt-10 bg-gray-900 rounded-xl border border-gray-700 shadow-lg">
      <div className={`mb-6 p-4 rounded-xl border text-center font-semibold ${kycColor}`}>{kycLabel}</div>
      {kycStatus === "validated" ? (
        <>
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Créer une campagne</h1>
          {success && <div className="bg-green-900/30 text-green-300 p-4 rounded mb-4 text-center">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-1">Nom du club</label>
              <input name="clubName" value={clubName} disabled className="w-full p-2 rounded bg-gray-800 text-white" />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Montant cible (PSG)</label>
              <input name="targetAmount" value={form.targetAmount} onChange={handleChange} required type="number" min="100" className="w-full p-2 rounded bg-gray-800 text-white" />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Taux d'intérêt annuel (%)</label>
              <input name="annualInterestRate" value={form.annualInterestRate} onChange={handleChange} required type="number" min="1" max="100" className="w-full p-2 rounded bg-gray-800 text-white" />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Durée (jours)</label>
              <input name="duration" value={form.duration} onChange={handleChange} required type="number" min="7" max="365" className="w-full p-2 rounded bg-gray-800 text-white" />
            </div>
            {error && <div className="bg-red-900/30 text-red-300 p-2 rounded text-center">{error}</div>}
            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all">
              {loading ? "Création en cours..." : "Créer la campagne"}
            </button>
          </form>
        </>
      ) : null}
    </div>
  );
} 