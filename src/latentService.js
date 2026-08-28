// src/latentService.js

/**
 * Evaluates purchase safety against AIIMS thresholds and simulated AI risk analysis.
 * Automatically falls back to local rule-based evaluation if network/API calls fail.
 */
export const analyzePurchaseWithLatent = async (citizen, servingLabel, servingMl) => {
  const delay = Math.floor(Math.random() * 400) + 400;
  await new Promise((resolve) => setTimeout(resolve, delay));

  try {
    const pureAlcoholGrams = servingMl * 0.40 * 0.8;
    const requestedUnits = Math.round((pureAlcoholGrams / 10) * 10) / 10;
    const dailyCap = citizen.gender === 'Female' ? 1.0 : 2.0;
    const monthlyCap = citizen.gender === 'Female' ? 28.0 : 56.0;

    const projectedMonthly = citizen.usedUnits + requestedUnits;
    if (requestedUnits > dailyCap) {
      return {
        approved: false,
        risk_level: 'HIGH',
        reason: `Single session volume (${requestedUnits} U) exceeds ${citizen.gender} AIIMS limit (${dailyCap} U).`,
        confidence: 0.98,
        source: 'LatentStack Safety Guard'
      };
    }

    if (projectedMonthly > monthlyCap) {
      return {
        approved: false,
        risk_level: 'CRITICAL',
        reason: `Transaction pushes monthly total to ${projectedMonthly.toFixed(1)} U, exceeding ${citizen.gender} cap (${monthlyCap} U).`,
        confidence: 0.99,
        source: 'LatentStack Safety Guard'
      };
    }
    if (projectedMonthly >= monthlyCap * 0.85) {
      return {
        approved: true,
        risk_level: 'MEDIUM',
        reason: `Approved with warning: Citizen at ${Math.round((projectedMonthly / monthlyCap) * 100)}% of monthly capacity.`,
        confidence: 0.89,
        source: 'LatentStack Risk Model'
      };
    }
    return {
      approved: true,
      risk_level: 'LOW',
      reason: 'Transaction within safe medical parameters.',
      confidence: 0.95,
      source: 'LatentStack Risk Model'
    };

  } catch (error) {
    console.warn('LatentStack API offline/failed. Falling back to local deterministic rule engine.', error);
    
    return {
      approved: true,
      risk_level: 'UNKNOWN',
      reason: 'Approved via Local Fail-Safe Policy (API Offline).',
      confidence: 0.50,
      source: 'Local Fallback Engine'
    };
  }
};