import React, { useState } from 'react';
import { analyzePurchaseWithLatent } from './latentService';

const calculateMedicalUnits = (volumeInMilliliters, alcoholByVolume = 0.40) => {
  const gramsOfPureAlcohol = volumeInMilliliters * alcoholByVolume * 0.8;
  return Math.round((gramsOfPureAlcohol / 10) * 10) / 10;
};

const TASMAC_BRANDS = [
  { id: 'brand_1', name: 'Golden Grape Brandy', company: 'United Spirits Limited' },
  { id: 'brand_2', name: 'Honey Bee Brandy', company: 'United Spirits Limited' },
  { id: 'brand_3', name: 'McDowell Number 1 Brandy', company: 'United Spirits Limited' },
  { id: 'brand_4', name: 'Bagpiper Whisky', company: 'United Spirits Limited' },
  { id: 'brand_5', name: 'Signature Rare Whisky', company: 'United Spirits Limited' },
  { id: 'brand_6', name: 'McDowell Celebration Rum', company: 'United Spirits Limited' },
  { id: 'brand_7', name: 'Brihans Napoleon Brandy', company: 'Empee Distilleries Limited' },
  { id: 'brand_8', name: 'Old Secret Triple Extra Rum', company: 'Empee Distilleries Limited' },
  { id: 'brand_9', name: 'Power Apple Vodka', company: 'Empee Distilleries Limited' },
];

const BOTTLE_SIZES = [
  { label: '180 Milliliter Quarter Bottle', milliliters: 180, price: 140, units: calculateMedicalUnits(180) },
  { label: '375 Milliliter Half Bottle', milliliters: 375, price: 270, units: calculateMedicalUnits(375) },
  { label: '750 Milliliter Full Bottle', milliliters: 750, price: 520, units: calculateMedicalUnits(750) },
  { label: '1000 Milliliter One Liter Bottle', milliliters: 1000, price: 680, units: calculateMedicalUnits(1000) },
];

const AIIMS_RULES = {
  Male: { maximumMonthlyUnits: 56.0 },
  Female: { maximumMonthlyUnits: 28.0 }
};

