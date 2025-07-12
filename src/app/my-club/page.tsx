"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { CONTRACTS, TWELFTH_MAN_ABI } from "../../config/contracts";
import { parseAbiItem, getEventSelector, decodeEventLog } from 'viem';

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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

  const publicClient = usePublicClient();

  // Gérer les succès et erreurs
  useEffect(() => {
    if (txData) {
      setTxHash(txData);
      setSuccess("Transaction envoyée !");
    }
  }, [txData]);

  useEffect(() => {
    if (txError) {
      setError(txError.message || "Erreur lors de la transaction");
    }
  }, [txError]);

  useEffect(() => {
    if (isTxSuccess) {
      setSuccess("Campagne créée avec succès !");
      setForm({
        clubName: "",
        targetAmount: "",
        annualInterestRate: "",
        duration: "",
      });
      setImagePreview(null);
      setImageFile(null);
      setImageUrl(null);
    }
  }, [isTxSuccess]);

  useEffect(() => {
    const saveImage = async () => {
      if (isTxSuccess && txHash && imageUrl && publicClient) {
        try {
          const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
          // Décoder l'event CampaignCreated
          const eventSignature = getEventSelector(
            "CampaignCreated(uint256,address,string,uint256,uint256,uint256,uint256)"
          );
          const log = receipt.logs.find(log => log.topics[0] === eventSignature);
          if (log) {
            const decoded = decodeEventLog({
              abi: [
                {
                  type: 'event',
                  name: 'CampaignCreated',
                  inputs: [
                    { indexed: true, name: 'campaignId', type: 'uint256' },
                    { indexed: true, name: 'clubOwner', type: 'address' },
                    { indexed: false, name: 'clubName', type: 'string' },
                    { indexed: false, name: 'targetAmount', type: 'uint256' },
                    { indexed: false, name: 'annualInterestRate', type: 'uint256' },
                    { indexed: false, name: 'duration', type: 'uint256' },
                    { indexed: false, name: 'deadline', type: 'uint256' },
                  ],
                  anonymous: false,
                },
              ],
              data: log.data,
              topics: log.topics,
            });
            const campaignId = Number(decoded.args.campaignId);
            // Enregistrer dans MongoDB
            await fetch('/api/campaign-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ campaignId, imageUrl }),
            });
          }
        } catch (e) {
          // Optionnel : afficher une erreur si besoin
          console.error('Erreur lors de l’enregistrement de l’image de campagne :', e);
        }
      }
    };
    saveImage();
  }, [isTxSuccess, txHash, imageUrl, publicClient]);

  // Gestion du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_preset");
    const res = await fetch("https://api.cloudinary.com/v1_1/dbjmkzn2c/image/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Erreur lors de l'upload de l'image");
    const data = await res.json();
    return data.secure_url as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    let uploadedImageUrl = imageUrl;
    try {
      if (imageFile) {
        uploadedImageUrl = await uploadToCloudinary(imageFile);
        setImageUrl(uploadedImageUrl);
      }
    } catch (err) {
      setError("Erreur lors de l'upload de l'image. Veuillez réessayer.");
      return;
    }
    if (!form.clubName || !form.targetAmount || !form.annualInterestRate || !form.duration) {
      setError("Tous les champs sont obligatoires");
      return;
    }
    // Conversion des valeurs pour le smart contract
    const targetAmount = BigInt(Math.floor(Number(form.targetAmount) * 1e18));
    const annualInterestRate = BigInt(Math.floor(Number(form.annualInterestRate) * 100)); // en basis points
    const duration = BigInt(Number(form.duration) * 24 * 3600); // jours -> secondes
    writeContract({
      address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
      abi: TWELFTH_MAN_ABI,
      functionName: "createCampaign",
      args: [form.clubName, targetAmount, annualInterestRate, duration] as [string, bigint, bigint, bigint],
    });
  };

  if (!isConnected) {
    return <div className="max-w-xl mx-auto mt-10 text-center text-white">Connectez-vous pour accéder à cette page.</div>;
  }
  if (loading) {
    return <div className="max-w-xl mx-auto mt-10 text-center text-white">Chargement...</div>;
  }
  if (accountType !== "club") {
    return <div className="max-w-xl mx-auto mt-10 text-center text-white">Accès réservé aux clubs.</div>;
  }
  if (!kycValidated) {
    // Déterminer le statut à afficher
    let statutAffiche = "Non soumis";
    if (typeof window !== "undefined" && address && localStorage.getItem(`kyc_submitted_${address}`) === 'true') {
      statutAffiche = "En attente";
    }
    return (
      <div className="max-w-xl mx-auto mt-10 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Statut KYC</h2>
        <p>
          Votre KYC est :
          <span className={`font-bold ml-2 ${statutAffiche === "En attente" ? "text-yellow-400" : "text-red-400"}`}>
            {statutAffiche}
          </span>
        </p>
        <p className="mt-4 text-gray-400">Vous ne pouvez créer une campagne qu'une fois votre KYC validé.</p>
        <button
          className="mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
          onClick={() => window.location.href = "/kyc"}
        >
          Faire la demande de KYC
        </button>
      </div>
    );
  }
  if (kycValidated) {
    return (
      <div className="max-w-xl mx-auto mt-10 bg-gray-900 p-8 rounded-xl border border-gray-700 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Créer une campagne</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Nom du club *</label>
            <input name="clubName" value={form.clubName} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Montant cible (PSG) *</label>
            <input name="targetAmount" type="number" min="100" step="0.01" value={form.targetAmount} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Taux d'intérêt annuel (%) *</label>
            <input name="annualInterestRate" type="number" min="0.01" max="100" step="0.01" value={form.annualInterestRate} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Durée (jours) *</label>
            <input name="duration" type="number" min="7" max="365" value={form.duration} onChange={handleChange} required className="w-full p-2 rounded bg-gray-800 text-white" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Image de la campagne</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-gray-300" />
            {imagePreview && (
              <div className="mt-2 flex justify-center">
                <img src={imagePreview} alt="Aperçu" className="max-h-40 rounded-lg border border-gray-700" />
              </div>
            )}
          </div>
          {error && <div className="bg-red-900/30 text-red-300 p-2 rounded text-center">{error}</div>}
          {success && <div className="bg-green-900/30 text-green-300 p-2 rounded text-center">{success}</div>}
          <button type="submit" disabled={isTxLoading} className="w-full py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all">
            {isTxLoading ? "Création en cours..." : "Créer la campagne"}
          </button>
        </form>
        {isTxSuccess && <div className="mt-4 text-green-400 text-center">Campagne créée avec succès !</div>}
      </div>
    );
  }
} 