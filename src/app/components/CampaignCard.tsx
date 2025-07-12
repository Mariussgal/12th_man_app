import { useReadContract } from 'wagmi';
import { CONTRACTS, TWELFTH_MAN_ABI } from "../../config/contracts";

interface Campaign {
    id: number;
    clubName: string;
    league: string;
    targetAmount: number;
    currentAmount: number;
    interestRate: number;
    duration: string;
    endDate: string;
    description: string;
    clubLogo: string;
    backers: number;
    daysLeft: number;
  }
  
  interface CampaignCardProps {
    campaign: Campaign;
    onClick?: () => void;
  }
  
  export default function CampaignCard({ campaign, onClick }: CampaignCardProps) {
    // Hook pour récupérer les informations de la campagne depuis le smart contract
    const { data: campaignInfo, isLoading } = useReadContract({
      address: CONTRACTS.TWELFTH_MAN as `0x${string}`,
      abi: TWELFTH_MAN_ABI,
      functionName: 'getCampaignInfo',
      args: [BigInt(campaign.id)],
    });

    // Debug logs
    console.log(`CampaignCard ${campaign.id} - Raw data:`, campaignInfo);

    const contributorsCount = campaignInfo ? Number(campaignInfo[10] || BigInt(0)) : 0;
    
    // Récupérer le nom du club (index 1)
    const smartContractClubName = campaignInfo ? campaignInfo[1] || '' : '';
    
    // Récupérer le montant objectif (index 2) - convertir de wei vers ether
    const rawTargetAmount = campaignInfo ? campaignInfo[2] || BigInt(0) : BigInt(0);
    const targetAmount = Number(rawTargetAmount) / Math.pow(10, 18);
    
    // Récupérer le montant collecté (index 3) - convertir de wei vers ether
    const rawCollectedAmount = campaignInfo ? campaignInfo[3] || BigInt(0) : BigInt(0);
    const collectedAmount = Number(rawCollectedAmount) / Math.pow(10, 18);
    
    // Récupérer le taux d'intérêt annuel (index 4) - convertir depuis basis points
    const rawAnnualInterestRate = campaignInfo ? campaignInfo[4] || BigInt(0) : BigInt(0);
    const annualInterestRate = Number(rawAnnualInterestRate) / 100;

    // Logique de fallback améliorée
    const hasSmartContractData = !isLoading && (smartContractClubName || contributorsCount > 0 || collectedAmount > 0);
    const currentAmount = hasSmartContractData ? collectedAmount : campaign.currentAmount;
    const displayTargetAmount = hasSmartContractData ? targetAmount : campaign.targetAmount;
    const displayClubName = hasSmartContractData && smartContractClubName ? smartContractClubName : campaign.clubName;
    const displayContributors = hasSmartContractData ? contributorsCount : campaign.backers;
    const displayInterestRate = hasSmartContractData ? annualInterestRate : campaign.interestRate;

    console.log(`CampaignCard ${campaign.id} - Processed:`, {
      hasSmartContractData,
      rawTargetAmount: rawTargetAmount.toString() + ' wei',
      displayTargetAmount: displayTargetAmount + ' ether',
      rawCollectedAmount: rawCollectedAmount.toString() + ' wei', 
      currentAmount: currentAmount + ' ether',
      rawAnnualInterestRate: rawAnnualInterestRate.toString() + ' basis points',
      displayInterestRate: displayInterestRate + '%',
      displayClubName,
      displayContributors,
      isLoading
    });

    const getProgressPercentage = (current: number, target: number) => {
      return Math.min((current / target) * 100, 100);
    };
  
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      }).format(amount);
    };
  
    const getStatusColor = (daysLeft: number) => {
      if (daysLeft <= 7) return 'bg-red-400';
      if (daysLeft <= 14) return 'bg-orange-400';
      return 'bg-green-400';
    };
  
    return (
      <div className="group relative" onClick={onClick}>
        {/* Card Background with subtle glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-white/3 rounded-3xl backdrop-blur-md border border-white/15 transition-all duration-500 group-hover:border-white/30 group-hover:from-white/12 group-hover:to-white/6" />
        
        {/* Card Content */}
        <div className="relative p-6 rounded-3xl cursor-pointer transition-transform duration-300 group-hover:-translate-y-1">
          {/* Club Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-white/10">
                {campaign.clubLogo}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{displayClubName}</h3>
                <p className="text-gray-400 text-xs">{campaign.league}</p>
              </div>
            </div>
            
            {/* APY Badge */}
            <div className="px-2.5 py-1 bg-green-500/15 border border-green-500/25 rounded-full">
              <span className="text-green-400 font-bold text-xs">{displayInterestRate}%</span>
            </div>
          </div>
  
          {/* Description */}
          <p className="text-gray-300 text-xs mb-5 leading-relaxed line-clamp-2">
            {campaign.description}
          </p>
  
          {/* Progress Section */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-xs">Progress</span>
              <span className="text-white font-semibold text-xs">
                {Math.round(getProgressPercentage(currentAmount, displayTargetAmount))}%
              </span>
            </div>
            
            {/* Minimal Progress Bar */}
            <div className="w-full h-0.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${getProgressPercentage(currentAmount, displayTargetAmount)}%`
                }}
              />
            </div>
          </div>
  
          {/* Amount & Stats */}
          <div className="flex justify-between items-end mb-5">
            <div>
              <div className="text-xl font-bold text-white mb-0.5">
                {formatCurrency(currentAmount)}
              </div>
              <div className="text-gray-400 text-xs">
                of {formatCurrency(displayTargetAmount)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-white">{displayContributors}</div>
              <div className="text-gray-400 text-xs">investors</div>
            </div>
          </div>
  
          {/* Footer Info */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <div className={`w-1.5 h-1.5 ${getStatusColor(campaign.daysLeft)} rounded-full`} />
                <span>{campaign.daysLeft}d left</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                <span>{campaign.duration}</span>
              </div>
            </div>
          </div>
  
          {/* CTA Button */}
          <button className="w-full py-3 bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl text-sm transition-all duration-300 transform group-hover:scale-[1.01] hover:shadow-lg hover:shadow-red-500/20 backdrop-blur-sm">
            Lend Now
          </button>
        </div>
  
        {/* Subtle hover glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />
      </div>
    );
  }