const INITIAL_CITIZENS = [
  { id: 'CITIZEN-9041', hash: '0x8f3a...91c', name: 'R. nolan', age: 34, gender: 'Male', usedUnits: 18.0, totalInsuranceContribution: 12.0, totalGovtContribution: 18.0, riskScore: 'Low Risk Profile', insuranceBalance: 'Active Coverage', lastPurchase: '10 August 2026', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80', cardValid: true },
  { id: 'CITIZEN-3302', hash: '0x4d11...29e', name: 'L. Lakshmi', age: 31, gender: 'Female', usedUnits: 20.0, totalInsuranceContribution: 16.0, totalGovtContribution: 24.0, riskScore: 'Medium Risk Profile', insuranceBalance: 'Active Coverage', lastPurchase: '08 August 2026', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80', cardValid: true },
  { id: 'CITIZEN-7741', hash: '0x5c33...60b', name: 'K. Vasanthi', age: 38, gender: 'Female', usedUnits: 28.0, totalInsuranceContribution: 24.0, totalGovtContribution: 36.0, riskScore: 'High Risk Profile (Quota Reached)', insuranceBalance: 'Active Coverage', lastPurchase: '12 August 2026', photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80', cardValid: true },
  { id: 'CITIZEN-1109', hash: '0x9e88...11a', name: 'M. Selvam', age: 45, gender: 'Male', usedUnits: 55.2, totalInsuranceContribution: 40.0, totalGovtContribution: 60.0, riskScore: 'High Risk Profile', insuranceBalance: 'Active Coverage', lastPurchase: '11 August 2026', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80', cardValid: true },
  { id: 'CITIZEN-5022', hash: '0x0000...BAD', name: 'S. Vijay (Corrupted Smartcard)', age: 29, gender: 'Male', usedUnits: 0.0, totalInsuranceContribution: 0.0, totalGovtContribution: 0.0, riskScore: 'Unknown Status', insuranceBalance: 'Inactive', lastPurchase: 'Not Available', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80', cardValid: false },
  { id: 'CITIZEN-6114', hash: '0x1c44...77f', name: 'P. Anitha', age: 27, gender: 'Female', usedUnits: 5.0, totalInsuranceContribution: 4.0, totalGovtContribution: 6.0, riskScore: 'Low Risk Profile', insuranceBalance: 'Active Coverage', lastPurchase: '02 August 2026', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80', cardValid: true },
  { id: 'CITIZEN-8230', hash: '0x3a99...44d', name: 'A. Murugan', age: 52, gender: 'Male', usedUnits: 42.0, totalInsuranceContribution: 32.0, totalGovtContribution: 48.0, riskScore: 'Medium Risk Profile', insuranceBalance: 'Active Coverage', lastPurchase: '09 August 2026', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80', cardValid: true },
  { id: 'CITIZEN-4099', hash: '0xDEAD...ERR', name: 'D. Karthik (Damaged Microchip)', age: 41, gender: 'Male', usedUnits: 12.0, totalInsuranceContribution: 8.0, totalGovtContribution: 12.0, riskScore: 'High Risk Profile', insuranceBalance: 'Inactive', lastPurchase: '05 August 2026', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80', cardValid: false },
  { id: 'CITIZEN-9551', hash: '0x7b22...88c', name: 'E. Deepa', age: 35, gender: 'Female', usedUnits: 14.5, totalInsuranceContribution: 12.0, totalGovtContribution: 18.0, riskScore: 'Low Risk Profile', insuranceBalance: 'Active Coverage', lastPurchase: '07 August 2026', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80', cardValid: true },
  { id: 'CITIZEN-2311', hash: '0x6f11...33b', name: 'T. Rajesh', age: 50, gender: 'Male', usedUnits: 56.0, totalInsuranceContribution: 48.0, totalGovtContribution: 72.0, riskScore: 'High Risk Profile (Quota Reached)', insuranceBalance: 'Active Coverage', lastPurchase: '12 August 2026', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80', cardValid: true },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('terminal');
  const [citizenProfiles, setCitizenProfiles] = useState(INITIAL_CITIZENS);
  const [selectedCitizenIndex, setSelectedCitizenIndex] = useState(0);

  const selectedCitizen = citizenProfiles[selectedCitizenIndex];
  const rules = AIIMS_RULES[selectedCitizen.gender] || AIIMS_RULES['Male'];
  
  const [selectedBrand, setSelectedBrand] = useState(TASMAC_BRANDS[0]);
  const [selectedServing, setSelectedServing] = useState(null);

  const [terminalState, setTerminalState] = useState('IDLE');
  const [statusMessage, setStatusMessage] = useState('TERMINAL IDLE: PLEASE INSERT CITIZEN HEALTH SMARTCARD');
  const [denialReason, setDenialReason] = useState('');
  const [lastReceipt, setLastReceipt] = useState(null);

  const [databaseLogs, setDatabaseLogs] = useState([
    { transactionId: 'TRANSACTION-8801', cardHash: '0x8f3a...91c', gender: 'Male', item: 'Golden Grape Brandy (750 Milliliter)', totalUnits: '24.0 Units', timestamp: '12 August, 10:14 AM', status: 'SUCCESSFUL' },
    { transactionId: 'TRANSACTION-8802', cardHash: '0x4d11...29e', gender: 'Female', item: 'Bagpiper Whisky (375 Milliliter)', totalUnits: '12.0 Units', timestamp: '12 August, 10:45 AM', status: 'BLOCKED (Monthly AIIMS Cap Exceeded)' },
  ]);

  const handleCardScan = () => {
    setTerminalState('CARD_VERIFYING');
    setStatusMessage('READING MICROCHIP CHECKSUM AND VERIFYING WITH NATIONAL REGISTRY...');
    setSelectedServing(null);

    setTimeout(() => {
      if (!selectedCitizen.cardValid || selectedCitizen.hash.includes('BAD') || selectedCitizen.hash.includes('ERR')) {
        setTerminalState('INVALID_CARD');
        setStatusMessage('ERROR: CORRUPTED SMARTCARD MICROCHIP DETECTED');
        setDenialReason(`Hardware checksum verification failed for card identifier [${selectedCitizen.id}]. Embedded memory corrupted.`);
        return;
      }

      setTerminalState('CARD_LOADED');
      if (selectedCitizen.usedUnits >= rules.maximumMonthlyUnits) {
        setStatusMessage(`ALERT: AIIMS Monthly Quota Fully Consumed (${selectedCitizen.usedUnits}/${rules.maximumMonthlyUnits} Units)`);
      } else {
        setStatusMessage('SMARTCARD AUTHENTICATED SUCCESSFULLY. PROCEED TO BIOMETRIC SCAN');
      }
    }, 1000);
  };

  const handleBiometricAuthentication = (isSuccessful = true) => {
    if (terminalState !== 'CARD_LOADED') return;

    setTerminalState('BIO_VERIFYING');
    setStatusMessage('CONNECTING TO BIOMETRIC AUTHENTICATION GATEWAY...');

    setTimeout(() => {
      if (!isSuccessful) {
        setTerminalState('DENIED');
        setStatusMessage('BIOMETRIC AUTHENTICATION FAILED');
        setDenialReason('Fingerprint scan does not match encrypted national registry template.');
        return;
      }

      if (selectedCitizen.usedUnits >= rules.maximumMonthlyUnits) {
        setTerminalState('DENIED');
        setStatusMessage('PURCHASE DENIED BY AIIMS GOVERNANCE ENGINE');
        setDenialReason(`Monthly limit of ${rules.maximumMonthlyUnits} units reached. System blocked further purchases.`);
        return;
      }

      setTerminalState('AUTHENTICATED');
      setStatusMessage('BIOMETRIC VERIFIED: SELECT BRAND AND BOTTLE SIZE');
    }, 1200);
  };

  const executePurchaseSequence = async (serving) => {
    setSelectedServing(serving);
    setStatusMessage('EVALUATING MONTHLY HEALTH LIMITS VIA AIIMS ENGINE...');

    const projectedMonthlyUnits = selectedCitizen.usedUnits + serving.units;
    const isMonthlyLimitExceeded = projectedMonthlyUnits > rules.maximumMonthlyUnits;
    const itemFullLabel = `${selectedBrand.name} (${serving.label})`;

    const latentDecision = await analyzePurchaseWithLatent(
      selectedCitizen,
      itemFullLabel,
      serving.milliliters
    );

    const currentTimeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentDateString = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    if (!latentDecision.approved || isMonthlyLimitExceeded) {
      setTerminalState('DENIED');
      const remainingQuota = Math.max(0, rules.maximumMonthlyUnits - selectedCitizen.usedUnits).toFixed(1);
      const reason = isMonthlyLimitExceeded 
        ? `Purchase of ${serving.units} Units exceeds remaining monthly allowance of ${remainingQuota} Units (Maximum Limit: ${rules.maximumMonthlyUnits} Units).`
        : latentDecision.reason;

      setStatusMessage('PURCHASE DENIED BY AIIMS GOVERNANCE ENGINE');
      setDenialReason(reason);

      const blockedRecord = {
        transactionId: `TRANSACTION-${Math.floor(1000 + Math.random() * 9000)}`,
        cardHash: selectedCitizen.hash,
        gender: selectedCitizen.gender,
        item: itemFullLabel,
        totalUnits: `${serving.units} Units`,
        timestamp: `${currentDateString}, ${currentTimeString}`,
        status: 'BLOCKED (Monthly AIIMS Cap Exceeded)'
      };
      
      setDatabaseLogs((previousLogs) => [blockedRecord, ...previousLogs]);
      return;
    }

    const transactionId = `TXN-TN-${Math.floor(100000 + Math.random() * 900000)}`;
    const previousUnits = selectedCitizen.usedUnits;
    const updatedUnits = Number((previousUnits + serving.units).toFixed(1));

    // Calculate Scheme Deductions
    const healthInsuranceDeduction = 4.0;
    const govtMaintenanceServiceDeduction = 6.0;
    const totalSchemeDeduction = healthInsuranceDeduction + govtMaintenanceServiceDeduction; // ₹10

    const updatedProfiles = [...citizenProfiles];
    updatedProfiles[selectedCitizenIndex] = {
      ...updatedProfiles[selectedCitizenIndex],
      usedUnits: updatedUnits,
      totalInsuranceContribution: (updatedProfiles[selectedCitizenIndex].totalInsuranceContribution || 0) + healthInsuranceDeduction,
      totalGovtContribution: (updatedProfiles[selectedCitizenIndex].totalGovtContribution || 0) + govtMaintenanceServiceDeduction,
      lastPurchase: 'Just Now',
      riskScore: updatedUnits >= rules.maximumMonthlyUnits ? 'High Risk Profile (Quota Reached)' : updatedUnits > (rules.maximumMonthlyUnits * 0.7) ? 'Medium Risk Profile' : 'Low Risk Profile'
    };
    setCitizenProfiles(updatedProfiles);

    const newRecord = {
      transactionId: transactionId,
      cardHash: selectedCitizen.hash,
      gender: selectedCitizen.gender,
      item: itemFullLabel,
      totalUnits: `${serving.units} Units`,
      timestamp: `${currentDateString}, ${currentTimeString}`,
      status: 'SUCCESSFUL'
    };

    setDatabaseLogs((previousLogs) => [newRecord, ...previousLogs]);

    setLastReceipt({
      transactionId: transactionId,
      citizenName: selectedCitizen.name,
      citizenId: selectedCitizen.id,
      cardHash: selectedCitizen.hash,
      gender: selectedCitizen.gender,
      item: itemFullLabel,
      brandName: selectedBrand.name,
      company: selectedBrand.company,
      volumeMl: serving.milliliters,
      price: serving.price,
      insuranceTax: healthInsuranceDeduction,
      govtTax: govtMaintenanceServiceDeduction,
      totalDeduction: totalSchemeDeduction,
      units: serving.units,
      date: currentDateString,
      time: currentTimeString,
      previousUnits: previousUnits,
      updatedUnits: updatedUnits,
      maximumUnits: rules.maximumMonthlyUnits,
      remainingUnits: Math.max(0, rules.maximumMonthlyUnits - updatedUnits).toFixed(1)
    });

    setTerminalState('SUCCESS');
    setStatusMessage(`TRANSACTION AUTHORIZED: DISPENSING ${itemFullLabel.toUpperCase()}`);
  };

  const handleResetToIdle = () => {
    setTerminalState('IDLE');
    setStatusMessage('TERMINAL IDLE: PLEASE INSERT CITIZEN HEALTH SMARTCARD');
    setDenialReason('');
    setSelectedServing(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="bg-indigo-600 text-white font-black text-xl px-3 py-1 rounded-lg tracking-wider border border-indigo-400/30 shadow-md">
            SEHAS
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide text-white">TASMAC Retail and Health Governance Gateway</h1>
            <p className="text-xs text-slate-400 font-mono">Tamil Nadu State Marketing Corporation | AIIMS Monthly Guidelines</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-slate-300">OUTLET NUMBER 4012 (MADURAI CENTRAL)</span>
          </div>
        </div>
      </header>

      <div className="bg-slate-900/80 border-b border-slate-800 px-6 py-2 flex space-x-2">
        {[
          { id: 'terminal', label: '🖥️ Point of Sale Hardware Terminal' },
          { id: 'ussd', label: '📱 Feature Phone (*566# USSD Service)' },
          { id: 'dashboard', label: '📊 State Health Governance Dashboard' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-900/50 border-b border-slate-800/80 px-6 py-1.5 text-center text-[11px] text-slate-400 font-mono">
        💡 <span className="text-slate-300 font-semibold">Policy Notice:</span> ₹10 Mandated Contribution per Purchase (₹4 Health Insurance Fund + ₹6 Government and Maintenance Service).
      </div>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {activeTab === 'terminal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-5 shadow-2xl relative">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-5 flex justify-between items-center font-mono text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${terminalState !== 'IDLE' && terminalState !== 'INVALID_CARD' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <div className={`w-2.5 h-2.5 rounded-full ${terminalState === 'SUCCESS' ? 'bg-emerald-500' : terminalState === 'DENIED' || terminalState === 'INVALID_CARD' ? 'bg-rose-500' : 'bg-slate-700'}`} />
                    </div>
                    <span className="text-slate-400">STATE: <strong className="text-slate-200">{terminalState}</strong></span>
                  </div>
                  <div className="text-indigo-400 font-bold">Tamil Nadu TASMAC Point of Sale Gateway</div>
                </div>

                <div className={`border rounded-xl p-5 text-center space-y-3 mb-6 transition-all ${
                  terminalState === 'SUCCESS' ? 'bg-emerald-950/40 border-emerald-500/50' :
                  terminalState === 'DENIED' || terminalState === 'INVALID_CARD' ? 'bg-rose-950/40 border-rose-500/50' :
                  terminalState === 'AUTHENTICATED' ? 'bg-indigo-950/40 border-indigo-500/50' :
                  'bg-slate-950 border-slate-800'
                }`}>
                  <div className="text-xs font-mono text-slate-500 tracking-widest uppercase">System Message Display</div>
                  
                  {(terminalState === 'CARD_VERIFYING' || terminalState === 'BIO_VERIFYING') ? (
                    <div className="flex flex-col items-center justify-center py-2 space-y-2">
                      <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                      <div className="text-sm font-mono font-bold text-indigo-300 animate-pulse">
                        {statusMessage}
                      </div>
                    </div>
                  ) : (
                    <div className={`text-base font-mono font-bold tracking-wide ${
                      terminalState === 'SUCCESS' ? 'text-emerald-400' :
                      terminalState === 'DENIED' || terminalState === 'INVALID_CARD' ? 'text-rose-400' :
                      terminalState === 'AUTHENTICATED' ? 'text-indigo-300' : 'text-amber-400'
                    }`}>
                      {statusMessage}
                    </div>
                  )}

                  {denialReason && (
                    <div className="bg-rose-950/80 border border-rose-700/50 p-2.5 rounded-lg text-xs font-mono text-rose-200 text-left">
                      <strong>GOVERNANCE AND HARDWARE ALERT:</strong> {denialReason}
                    </div>
                  )}
                </div>

                {terminalState === 'SUCCESS' && (
                  <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-5 mb-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-emerald-500/30 pb-2">
                      <span className="text-xs font-bold font-mono text-emerald-400 uppercase">✓ Dispense Authorization Receipt</span>
                      <span className="text-xs font-mono text-slate-400">{lastReceipt?.time}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                      <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                        <div className="text-slate-400 text-[10px]">CITIZEN IDENTIFIER</div>
                        <div className="font-bold text-white mt-0.5">{selectedCitizen.id}</div>
                      </div>
                      <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                        <div className="text-slate-400 text-[10px]">ITEM DISPENSED</div>
                        <div className="font-bold text-white mt-0.5">{lastReceipt?.item}</div>
                      </div>
                      <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                        <div className="text-slate-400 text-[10px]">MANDATORY TAX SPLIT</div>
                        <div className="font-bold text-emerald-400 mt-0.5">₹4 Insurance | ₹6 Maint. & Service</div>
                      </div>
                      <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                        <div className="text-slate-400 text-[10px]">REGISTRY LOCATION</div>
                        <div className="font-bold text-white mt-0.5">TN-MADURAI-4012</div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleResetToIdle}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-lg text-xs transition-all cursor-pointer shadow-lg"
                      >
                        Process Next Customer
                      </button>
                    </div>
                  </div>
                )}

                {(terminalState === 'DENIED' || terminalState === 'INVALID_CARD') && (
                  <div className="mb-6">
                    <button
                      onClick={handleResetToIdle}
                      className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold py-2.5 rounded-lg text-xs transition-all cursor-pointer"
                    >
                      ← Reset Terminal Interface
                    </button>
                  </div>
                )}

                {terminalState !== 'SUCCESS' && terminalState !== 'DENIED' && terminalState !== 'INVALID_CARD' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span>Step 1: SmartCard Reader</span>
                        <span className="text-[10px] font-mono text-indigo-400">Automatic Detection</span>
                      </div>

                      <select 
                        value={selectedCitizenIndex}
                        onChange={(event) => {
                          setSelectedCitizenIndex(Number(event.target.value));
                          handleResetToIdle();
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        {citizenProfiles.map((citizen, index) => (
                          <option key={citizen.id} value={index}>
                            {citizen.name} ({citizen.id}) {!citizen.cardValid ? '[CORRUPTED MICROCHIP]' : ''}
                          </option>
                        ))}
                      </select>

                      <button 
                        onClick={handleCardScan}
                        disabled={terminalState !== 'IDLE'}
                        className={`w-full py-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer disabled:opacity-40 ${
                          terminalState === 'IDLE' 
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/40 shadow-lg' 
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {terminalState === 'IDLE' ? '💳 Insert Citizen Smartcard into Reader Slot' : '✓ Smartcard Detected'}
                      </button>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span>Step 2: Biometric Verification</span>
                        <span className="text-[10px] font-mono text-indigo-400">Fingerprint Scanner</span>
                      </div>

                      <div className="flex items-center space-x-3 bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg border ${
                          terminalState === 'CARD_LOADED' ? 'border-amber-500 text-amber-400 bg-amber-950/40 animate-pulse' :
                          terminalState === 'BIO_VERIFYING' ? 'border-indigo-500 text-indigo-400 bg-indigo-950/40 animate-spin' :
                          terminalState === 'AUTHENTICATED' ? 'border-emerald-500 text-emerald-400 bg-emerald-950/40' :
                          'border-slate-800 text-slate-600 bg-slate-950'
                        }`}>
                          ☝️
                        </div>
                        <div className="flex-1 text-[11px] font-mono">
                          <div className="text-slate-400">SCANNER STATUS:</div>
                          <div className="font-bold text-slate-200">
                            {terminalState === 'CARD_LOADED' ? 'READY FOR FINGERPRINT SCAN' : 
                             terminalState === 'AUTHENTICATED' ? 'AUTHENTICATED VERIFIED ✓' : terminalState}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBiometricAuthentication(true)}
                          disabled={terminalState !== 'CARD_LOADED'}
                          className="flex-1 bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30 cursor-pointer"
                        >
                          Biometric Match
                        </button>
                        <button
                          onClick={() => handleBiometricAuthentication(false)}
                          disabled={terminalState !== 'CARD_LOADED'}
                          className="flex-1 bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30 cursor-pointer"
                        >
                          Biometric Failure
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className={`mt-5 bg-slate-950 border rounded-xl p-4 space-y-4 transition-all ${
                  terminalState === 'AUTHENTICATED' ? 'border-indigo-500/60 shadow-lg shadow-indigo-950/50' : 'border-slate-800 opacity-50'
                }`}>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Step 3: TASMAC Menu Selection</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400">
                      Remaining Monthly Quota: {Math.max(0, rules.maximumMonthlyUnits - selectedCitizen.usedUnits).toFixed(1)} Units
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Select Brand and Distiller Company:</label>
                    <select
                      disabled={terminalState !== 'AUTHENTICATED'}
                      value={selectedBrand.id}
                      onChange={(event) => {
                        const brandFound = TASMAC_BRANDS.find(brand => brand.id === event.target.value);
                        if (brandFound) setSelectedBrand(brandFound);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:cursor-not-allowed"
                    >
                      {TASMAC_BRANDS.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name} ({brand.company})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {BOTTLE_SIZES.map((bottle) => {
                      const exceedsMonthlyLimit = (selectedCitizen.usedUnits + bottle.units) > rules.maximumMonthlyUnits;
                      return (
                        <button
                          key={bottle.milliliters}
                          disabled={terminalState !== 'AUTHENTICATED'}
                          onClick={() => executePurchaseSequence(bottle)}
                          className={`p-3 rounded-lg border text-left transition-all cursor-pointer disabled:cursor-not-allowed ${
                            terminalState === 'AUTHENTICATED'
                              ? 'bg-slate-900 border-indigo-500/50 text-white hover:bg-indigo-600/20 hover:border-indigo-400'
                              : 'bg-slate-900/50 border-slate-800 text-slate-500'
                          }`}
                        >
                          <div className="font-bold text-xs">{bottle.label}</div>
                          <div className="text-[10px] font-mono mt-1 text-indigo-300">₹{bottle.price} (+ ₹10 Levy)</div>
                          <div className="text-[9px] font-mono text-slate-400">Incl. ₹4 Ins / ₹6 Maint & Svc</div>
                          {exceedsMonthlyLimit && <div className="text-[9px] text-rose-400 font-bold mt-1">Exceeds Monthly Allowance</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={selectedCitizen.photo} 
                      alt={selectedCitizen.name}
                      className="w-11 h-11 rounded-full border-2 border-slate-700 object-cover shadow"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white">{selectedCitizen.name}</h3>
                      <p className="text-[11px] font-mono text-slate-400">{selectedCitizen.id} | {selectedCitizen.gender}, {selectedCitizen.age} Yrs</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {selectedCitizen.riskScore}
                  </span>
                </div>

                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Health Scheme:</span>
                    <span className="text-emerald-400 font-bold">{selectedCitizen.insuranceBalance}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Accumulated Ins. Fund (₹4/txn):</span>
                    <span className="text-indigo-400 font-bold">₹{selectedCitizen.totalInsuranceContribution || 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Govt & Maintenance Service (₹6/txn):</span>
                    <span className="text-indigo-400 font-bold">₹{selectedCitizen.totalGovtContribution || 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Last Transaction:</span>
                    <span className="text-slate-200">{selectedCitizen.lastPurchase}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}