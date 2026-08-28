import React, { useState } from 'react';
import { analyzePurchaseWithLatent } from './latentService';
const calculateMedicalUnits = (volumeMl, abv = 0.40) => {
  const gramsOfAlcohol = volumeMl * abv * 0.8;
  return Math.round((gramsOfAlcohol / 10) * 10) / 10;
};
const BOTTLE_SIZES = [
  { label: '30 ml Peg Shot', ml: 30, units: calculateMedicalUnits(30), price: 40 },
  { label: '60 ml Large Peg', ml: 60, units: calculateMedicalUnits(60), price: 80 },
  { label: '180 ml Quarter', ml: 180, units: calculateMedicalUnits(180), price: 210 },
  { label: '375 ml Half', ml: 375, units: calculateMedicalUnits(375), price: 420 },
];
const AIIMS_RULES = {
  Male: {
    maxDailyUnits: 2.0,
    maxMonthlyUnits: 56.0
  },
  Female: {
    maxDailyUnits: 1.0,
    maxMonthlyUnits: 28.0
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('terminal');

  const citizenProfiles = [
    {
      id: 'CIT-9041',
      hash: '0x8f3a...91c',
      name: 'R. Kumar',
      age: 34,
      gender: 'Male',
      usedUnits: 18.0,
      riskScore: 'Low Risk',
      insuranceBalance: '₹1,200',
      lastPurchase: '10 Aug 2026'
    },
    {
      id: 'CIT-3302',
      hash: '0x4d11...29e',
      name: 'L. Lakshmi',
      age: 31,
      gender: 'Female',
      usedUnits: 27.0,
      riskScore: 'Near Female Monthly Cap',
      insuranceBalance: '₹3,500',
      lastPurchase: '08 Aug 2026'
    },
    {
      id: 'CIT-7741',
      hash: '0x5c33...60b',
      name: 'K. Vasanthi',
      age: 38,
      gender: 'Female',
      usedUnits: 28.0,
      riskScore: 'Female Cap Exhausted',
      insuranceBalance: '₹1,900',
      lastPurchase: '12 Aug 2026'
    }
  ];

  const [selectedCitizenIndex, setSelectedCitizenIndex] = useState(0);
  const selectedCitizen = citizenProfiles[selectedCitizenIndex];

  const rules = AIIMS_RULES[selectedCitizen.gender];
  const [selectedServing, setSelectedServing] = useState(BOTTLE_SIZES[0]);

  const [cardScanned, setCardScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState('IDLE');
  const [statusMessage, setStatusMessage] = useState('TERMINAL READY: INSERT HEALTH SMARTCARD');

  const [lastReceipt, setLastReceipt] = useState(null);

  const [dbLogs, setDbLogs] = useState([
    { id: 'TXN-8801', card_hash: '0x8f3a...91c', gender: 'Male', item: '60 ml Large Peg', total_units: '1.9 Units', fee_split: '₹19.00', timestamp: '12 Aug, 10:14 AM', status: 'SUCCESS' },
    { id: 'TXN-8802', card_hash: '0x4d11...29e', gender: 'Female', item: '30 ml Peg Shot', total_units: '1.0 Units', fee_split: '₹10.00', timestamp: '12 Aug, 10:45 AM', status: 'SUCCESS' },
    { id: 'TXN-8803', card_hash: '0x5c33...60b', gender: 'Female', item: '180 ml Quarter', total_units: '5.8 Units', fee_split: '₹0.00', timestamp: '12 Aug, 12:05 PM', status: 'BLOCKED (AIIMS Single Session Cap)' }
  ]);
  const [ussdInput, setUssdInput] = useState('');
  const [ussdScreen, setUssdScreen] = useState('menu');
  const exceedsDailyLimit = selectedServing.units > rules.maxDailyUnits;
  const projectedMonthlyUnits = selectedCitizen.usedUnits + selectedServing.units;
  const exceedsMonthlyLimit = projectedMonthlyUnits > rules.maxMonthlyUnits;
  const isPurchaseBlocked = exceedsDailyLimit || exceedsMonthlyLimit;

  const handleCardScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setCardScanned(true);
      setIsScanning(false);
      setBiometricStatus('IDLE');

      if (selectedCitizen.usedUnits >= rules.maxMonthlyUnits) {
        setStatusMessage(`BLOCKED: Monthly AIIMS Cap Reached (${selectedCitizen.usedUnits}/${rules.maxMonthlyUnits} Units)`);
      } else {
        setStatusMessage('CARD READ OK. BIOMETRIC AUTHENTICATION REQUIRED');
      }
    }, 800);
  };

  const handleBiometricAuth = (success = true) => {
    if (selectedCitizen.usedUnits >= rules.maxMonthlyUnits) return;

    setBiometricStatus('SCANNING');
    setTimeout(() => {
      if (success) {
        setBiometricStatus('SUCCESS');
        setStatusMessage('BIOMETRICS VERIFIED. SELECT APPROVED SERVING SIZE');
      } else {
        setBiometricStatus('FAILED');
        setStatusMessage('BIOMETRIC MISMATCH: TRANSACTION TERMINATED');
      }
    }, 1000);
  };

  const handlePurchase = async () => {
    if (biometricStatus !== 'SUCCESS' || isPurchaseBlocked) return;
    setStatusMessage('EVALUATING SAFETY CONSTRAINTS VIA LATENTSTACK AI...');

    const latentDecision = await analyzePurchaseWithLatent(
      selectedCitizen,
      selectedServing.label,
      selectedServing.ml
    );

    if (!latentDecision.approved) {
      setStatusMessage(`LATENTSTACK AI BLOCK [${latentDecision.risk_level} RISK]: ${latentDecision.reason}`);

      const blockedRecord = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        card_hash: selectedCitizen.hash,
        gender: selectedCitizen.gender,
        item: selectedServing.label,
        total_units: `${selectedServing.units} Units`,
        fee_split: '₹0.00',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: `BLOCKED (LatentStack Risk: ${latentDecision.risk_level})`
      };
      setDbLogs((prev) => [blockedRecord, ...prev]);
      return;
    }

    setStatusMessage('AUTHORIZING BANK & HEALTH FUND SPLIT...');

    const txnId = `TXN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord = {
      id: txnId,
      card_hash: selectedCitizen.hash,
      gender: selectedCitizen.gender,
      item: selectedServing.label,
      total_units: `${selectedServing.units} Units`,
      fee_split: `₹${(selectedServing.units * 10).toFixed(2)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'SUCCESS'
    };

    setDbLogs((prev) => [newRecord, ...prev]);

    setTimeout(() => {
      selectedCitizen.usedUnits = projectedMonthlyUnits;
      setStatusMessage(`TRANSACTION COMPLETE: Dispensing ${selectedServing.label}`);
      setLastReceipt({
        txnId,
        citizen: selectedCitizen.name,
        item: selectedServing.label,
        price: selectedServing.price,
        units: selectedServing.units,
        surcharge: (selectedServing.units * 10).toFixed(2),
        time: new Date().toLocaleTimeString()
      });
      setCardScanned(false);
      setBiometricStatus('IDLE');
    }, 1000);
  };

  const handleKeyPress = (num) => {
    if (ussdInput.length < 4) {
      setUssdInput((prev) => prev + num);
    }
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
    { num: '1', sub: 'oo' },
    { num: '2', sub: 'abc' },
    { num: '3', sub: 'def' },
    { num: '4', sub: 'ghi' },
    { num: '5', sub: 'jkl' },
    { num: '6', sub: 'mno' },
    { num: '7', sub: 'pqrs' },
    { num: '8', sub: 'tuv' },
    { num: '9', sub: 'wxyz' },
    { num: '*', sub: '+' },
    { num: '0', sub: '␣' },
    { num: '#', sub: '⇧' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header*/}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="bg-indigo-600 text-white font-black text-xl px-3 py-1 rounded-lg tracking-wider border border-indigo-400/30 shadow-md">
            SEHAS
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide text-white">TASMAC Automated Retail & Health Governance System</h1>
            <p className="text-xs text-slate-400 font-mono">Government of Tamil Nadu | AIIMS Medical Threshold Integration</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-slate-300">OUTLET #4012 (MADURAI CENTRAL)</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-6 py-2 flex space-x-2">
        {[
          { id: 'terminal', label: '🖥️ POS Hardware Terminal' },
          { id: 'ussd', label: '📱 Feature Phone (*566# USSD)' },
          { id: 'dashboard', label: '📊 State Health Governance' },
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

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        
        {/* TAB 1: REALISTIC POS HARDWARE TERMINAL */}
        {activeTab === 'terminal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: POS Terminal Screen & Controls (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* POS Machine Enclosure */}
              <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-5 shadow-2xl relative">
                
                {/* POS Screen Header */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-5 flex justify-between items-center font-mono text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${cardScanned ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <div className={`w-2.5 h-2.5 rounded-full ${biometricStatus === 'SUCCESS' ? 'bg-emerald-500' : biometricStatus === 'FAILED' ? 'bg-rose-500' : 'bg-slate-700'}`} />
                    </div>
                    <span className="text-slate-400">MODE: ONLINE_AUTHD</span>
                  </div>
                  <div className="text-indigo-400 font-bold">STATE INTAKE GATEWAY v4.2</div>
                </div>

                {/* Main POS LCD Visualiser */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-center space-y-3 mb-6">
                  <div className="text-xs font-mono text-slate-500 tracking-widest uppercase">System Operational Message</div>
                  <div className={`text-base font-mono font-bold tracking-wide ${
                    biometricStatus === 'SUCCESS' && !isPurchaseBlocked ? 'text-emerald-400' :
                    biometricStatus === 'FAILED' || isPurchaseBlocked ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {statusMessage}
                  </div>
                </div>

                {/* Step-by-Step POS Hardware Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Smart Card Slot Module */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <span>1. Citizen SmartCard Reader</span>
                      <span className="text-[10px] font-mono text-indigo-400">ISO/IEC 7816</span>
                    </div>

                    <select 
                      value={selectedCitizenIndex}
                      onChange={(e) => {
                        setSelectedCitizenIndex(Number(e.target.value));
                        setCardScanned(false);
                        setBiometricStatus('IDLE');
                        setStatusMessage('TERMINAL READY: INSERT HEALTH SMARTCARD');
                        setSelectedServing(BOTTLE_SIZES[0]);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {citizenProfiles.map((c, i) => (
                        <option key={c.id} value={i}>
                          {c.name} ({c.gender}) - Used: {c.usedUnits} Units
                        </option>
                      ))}
                    </select>

                    <button 
                      onClick={handleCardScan}
                      disabled={isScanning}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 py-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isScanning ? 'Reading Chip...' : cardScanned ? '✓ Card Inserted & Verified' : '💳 Insert Citizen Smartcard'}
                    </button>
                  </div>

                  {/* Optical Fingerprint Scanner Module */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <span>2. Biometric Verification</span>
                      <span className="text-[10px] font-mono text-indigo-400">UIDAI / Aadhaar</span>
                    </div>

                    <div className="flex items-center space-x-3 bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg border ${
                        biometricStatus === 'SUCCESS' ? 'border-emerald-500 text-emerald-400 bg-emerald-950/50' :
                        biometricStatus === 'FAILED' ? 'border-rose-500 text-rose-400 bg-rose-950/50' :
                        biometricStatus === 'SCANNING' ? 'border-amber-500 text-amber-400 animate-pulse' :
                        'border-slate-800 text-slate-600 bg-slate-950'
                      }`}>
                        ☝️
                      </div>
                      <div className="flex-1 text-[11px] font-mono">
                        <div className="text-slate-400">STATUS:</div>
                        <div className="font-bold text-slate-200">{biometricStatus}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBiometricAuth(true)}
                        disabled={!cardScanned || biometricStatus === 'SCANNING'}
                        className="flex-1 bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30 cursor-pointer"
                      >
                        Scan Pass
                      </button>
                      <button
                        onClick={() => handleBiometricAuth(false)}
                        disabled={!cardScanned || biometricStatus === 'SCANNING'}
                        className="flex-1 bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30 cursor-pointer"
                      >
                        Scan Fail
                      </button>
                    </div>
                  </div>

                </div>

                {/* Serving Dispenser & Dispense Action */}
                {biometricStatus === 'SUCCESS' && (
                  <div className="mt-5 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">3. Select Serving & Enforce Limits</span>
                      <span className="text-xs font-mono text-emerald-400">Quota Available: {(rules.maxMonthlyUnits - selectedCitizen.usedUnits).toFixed(1)} U</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {BOTTLE_SIZES.map((b) => {
                        const exceedsDaily = b.units > rules.maxDailyUnits;
                        const isSelected = selectedServing.ml === b.ml;
                        return (
                          <button
                            key={b.ml}
                            onClick={() => setSelectedServing(b)}
                            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600/20 border-indigo-500 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            <div className="font-bold text-xs">{b.label}</div>
                            <div className="text-[10px] font-mono mt-1 text-indigo-300">{b.units} Units | ₹{b.price}</div>
                            {exceedsDaily && <div className="text-[9px] text-rose-400 font-bold mt-1">Exceeds Daily Cap</div>}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={handlePurchase}
                      disabled={isPurchaseBlocked}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-extrabold py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 cursor-pointer border border-emerald-400/30"
                    >
                      {exceedsDailyLimit ? `BLOCKED: Exceeds ${selectedCitizen.gender} AIIMS Session Limit (${rules.maxDailyUnits} U)` :
                       exceedsMonthlyLimit ? `BLOCKED: Exceeds ${selectedCitizen.gender} AIIMS Monthly Cap (${rules.maxMonthlyUnits} U)` :
                       `AUTHORIZE & DISPENSE (${selectedServing.label} - ₹${selectedServing.price})`}
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* Right Column: Citizen Live Dossier & POS Thermal Receipt (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Citizen Health Profile Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedCitizen.name}</h3>
                    <p className="text-[11px] font-mono text-slate-400">ID: {selectedCitizen.id} | {selectedCitizen.gender}, {selectedCitizen.age}</p>
                  </div>
                  <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold px-2 py-1 rounded">
                    {selectedCitizen.riskScore}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>AIIMS Daily Cap:</span>
                    <span className="text-white font-bold">{rules.maxDailyUnits} Unit / session</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>AIIMS Monthly Cap:</span>
                    <span className="text-white font-bold">{rules.maxMonthlyUnits} Units / month</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Current Intake:</span>
                    <span className={selectedCitizen.usedUnits >= rules.maxMonthlyUnits ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {selectedCitizen.usedUnits} Units
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>Monthly Quota Used</span>
                    <span>{Math.round((selectedCitizen.usedUnits / rules.maxMonthlyUnits) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        selectedCitizen.usedUnits >= rules.maxMonthlyUnits ? 'bg-rose-500' : 'bg-indigo-500'
                      }`} 
                      style={{ width: `${Math.min(100, (selectedCitizen.usedUnits / rules.maxMonthlyUnits) * 100)}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* POS Thermal Receipt Box */}
              <div className="bg-amber-50 text-slate-900 rounded-xl p-4 font-mono text-xs shadow-2xl border border-amber-200/50 space-y-2">
                <div className="text-center border-b border-dashed border-slate-400 pb-2">
                  <p className="font-extrabold uppercase text-sm tracking-wider">TASMAC STATE OUTLET</p>
                  <p className="text-[10px] text-slate-600">TAMIL NADU STATE HEALTH GATEWAY</p>
                </div>

                {lastReceipt ? (
                  <div className="space-y-1.5 py-1">
                    <div className="flex justify-between"><span>TXN ID:</span><span className="font-bold">{lastReceipt.txnId}</span></div>
                    <div className="flex justify-between"><span>CITIZEN:</span><span>{lastReceipt.citizen}</span></div>
                    <div className="flex justify-between"><span>ITEM:</span><span>{lastReceipt.item}</span></div>
                    <div className="flex justify-between"><span>UNITS:</span><span>{lastReceipt.units} Medical Units</span></div>
                    <div className="flex justify-between border-t border-dashed border-slate-300 pt-1"><span>ITEM COST:</span><span>₹{lastReceipt.price}</span></div>
                    <div className="flex justify-between"><span>HEALTH SURCHARGE:</span><span>₹{lastReceipt.surcharge}</span></div>
                    <div className="flex justify-between font-extrabold text-sm border-t border-slate-800 pt-1"><span>TOTAL PAID:</span><span>₹{(Number(lastReceipt.price) + Number(lastReceipt.surcharge)).toFixed(2)}</span></div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 italic">
                    [ No transaction processed yet ]
                  </div>
                )}

                <div className="text-center border-t border-dashed border-slate-400 pt-2 text-[9px] text-slate-500">
                  HEALTH SURCHARGE ALLOCATED TO ASHA CARE & INSURANCE
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: RETRO FEATURE PHONE (*566# USSD) */}
        {activeTab === 'ussd' && (
          <div className="flex justify-center items-center py-4">
            <div className="w-[340px] bg-slate-900 rounded-[48px] p-5 shadow-2xl border-2 border-slate-800 relative flex flex-col items-center">
              
              <div className="w-full flex flex-col items-center mb-3">
                <div className="w-12 h-1.5 bg-slate-950 rounded-full border border-slate-800 mb-2" />
                <div className="text-[10px] font-black tracking-[0.25em] text-slate-500 uppercase">SEHAS 3310</div>
              </div>

              {/* LCD Screen Container */}
              <div className="w-full bg-[#9ebb11] border-4 border-slate-950 rounded-lg p-3 text-[#112a00] font-mono shadow-inner relative flex flex-col justify-between min-h-[190px]">
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold border-b border-[#7b9308] pb-1 mb-2">
                    <span>📶 IND AIRTEL</span>
                    <span>*566# 🔋</span>
                  </div>

                  {ussdScreen === 'menu' && (
                    <div className="space-y-1 text-xs font-semibold leading-tight">
                      <p className="font-extrabold uppercase border-b border-[#7b9308]/60 pb-0.5">-- AIIMS PORTAL --</p>
                      <p>1. Check Daily/Monthly Quota</p>
                      <p>2. Request ASHA Care Nudge</p>
                      <p>3. Family Insurance Cover</p>
                      <p>4. Last Purchase Record</p>
                    </div>
                  )}

                  {ussdScreen === 'quota' && (
                    <p className="text-xs font-semibold leading-tight">
                      [QUOTA] {selectedCitizen.name}: {selectedCitizen.usedUnits}/{rules.maxMonthlyUnits} U consumed. ({rules.maxMonthlyUnits - selectedCitizen.usedUnits} U rem). Daily cap: {rules.maxDailyUnits} U.
                    </p>
                  )}

                  {ussdScreen === 'asha' && (
                    <p className="text-xs font-semibold leading-tight">
                      [ASHA] Care alert generated for {selectedCitizen.name}. Counselor notified for outreach.
                    </p>
                  )}

                  {ussdScreen === 'insurance' && (
                    <p className="text-xs font-semibold leading-tight">
                      [INSURANCE] Cover Bal: {selectedCitizen.insuranceBalance} linked to Citizen ID {selectedCitizen.id}.
                    </p>
                  )}

                  {ussdScreen === 'history' && (
                    <p className="text-xs font-semibold leading-tight">
                      [HISTORY] Last txn: {selectedCitizen.lastPurchase}. Total intake recorded: {selectedCitizen.usedUnits} Units.
                    </p>
                  )}

                  {ussdScreen === 'invalid' && (
                    <p className="text-xs font-bold text-red-900 leading-tight">
                      Invalid Option. Press 1, 2, 3, or 4 to continue.
                    </p>
                  )}
                </div>

                <div className="border-t border-[#7b9308] pt-1 mt-2 flex justify-between items-center text-[11px] font-bold">
                  <span>In: <span className="underline bg-[#8a9f18] px-1 rounded">{ussdInput || '_'}</span></span>
                  <span className="text-[10px] tracking-wider uppercase">[SEND]</span>
                </div>
              </div>

              {/* Navigation Keypad */}
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

              {/* Keypad Matrix */}
              <div className="w-full grid grid-cols-3 gap-2 px-2 pb-2">
                {keypadButtons.map((k) => (
                  <button
                    key={k.num}
                    onClick={() => handleKeyPress(k.num)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-100 py-2 rounded-xl border border-slate-700 shadow flex flex-col items-center cursor-pointer"
                  >
                    <span className="text-sm font-black leading-none">{k.num}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">{k.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROFESSIONAL STATE HEALTH GOVERNANCE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Top State Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>ACTIVE POS OUTLETS</span>
                  <span className="text-emerald-400">● ONLINE</span>
                </div>
                <div className="text-2xl font-black text-white mt-2">1,420 / 1,420</div>
                <div className="text-[11px] text-slate-500 mt-1">100% Realtime Sync across State</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>HEALTH SURCHARGE COLLECTED</span>
                  <span className="text-indigo-400">₹10/UNIT</span>
                </div>
                <div className="text-2xl font-black text-emerald-400 mt-2">₹14,20,450</div>
                <div className="text-[11px] text-slate-500 mt-1">Split to ASHA & Family Health Cover</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>AIIMS CAP BLOCKS</span>
                  <span className="text-rose-400">STRICT</span>
                </div>
                <div className="text-2xl font-black text-rose-400 mt-2">389 BLOCKS</div>
                <div className="text-[11px] text-slate-500 mt-1">Over-consumption prevented today</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>ASHA NUDGES DISPATCHED</span>
                  <span className="text-amber-400">COMMUNITY</span>
                </div>
                <div className="text-2xl font-black text-amber-400 mt-2">112 COUNSELINGS</div>
                <div className="text-[11px] text-slate-500 mt-1">High-risk family alerts triggered</div>
              </div>
            </div>

            {/* Health Surcharge Allocation Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Health Surcharge Governance Revenue Allocation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <div className="text-xs font-mono text-indigo-400">40% ALLOCATION</div>
                  <div className="text-lg font-bold text-white mt-1">Terminal Infrastructure</div>
                  <div className="text-xs text-slate-400 mt-1">Funds biometric reader deployment and offline USSD servers across rural TASMAC points.</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <div className="text-xs font-mono text-emerald-400">20% ALLOCATION</div>
                  <div className="text-lg font-bold text-white mt-1">ASHA Health Worker Fund</div>
                  <div className="text-xs text-slate-400 mt-1">Direct stipend bonuses for ASHA workers conducting family counseling nudges.</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <div className="text-xs font-mono text-indigo-400">40% ALLOCATION</div>
                  <div className="text-lg font-bold text-white mt-1">Family Health Insurance</div>
                  <div className="text-xs text-slate-400 mt-1">Accumulates directly in the citizen's linked state health card for medical emergencies.</div>
                </div>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Realtime State Intake Audit Log ({dbLogs.length} Records)</h3>
                <span className="text-xs font-mono text-slate-500">ENCRYPTED LEDGER SYNC</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">TXN ID</th>
                      <th className="p-3">CARD HASH</th>
                      <th className="p-3">GENDER</th>
                      <th className="p-3">ITEM</th>
                      <th className="p-3">MEDICAL UNITS</th>
                      <th className="p-3">HEALTH FEE</th>
                      <th className="p-3">TIMESTAMP</th>
                      <th className="p-3">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                    {dbLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-bold text-indigo-400">{log.id}</td>
                        <td className="p-3 text-slate-400">{log.card_hash}</td>
                        <td className="p-3">
                          <span className={log.gender === 'Female' ? 'text-purple-400 font-bold' : 'text-blue-400 font-bold'}>
                            {log.gender}
                          </span>
                        </td>
                        <td className="p-3 text-white">{log.item}</td>
                        <td className="p-3 font-bold text-amber-400">{log.total_units}</td>
                        <td className="p-3 text-emerald-400">{log.fee_split}</td>
                        <td className="p-3 text-slate-500">{log.timestamp}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status.includes('SUCCESS') ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
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
    </div>
  );
}