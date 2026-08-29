/**
 * Mock Latent AI Governance Service
 * Evaluates alcohol purchase authorizations based strictly on AIIMS monthly guidelines.
 */

const latentstackOrganization = import.meta.env.VITE_LATENTSTACK_ORGANIZATION ?? import.meta.env.VITE_ORGANIZATION ?? 'shehas';
const latentstackTier = import.meta.env.VITE_LATENTSTACK_TIER ?? import.meta.env.VITE_TIER ?? 'production-tier';

export const latentStackConfig = {
  organization: latentstackOrganization,
  tier: latentstackTier,
};

export const analyzePurchaseWithLatent = async (citizen, brandLabel, volumeMl) => {
  // Simulate network latency for API evaluation
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Calculate Medical Units for 40% ABV standard: (ml * 0.40 * 0.8) / 10
  const requestedUnits = Math.round(((volumeMl * 0.40 * 0.8) / 10) * 10) / 10;

  // Set Monthly Allowance based on Gender
  const monthlyCap = citizen.gender === 'Female' ? 28.0 : 56.0;
  const projectedTotal = citizen.usedUnits + requestedUnits;

  // Strict Monthly Quota Check
  if (projectedTotal > monthlyCap) {
    const remainingQuota = Math.max(0, monthlyCap - citizen.usedUnits).toFixed(1);
    return {
      approved: false,
      reason: `Purchase of ${requestedUnits} Units exceeds remaining monthly quota of ${remainingQuota} Units (Monthly Cap: ${monthlyCap} Units).`,
      organization: latentStackConfig.organization,
      tier: latentStackConfig.tier,
    };
  }

  // Monthly limit criteria satisfied
  return {
    approved: true,
    reason: `Purchase authorized. ${requestedUnits} Units within monthly allowance.`,
    organization: latentStackConfig.organization,
    tier: latentStackConfig.tier,
  };
};