"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useReadContract } from "wagmi";
import { CONTRACTS, TWELFTH_MAN_ABI, PSG_TOKEN_ABI } from "../../config/contracts";
import { parseAbiItem, getEventSelector, decodeEventLog } from 'viem';
import Image from 'next/image';

export default function MyClubPage() {
  const { address, isConnected } = useAccount();
  const [accountType, setAccountType] = useState<string | null>(null);
  const [kycValidated, setKycValidated] = useState<boolean>(false);
  const [kycStatus, setKycStatus] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [clubCampaigns, setClubCampaigns] = useState<any[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

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

  // Get PSG balance
  const { data: psgBalance = BigInt(0) } = useReadContract({
    address: CONTRACTS.PSG_TOKEN as `0x${string}`,
    abi: PSG_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  });

  // Get PSG token decimals
  const { data: tokenDecimals } = useReadContract({
    address: CONTRACTS.PSG_TOKEN as `0x${string}`,
    abi: PSG_TOKEN_ABI,
    functionName: 'decimals',
    query: { enabled: !!address }
  });

  // Wagmi for writing to smart contract
  const { writeContract, data: txData, isPending: isTxLoading, error: txError } = useWriteContract();

  const { isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash && txHash.startsWith('0x') ? (txHash as `0x${string}`) : undefined
  });

  const publicClient = usePublicClient();

  // Fetch campaigns created by this club
  useEffect(() => {
    async function fetchClubCampaigns() {
      if (!publicClient || !address) return;
      
      setLoadingCampaigns(true);
      try {
        const eventSelector = getEventSelector(
          'CampaignCreated(uint256,address,string,uint256,uint256,uint256,uint256)'
        );
        const logs = await publicClient.getLogs({
          address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
          event: {
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
          },
          fromBlock: 'earliest',
          toBlock: 'latest',
        });

        // Filter campaigns created by this club
        const clubLogs = logs.filter(log => 
          log.args.clubOwner?.toLowerCase() === address.toLowerCase()
        );

        // Extract campaign info
        const campaigns = await Promise.all(
          clubLogs.map(async (log) => {
            const campaignId = Number(log.args.campaignId);
            try {
              const info = await publicClient.readContract({
                address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
                abi: TWELFTH_MAN_ABI,
                functionName: 'getCampaignInfo',
                args: [BigInt(campaignId)],
              });
              return {
                id: campaignId,
                clubName: info[1],
                targetAmount: info[2],
                currentAmount: info[3],
                interestRate: Number(info[4]) / 100,
                deadline: info[5],
                isActive: info[6],
                isCompleted: info[7],
                contributorsCount: Number(info[8]),
              };
            } catch (e) {
              return null;
            }
          })
        );

        setClubCampaigns(campaigns.filter(Boolean));
      } catch (e) {
        console.error('Error fetching club campaigns:', e);
        setClubCampaigns([]);
      } finally {
        setLoadingCampaigns(false);
      }
    }

    if (kycValidated && address) {
      fetchClubCampaigns();
    }
  }, [publicClient, address, kycValidated]);

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
      
      // Refresh campaigns list
      if (publicClient && address) {
        setTimeout(() => {
          // Trigger refetch of campaigns
          window.location.reload();
        }, 2000);
      }
    }
  }, [isTxSuccess, publicClient, address]);

  useEffect(() => {
    const saveImage = async () => {
      console.log('saveImage called with:', { isTxSuccess, txHash, imageUrl, publicClient: !!publicClient });
      
      if (isTxSuccess && txHash && imageUrl && publicClient) {
        try {
          console.log('Getting transaction receipt for hash:', txHash);
          const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
          console.log('Transaction receipt:', receipt);
          
          // Décoder l'event CampaignCreated
          const eventSignature = getEventSelector(
            "CampaignCreated(uint256,address,string,uint256,uint256,uint256,uint256)"
          );
          console.log('Event signature:', eventSignature);
          
          const log = receipt.logs.find(log => log.topics[0] === eventSignature);
          console.log('Found log:', log);
          
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
            console.log('Decoded event:', decoded);
            
            const campaignId = Number(decoded.args.campaignId);
            console.log('Extracted campaign ID:', campaignId);
            
            // Enregistrer dans MongoDB
            console.log('Saving to MongoDB:', { campaignId, imageUrl });
            const response = await fetch('/api/campaign-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ campaignId, imageUrl }),
            });
            
            const result = await response.json();
            console.log('MongoDB save result:', result);
          } else {
            console.log('No CampaignCreated event found in logs');
          }
        } catch (e) {
          console.error('Erreur lors de l\'enregistrement de l\'image de campagne :', e);
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

  // Helper functions
  const formatPSGBalance = (rawBalance: bigint, decimals: number | undefined) => {
    if (!decimals) return '0';
    const divisor = BigInt(10 ** decimals);
    const whole = rawBalance / divisor;
    const remainder = rawBalance % divisor;
    const fractional = remainder.toString().padStart(decimals, '0').slice(0, 2);
    return `${whole}.${fractional}`;
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatCurrency = (amount: bigint) => {
    const formatted = Number(amount) / 1e18;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(formatted);
  };

  const getStatusBadge = (campaign: any) => {
    if (!campaign.isActive) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium text-white bg-gray-500">Inactive</span>;
    }
    if (campaign.isCompleted) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium text-white bg-green-500">Completed</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-medium text-white bg-blue-500">Active</span>;
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 font-sans text-center">
        <h1 className="text-3xl font-bold text-white mb-4">My Club</h1>
        <p className="text-gray-400">Connectez-vous pour accéder à cette page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 font-sans text-center">
        <h1 className="text-3xl font-bold text-white mb-4">My Club</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
        <p className="text-gray-400 mt-4">Chargement...</p>
      </div>
    );
  }

  if (accountType !== "club") {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 font-sans text-center">
        <h1 className="text-3xl font-bold text-white mb-4">My Club</h1>
        <p className="text-gray-400">Accès réservé aux clubs.</p>
      </div>
    );
  }

  if (!kycValidated) {
    // Déterminer le statut à afficher
    let statutAffiche = "Non soumis";
    if (typeof window !== "undefined" && address && localStorage.getItem(`kyc_submitted_${address}`) === 'true') {
      statutAffiche = "En attente";
    }
    
    return (
      <div className="max-w-6xl mx-auto px-6 py-8 font-sans">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Club</h1>
          <p className="text-gray-400">Gérez vos campagnes et créez de nouvelles opportunités</p>
        </div>

        {/* KYC Status */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Statut KYC</h2>
          <p className="text-gray-300 mb-2">
            Votre KYC est :
            <span className={`font-bold ml-2 ${statutAffiche === "En attente" ? "text-yellow-400" : "text-red-400"}`}>
              {statutAffiche}
            </span>
          </p>
          <p className="text-gray-400 mb-6">Vous ne pouvez créer une campagne qu'une fois votre KYC validé.</p>
          <button
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
            onClick={() => window.location.href = "/kyc"}
          >
            Faire la demande de KYC
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">My Club</h1>
        <p className="text-gray-400">Gérez vos campagnes et créez de nouvelles opportunités</p>
      </div>

      {/* Messages d'erreur et de succès */}
      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-900/30 border border-green-500 text-green-300 p-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      {/* Account Information */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Informations du compte</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Adresse du wallet</p>
            <p className="text-white font-mono">{formatAddress(address || '')}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Solde USDC</p>
            <p className="text-white font-medium">{formatPSGBalance(psgBalance, tokenDecimals)} USDC</p>
          </div>
        </div>
      </div>

      {/* My Campaigns */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-6">Mes campagnes</h2>
        
        {loadingCampaigns ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Chargement de vos campagnes...</p>
          </div>
        ) : clubCampaigns.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">Vous n'avez pas encore créé de campagne</p>
            <p className="text-sm text-gray-500">Utilisez le formulaire ci-dessous pour créer votre première campagne</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clubCampaigns.map((campaign) => (
              <div key={campaign.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{campaign.clubName}</h3>
                    <p className="text-gray-400 text-sm">Campagne #{campaign.id}</p>
                  </div>
                  {getStatusBadge(campaign)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Objectif</p>
                    <p className="text-white font-bold text-lg">{formatCurrency(campaign.targetAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Collecté</p>
                    <p className="text-white font-medium">{formatCurrency(campaign.currentAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Contributeurs</p>
                    <p className="text-white font-medium">{campaign.contributorsCount}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Taux d'intérêt</p>
                    <p className="text-white font-medium">{campaign.interestRate}% par an</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Échéance</p>
                    <p className="text-white font-medium">
                      {new Date(Number(campaign.deadline) * 1000).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Progression</span>
                    <span className="text-white font-semibold text-sm">
                      {Math.round((Number(campaign.currentAmount) / Number(campaign.targetAmount)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${Math.min((Number(campaign.currentAmount) / Number(campaign.targetAmount)) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Creation Form */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-xl font-bold text-white mb-6">Créer une nouvelle campagne</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Nom du club *</label>
              <input 
                name="clubName" 
                value={form.clubName} 
                onChange={handleChange} 
                required 
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-red-500 focus:outline-none transition-colors" 
                placeholder="Nom de votre club"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Montant cible (USDC) *</label>
              <input 
                name="targetAmount" 
                type="number" 
                min="100" 
                step="0.01" 
                value={form.targetAmount} 
                onChange={handleChange} 
                required 
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-red-500 focus:outline-none transition-colors" 
                placeholder="10000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Taux d'intérêt annuel (%) *</label>
              <input 
                name="annualInterestRate" 
                type="number" 
                min="0.01" 
                max="100" 
                step="0.01" 
                value={form.annualInterestRate} 
                onChange={handleChange} 
                required 
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-red-500 focus:outline-none transition-colors" 
                placeholder="5.5"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Durée (jours) *</label>
              <input 
                name="duration" 
                type="number" 
                min="7" 
                max="365" 
                value={form.duration} 
                onChange={handleChange} 
                required 
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-red-500 focus:outline-none transition-colors" 
                placeholder="90"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-medium">Image de la campagne</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-500 file:text-white hover:file:bg-red-600 transition-colors" 
            />
            {imagePreview && (
              <div className="mt-4 flex justify-center">
                <img src={imagePreview} alt="Aperçu" className="max-h-48 rounded-lg border border-gray-700" />
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isTxLoading} 
            className="w-full py-4 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all shadow-lg text-lg"
          >
            {isTxLoading ? "Création en cours..." : "Créer la campagne"}
          </button>
        </form>
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-6 mt-6">
        <h3 className="text-lg font-bold text-white mb-4">Comment ça marche</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start space-x-3">
            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
            <p>Créez votre campagne de financement avec un objectif, un taux d'intérêt et une durée</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
            <p>Les fans investissent en USDC pour soutenir votre club</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
            <p>Si l'objectif est atteint, vous recevez les fonds. Sinon, les investisseurs sont remboursés</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
            <p>À la fin de la période, vous remboursez le capital + intérêts en CHZ</p>
          </div>
        </div>
      </div>
    </div>
  );
} 