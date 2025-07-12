"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter, usePathname } from "next/navigation";

const ACCOUNT_TYPES = [
  { value: "user", label: "I want to lend to a club" },
  { value: "club", label: "I represent a club" },
];

export default function AccountGate() {
  const { address, isConnected } = useAccount();
  console.log('AccountGate: address', address, 'isConnected', isConnected);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [kycNeeded, setKycNeeded] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  // Vérifie si l'utilisateur existe déjà
  useEffect(() => {
    if (!isConnected || !address) return;
    
    // Vérifier d'abord si le KYC a été soumis ou fermé manuellement
    const kycSubmitted = localStorage.getItem(`kyc_submitted_${address}`);
    const kycDismissed = localStorage.getItem(`kyc_dismissed_${address}`);
    if (kycSubmitted === 'true' || kycDismissed === 'true') {
      console.log('KYC déjà soumis ou fermé manuellement, pas de popup');
      return;
    }
    
    console.log('Vérification API user pour', address);
    setLoading(true);
    fetch(`/api/user?walletAddress=${address}`)
      .then(async (res) => {
        console.log('Réponse API /api/user:', res.status);
        if (res.ok) {
          const user = await res.json();
          console.log('Utilisateur trouvé:', user);
          setAccountType(user.accountType);
          
          // Vérifier à nouveau localStorage avant de montrer la popup KYC
          const kycSubmittedCheck = localStorage.getItem(`kyc_submitted_${address}`);
          const kycDismissedCheck = localStorage.getItem(`kyc_dismissed_${address}`);
          if (user.accountType === "club" && !user.kycValidated && kycSubmittedCheck !== 'true' && kycDismissedCheck !== 'true') {
            setKycNeeded(true);
          }
        } else if (res.status === 404) {
          console.log('Aucun utilisateur trouvé, affichage modal de choix');
          setShowModal(true);
        } else {
          setError("Erreur lors de la vérification du compte utilisateur.");
        }
      })
      .catch((e) => {
        console.log('Erreur réseau API:', e);
        setError("Erreur réseau lors de la vérification du compte.");
      })
      .finally(() => setLoading(false));
  }, [isConnected, address]);

  // Gère le choix du type de compte
  const handleSelect = async (type: string) => {
    if (!address) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, accountType: type }),
      });
      if (res.ok) {
        setAccountType(type);
        setShowModal(false);
        if (type === "club") {
          setKycNeeded(true);
          router.push("/kyc");
        }
      } else {
        const data = await res.json();
        setError(data.error || "Erreur lors de la création du compte.");
      }
    } catch (e) {
      setError("Erreur réseau lors de la création du compte.");
    } finally {
      setLoading(false);
    }
  };

  // Affiche la modal de choix si besoin
  if (showModal && isConnected && !accountType) {
    console.log('Affichage de la modal de choix de compte');
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-gray-900 rounded-xl p-8 max-w-sm w-full border border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4 text-center">Choose your account type</h2>
          <div className="space-y-4 mb-4">
            {ACCOUNT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleSelect(type.value)}
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all"
              >
                {type.label}
              </button>
            ))}
          </div>
          {error && <div className="text-red-400 text-sm text-center mb-2">{error}</div>}
        </div>
      </div>
    );
  }

  // Affiche un message si KYC requis
  if (kycNeeded && pathname !== "/kyc") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-gray-900 rounded-xl p-8 max-w-sm w-full border border-gray-700 shadow-lg text-center relative">
          {/* Bouton de fermeture (croix) */}
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
            onClick={() => {
              setKycNeeded(false);
              // Marquer comme "fermé manuellement" pour éviter la réapparition
              if (address) {
                localStorage.setItem(`kyc_dismissed_${address}`, 'true');
              }
            }}
            aria-label="Fermer la pop-up"
          >
            ×
          </button>
          <h2 className="text-xl font-bold text-white mb-4">KYC verification required</h2>
          <p className="text-gray-300 mb-4">You must complete KYC to access club features.</p>
          <button className="w-full py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all" onClick={() => router.push("/kyc") }>
            Fill out the KYC form
          </button>
        </div>
      </div>
    );
  }

  // Rien à afficher sinon
  return null;
} 