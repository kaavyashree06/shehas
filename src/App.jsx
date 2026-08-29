import React, { useState } from 'react';
import { analyzePurchaseWithLatent } from './latentService';

// Standard 40% ABV Unit Calculation: (ml * 0.40 * 0.8) / 10
const calculateMedicalUnits = (volumeInMilliliters, alcoholByVolume = 0.40) => {
  const gramsOfPureAlcohol = volumeInMilliliters * alcoholByVolume * 0.8;
  return Math.round((gramsOfPureAlcohol / 10) * 10) / 10;
};

// TASMAC Official Brand List Catalog
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

// TASMAC Bottle Formats Mapped to Standard Medical Units
const BOTTLE_SIZES = [
  { label: '180 Milliliter Quarter Bottle', milliliters: 180, units: calculateMedicalUnits(180) },
  { label: '375 Milliliter Half Bottle', milliliters: 375, units: calculateMedicalUnits(375) },
  { label: '750 Milliliter Full Bottle', milliliters: 750, units: calculateMedicalUnits(750) },
  { label: '1000 Milliliter One Liter Bottle', milliliters: 1000, units: calculateMedicalUnits(1000) },
];

// AIIMS Monthly Consumption Guidelines
const AIIMS_RULES = {
  Male: { maximumMonthlyUnits: 56.0 },
  Female: { maximumMonthlyUnits: 28.0 }
};

