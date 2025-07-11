"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

export default function KycPage() {
  const { address } = useAccount();
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
        setSuccess("Votre demande KYC a bien été soumise. Elle est en attente de validation.");
      } else {
        setError(data.message || "Erreur lors de la soumission du KYC.");
      }
    } catch (e) {
      setError("Erreur réseau lors de la soumission du KYC.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-gray-900 rounded-xl mt-10 border border-gray-700 shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-6 text-center">Formulaire KYC Club</h1>
      {success ? (
        <div className="bg-green-900/30 text-green-300 p-4 rounded mb-4 text-center">{success}</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="clubWalletAddress" value={address || ""} />
          <div>
            <label className="block text-gray-300 mb-1">Nom du club *</label>
            <input name="clubName" value={form.clubName} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Statut légal *</label>
            <input name="legalStatus" value={form.legalStatus} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Numéro d'enregistrement *</label>
            <input name="registrationNumber" value={form.registrationNumber} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Adresse *</label>
            <input name="address" value={form.address} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Nom du représentant *</label>
            <input name="representativeName" value={form.representativeName} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Lien vers un justificatif (statuts, etc.) *</label>
            <input name="documentUrl" value={form.documentUrl} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" placeholder="URL du document" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Lien vers la pièce d'identité du représentant *</label>
            <input name="idCardUrl" value={form.idCardUrl} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" placeholder="URL de la pièce d'identité" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Numéro d'affiliation (optionnel)</label>
            <input name="affiliationNumber" value={form.affiliationNumber} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white" />
          </div>
          {error && <div className="bg-red-900/30 text-red-300 p-2 rounded text-center">{error}</div>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all">
            {loading ? "Envoi en cours..." : "Soumettre le KYC"}
          </button>
        </form>
      )}
    </div>
  );
} 