// Initial Citizen Database Profiles with Realistic Photo Avatars
const INITIAL_CITIZENS = [
  { id: 'CITIZEN-9041', hash: '0x8f3a...91c', name: 'R. Kumar', age: 34, gender: 'Male', usedUnits: 18.0, riskScore: 'Low Risk Profile', insuranceBalance: 'Active Coverage', lastPurchase: '10 August 2026', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80', cardValid: true },
  { id: 'CITIZEN-3302', hash: '0x4d11...29e', name: 'L. Lakshmi', age: 31, gender: 'Female', usedUnits: 20.0, riskScore: 'Medium Risk Profile', insuranceBalance: 'Active Coverage', lastPurchase: '08 August 2026', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80', cardValid: true },
  { id: 'CITIZEN-7741', hash: '0x5c33...60b', name: 'K. Vasanthi', age: 38, gender: 'Female', usedUnits: 28.0, riskScore: 'High Risk Profile (Quota Reached)', insuranceBalance: 'Active Coverage', lastPurchase: '12 August 2026', photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80', cardValid: true },
  { id: 'CITIZEN-1109', hash: '0x9e88...11a', name: 'M. Selvam', age: 45, gender: 'Male', usedUnits: 55.2, riskScore: 'High Risk Profile', insuranceBalance: 'Active Coverage', lastPurchase: '11 August 2026', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80', cardValid: true },
  { id: 'CITIZEN-5022', hash: '0x0000...BAD', name: 'S. Vijay (Corrupted Smartcard)', age: 29, gender: 'Male', usedUnits: 0.0, riskScore: 'Unknown Status', insuranceBalance: 'Inactive', lastPurchase: 'Not Available', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80', cardValid: false },
  { id: 'CITIZEN-6114', hash: '0x1c44...77f', name: 'P. Anitha', age: 27, gender: 'Female', usedUnits: 5.0, riskScore: 'Low Risk Profile', insuranceBalance: 'Active Coverage', lastPurchase: '02 August 2026', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80', cardValid: true },
  { id: 'CITIZEN-8230', hash: '0x3a99...44d', name: 'A. Murugan', age: 52, gender: 'Male', usedUnits: 42.0, riskScore: 'Medium Risk Profile', insuranceBalance: 'Active Coverage', lastPurchase: '09 August 2026', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80', cardValid: true },
  { id: 'CITIZEN-4099', hash: '0xDEAD...ERR', name: 'D. Karthik (Damaged Microchip)', age: 41, gender: 'Male', usedUnits: 12.0, riskScore: 'High Risk Profile', insuranceBalance: 'Inactive', lastPurchase: '05 August 2026', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80', cardValid: false },
  { id: 'CITIZEN-9551', hash: '0x7b22...88c', name: 'E. Deepa', age: 35, gender: 'Female', usedUnits: 14.5, riskScore: 'Low Risk Profile', insuranceBalance: 'Active Coverage', lastPurchase: '07 August 2026', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80', cardValid: true },
  { id: 'CITIZEN-2311', hash: '0x6f11...33b', name: 'T. Rajesh', age: 50, gender: 'Male', usedUnits: 56.0, riskScore: 'High Risk Profile (Quota Reached)', insuranceBalance: 'Active Coverage', lastPurchase: '12 August 2026', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80', cardValid: true },
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
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [databaseLogs, setDatabaseLogs] = useState([
    { transactionId: 'TRANSACTION-8801', cardHash: '0x8f3a...91c', gender: 'Male', item: 'Golden Grape Brandy (750 Milliliter)', totalUnits: '24.0 Units', timestamp: '12 August, 10:14 AM', status: 'SUCCESSFUL' },
    { transactionId: 'TRANSACTION-8802', cardHash: '0x4d11...29e', gender: 'Female', item: 'Bagpiper Whisky (375 Milliliter)', totalUnits: '12.0 Units', timestamp: '12 August, 10:45 AM', status: 'BLOCKED (Monthly AIIMS Cap Exceeded)' },
  ]);

  const [ussdInput, setUssdInput] = useState('');
  const [ussdScreen, setUssdScreen] = useState('menu');

  // Hardware Smartcard Scan Simulation
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

  // Biometric Identity Verification
  const handleBiometricAuthentication = (isSuccessful = true) => {
    if (terminalState !== 'CARD_LOADED') return;

    setTerminalState('BIO_VERIFYING');
    setStatusMessage('CONNECTING TO UIDAI BIOMETRIC AUTHENTICATION GATEWAY...');

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

  // Execute Bottle Purchase
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

    const updatedProfiles = [...citizenProfiles];
    updatedProfiles[selectedCitizenIndex] = {
      ...updatedProfiles[selectedCitizenIndex],
      usedUnits: updatedUnits,
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

  const handleKeyPress = (digit) => {
    if (ussdInput.length < 4) setUssdInput((previousInput) => previousInput + digit);
  };

  const handleUssdSend = () => {
    if (ussdInput === '1') setUssdScreen('quota');
    else if (ussdInput === '2') setUssdScreen('asha');
    else if (ussdInput === '3') setUssdScreen('insurance');
    else if (ussdInput === '4') setUssdScreen('history');
    else setUssdScreen('invalid');
    setUssdInput('');
  };

  const keypadButtons = [
    { digit: '1', letters: 'oo' }, { digit: '2', letters: 'abc' }, { digit: '3', letters: 'def' },
    { digit: '4', letters: 'ghi' }, { digit: '5', letters: 'jkl' }, { digit: '6', letters: 'mno' },
    { digit: '7', letters: 'pqrs' }, { digit: '8', letters: 'tuv' }, { digit: '9', letters: 'wxyz' },
    { digit: '*', letters: '+' }, { digit: '0', letters: '␣' }, { digit: '#', letters: '⇧' },
  ];

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
        💡 <span className="text-slate-300 font-semibold">Policy Notice:</span> Purchases are governed strictly by the AIIMS monthly limits ({AIIMS_RULES.Male.maximumMonthlyUnits} Units Male / {AIIMS_RULES.Female.maximumMonthlyUnits} Units Female).
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
                        <div className="text-slate-400 text-[10px]">MONTHLY QUOTA</div>
                        <div className="font-bold text-emerald-400 mt-0.5">{lastReceipt?.previousUnits} → {lastReceipt?.updatedUnits} Units</div>
                      </div>
                      <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                        <div className="text-slate-400 text-[10px]">REGISTRY LOCATION</div>
                        <div className="font-bold text-white mt-0.5">TN-MADURAI-4012</div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowReceiptModal(true)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center space-x-2"
                      >
                        <span>📄 View & Print Official Receipt</span>
                      </button>
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
                      {terminalState !== 'AUTHENTICATED' && (
                        <span className="text-[10px] font-mono bg-slate-800 text-amber-400 px-2 py-0.5 rounded">🔒 Unlocks After Successful Biometric Verification</span>
                      )}
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
                          <div className="text-[10px] font-mono mt-1 text-indigo-300">{bottle.units} Medical Units</div>
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
                      <p className="text-[11px] font-mono text-slate-400">{selectedCitizen.id} | {selectedCitizen.gender}, {selectedCitizen.age} Years Old</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded border font-mono ${
                    selectedCitizen.riskScore.includes('High') ? 'bg-rose-950 text-rose-300 border-rose-800' :
                    selectedCitizen.riskScore.includes('Medium') ? 'bg-amber-950 text-amber-300 border-amber-800' :
                    'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}>
                    {selectedCitizen.riskScore}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Card Hash Digest:</span>
                    <span className="text-slate-200">{selectedCitizen.hash}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Health Insurance Scheme:</span>
                    <span className="text-slate-200">{selectedCitizen.insuranceBalance}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Last Purchase Record:</span>
                    <span className="text-indigo-400 font-bold">{selectedCitizen.lastPurchase}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">AIIMS Quota Governance Monitor</h3>
                  <span className="text-[10px] font-mono text-indigo-400">Monthly Tracking</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>AIIMS Maximum Monthly Cap:</span>
                    <span className="text-white font-bold">{rules.maximumMonthlyUnits} Units / Month</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Monthly Consumed Balance:</span>
                    <span className={`font-bold ${selectedCitizen.usedUnits >= rules.maximumMonthlyUnits ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {selectedCitizen.usedUnits.toFixed(1)} / {rules.maximumMonthlyUnits} Units
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>Monthly Quota Utilized Percentage</span>
                    <span>{Math.min(100, Math.round((selectedCitizen.usedUnits / rules.maximumMonthlyUnits) * 100))}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        selectedCitizen.usedUnits >= rules.maximumMonthlyUnits ? 'bg-rose-500' :
                        (selectedCitizen.usedUnits / rules.maximumMonthlyUnits) > 0.75 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`} 
                      style={{ width: `${Math.min(100, (selectedCitizen.usedUnits / rules.maximumMonthlyUnits) * 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ussd' && (
          <div className="flex justify-center items-center py-4">
            <div className="w-[340px] bg-slate-900 rounded-[48px] p-5 shadow-2xl border-2 border-slate-800 relative flex flex-col items-center">
              <div className="w-full flex flex-col items-center mb-3">
                <div className="w-12 h-1.5 bg-slate-950 rounded-full border border-slate-800 mb-2" />
                <div className="text-[10px] font-black tracking-[0.25em] text-slate-500 uppercase">SEHAS MODEL 3310</div>
              </div>

              <div className="w-full bg-[#9ebb11] border-4 border-slate-950 rounded-lg p-3 text-[#112a00] font-mono shadow-inner relative flex flex-col justify-between min-h-[190px]">
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold border-b border-[#7b9308] pb-1 mb-2">
                    <span>📶 INDIA AIRTEL</span>
                    <span>*566# 🔋</span>
                  </div>

                  {ussdScreen === 'menu' && (
                    <div className="space-y-1 text-xs font-semibold leading-tight">
                      <p className="font-extrabold uppercase border-b border-[#7b9308]/60 pb-0.5">-- AIIMS GOVERNANCE PORTAL --</p>
                      <p>1. Check Monthly Quota</p>
                      <p>2. Request ASHA Health Worker</p>
                      <p>3. Family Health Insurance Cover</p>
                      <p>4. Recent Purchase Audit History</p>
                    </div>
                  )}

                  {ussdScreen === 'quota' && (
                    <p className="text-xs font-semibold leading-tight">
                      [QUOTA SUMMARY] {selectedCitizen.name}: {selectedCitizen.usedUnits.toFixed(1)}/{rules.maximumMonthlyUnits} Units consumed. Remaining balance: {Math.max(0, rules.maximumMonthlyUnits - selectedCitizen.usedUnits).toFixed(1)} Units.
                    </p>
                  )}

                  {ussdScreen === 'asha' && (
                    <p className="text-xs font-semibold leading-tight">
                      [ASHA HEALTH CARE] Counseling alert dispatched for {selectedCitizen.name}. Outreach healthcare worker notified.
                    </p>
                  )}

                  {ussdScreen === 'insurance' && (
                    <p className="text-xs font-semibold leading-tight">
                      [HEALTH COVERAGE] Insurance Status: Active Coverage for Citizen Identifier {selectedCitizen.id}.
                    </p>
                  )}

                  {ussdScreen === 'history' && (
                    <p className="text-xs font-semibold leading-tight">
                      [TRANSACTION HISTORY] Last record date: {selectedCitizen.lastPurchase}. Total intake recorded: {selectedCitizen.usedUnits.toFixed(1)} Units.
                    </p>
                  )}

                  {ussdScreen === 'invalid' && (
                    <p className="text-xs font-bold text-red-900 leading-tight">
                      Invalid Selection Input. Please enter digit 1, 2, 3, or 4.
                    </p>
                  )}
                </div>

                <div className="border-t border-[#7b9308] pt-1 mt-2 flex justify-between items-center text-[11px] font-bold">
                  <span>Input: <span className="underline bg-[#8a9f18] px-1 rounded">{ussdInput || '_'}</span></span>
                  <span className="text-[10px] tracking-wider uppercase">[SEND COMMAND]</span>
                </div>
              </div>

              <div className="w-full my-4 px-2 space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <button 
                    onClick={handleUssdSend}
                    className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-1.5 rounded-lg text-xs border border-emerald-500/40 shadow cursor-pointer flex flex-col items-center"
                  >
                    <span className="text-[9px] uppercase text-emerald-200">Select</span>
                    <span>TALK</span>
                  </button>

                  <div className="w-10 h-10 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 text-xs font-bold">
                    ▲▼
                  </div>

                  <button 
                    onClick={() => {
                      setUssdScreen('menu');
                      setUssdInput('');
                    }}
                    className="flex-1 bg-rose-700 hover:bg-rose-600 text-white font-bold py-1.5 rounded-lg text-xs border border-rose-500/40 shadow cursor-pointer flex flex-col items-center"
                  >
                    <span className="text-[9px] uppercase text-rose-200">Clear</span>
                    <span>END</span>
                  </button>
                </div>
              </div>

              <div className="w-full grid grid-cols-3 gap-2 px-2 pb-2">
                {keypadButtons.map((keypadItem) => (
                  <button
                    key={keypadItem.digit}
                    onClick={() => handleKeyPress(keypadItem.digit)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-100 py-2 rounded-xl border border-slate-700 shadow flex flex-col items-center cursor-pointer"
                  >
                    <span className="text-sm font-black leading-none">{keypadItem.digit}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">{keypadItem.letters}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>ACTIVE POINT OF SALE OUTLETS</span>
                  <span className="text-emerald-400">● ONLINE</span>
                </div>
                <div className="text-2xl font-black text-white mt-2">1,420 / 1,420</div>
                <div className="text-[11px] text-slate-500 mt-1">100% Realtime Synchronization across State</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>AIIMS MONTHLY CAP BLOCKS</span>
                  <span className="text-rose-400">ENFORCED</span>
                </div>
                <div className="text-2xl font-black text-rose-400 mt-2">
                  {389 + databaseLogs.filter(log => log.status.includes('BLOCKED')).length} TRANSACTION BLOCKS
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Monthly threshold violations stopped</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>ASHA HEALTH CARE ALERTS</span>
                  <span className="text-amber-400">COMMUNITY CARE</span>
                </div>
                <div className="text-2xl font-black text-amber-400 mt-2">112 COUNSELINGS ASSIGNED</div>
                <div className="text-[11px] text-slate-500 mt-1">High-risk family outreach alerts triggered</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Realtime State Intake Audit Log ({databaseLogs.length} Records)</h3>
                <span className="text-xs font-mono text-slate-500">ENCRYPTED LEDGER SYNCHRONIZATION</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">TRANSACTION IDENTIFIER</th>
                      <th className="p-3">SMARTCARD HASH</th>
                      <th className="p-3">GENDER</th>
                      <th className="p-3">BRAND AND VOLUME</th>
                      <th className="p-3">MEDICAL UNITS</th>
                      <th className="p-3">TIMESTAMP</th>
                      <th className="p-3">TRANSACTION STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                    {databaseLogs.map((log) => (
                      <tr key={log.transactionId} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-bold text-indigo-400">{log.transactionId}</td>
                        <td className="p-3 text-slate-400">{log.cardHash}</td>
                        <td className="p-3">
                          <span className={log.gender === 'Female' ? 'text-purple-400 font-bold' : 'text-blue-400 font-bold'}>
                            {log.gender}
                          </span>
                        </td>
                        <td className="p-3 text-white">{log.item}</td>
                        <td className="p-3 font-bold text-amber-400">{log.totalUnits}</td>
                        <td className="p-3 text-slate-500">{log.timestamp}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status.includes('SUCCESSFUL') ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Official State Receipt Generator Modal */}
      {showReceiptModal && lastReceipt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-amber-50 text-slate-900 rounded-xl p-6 max-w-md w-full shadow-2xl border-4 border-slate-800 font-mono relative">
            
            <div className="text-center border-b-2 border-dashed border-slate-400 pb-4 mb-4">
              <div className="text-xs font-bold tracking-widest uppercase text-slate-600">GOVERNMENT OF TAMIL NADU</div>
              <div className="text-base font-black text-slate-900 mt-0.5">TASMAC RETAIL OUTLET #4012</div>
              <div className="text-[10px] text-slate-600">MADURAI CENTRAL REGION | SEHAS GATEWAY</div>
              <div className="text-[11px] font-bold text-indigo-900 mt-2 bg-indigo-100 inline-block px-3 py-0.5 rounded border border-indigo-300">
                HEALTH MONITORING SYSTEM RECEIPT
              </div>
            </div>

            <div className="space-y-1.5 text-xs border-b-2 border-dashed border-slate-400 pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-600">RECEIPT NO:</span>
                <span className="font-bold">{lastReceipt.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">DATE & TIME:</span>
                <span>{lastReceipt.date} | {lastReceipt.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">CITIZEN NAME:</span>
                <span className="font-bold">{lastReceipt.citizenName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">HEALTH ID:</span>
                <span>{lastReceipt.citizenId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">GENDER / AGE:</span>
                <span>{lastReceipt.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">CARD DIGEST:</span>
                <span className="text-[10px]">{lastReceipt.cardHash}</span>
              </div>
            </div>

            <div className="border-b-2 border-dashed border-slate-400 pb-4 mb-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">PURCHASE ITEM DETAILS</div>
              <div className="flex justify-between font-bold text-sm">
                <span>{lastReceipt.brandName}</span>
                <span>{lastReceipt.volumeMl} ml</span>
              </div>
              <div className="text-[11px] text-slate-600 mb-2">{lastReceipt.company}</div>
              <div className="flex justify-between text-xs bg-amber-100 p-2 rounded border border-amber-300">
                <span>MEDICAL UNITS DISPENSED:</span>
                <span className="font-black text-indigo-900">{lastReceipt.units} Units</span>
              </div>
            </div>

            <div className="border-b-2 border-dashed border-slate-400 pb-4 mb-4 text-xs space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">AIIMS MONTHLY BALANCE AUDIT</div>
              <div className="flex justify-between">
                <span className="text-slate-600">PREVIOUS MONTHLY UNITS:</span>
                <span>{lastReceipt.previousUnits.toFixed(1)} Units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">THIS TRANSACTION:</span>
                <span>+{lastReceipt.units} Units</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-300 pt-1">
                <span>NEW MONTHLY TOTAL:</span>
                <span>{lastReceipt.updatedUnits.toFixed(1)} / {lastReceipt.maximumUnits}.0 Units</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>REMAINING MONTHLY QUOTA:</span>
                <span>{lastReceipt.remainingUnits} Units</span>
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="bg-white p-2 border border-slate-300 rounded inline-block">
                <div className="w-24 h-24 bg-slate-900 flex items-center justify-center text-white text-[9px] text-center font-bold p-1">
                  [QR VERIFIED]<br/>STATE GOVT<br/>LEDGER #4012
                </div>
              </div>
              <div className="text-[9px] text-slate-500 uppercase tracking-tight">
                AUTHENTICATED BY SEHAS HEALTH ENGINE • TN STATE REGISTRY AUTHORIZED
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded transition-all cursor-pointer"
              >
                🖨️ Print Receipt
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 bg-amber-200 hover:bg-amber-300 text-slate-900 text-xs font-bold py-2 rounded transition-all cursor-pointer border border-amber-400"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}