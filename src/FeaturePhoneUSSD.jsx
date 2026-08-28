import React, { useState } from 'react';

export default function FeaturePhoneUSSD({ selectedCitizen, rules }) {
  const [ussdInput, setUssdInput] = useState('');
  const [ussdScreen, setUssdScreen] = useState('menu');

  const handleKeyClick = (key) => {
    if (key === 'CLEAR') {
      setUssdInput((prev) => prev.slice(0, -1));
    } else if (key === 'SEND') {
      if (ussdInput === '1') setUssdScreen('quota');
      else if (ussdInput === '2') setUssdScreen('asha');
      else if (ussdInput === '3') setUssdScreen('insurance');
      else if (ussdInput === '4') setUssdScreen('history');
      else setUssdScreen('invalid');
      setUssdInput('');
    } else {
      if (ussdInput.length < 5) {
        setUssdInput((prev) => prev + key);
      }
    }
  };

  const resetPhone = () => {
    setUssdScreen('menu');
    setUssdInput('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[550px] py-4">
      {/* Outer Shell */}
      <div className="w-[300px] bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 p-6 rounded-[48px] border-4 border-slate-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative flex flex-col items-center select-none">
        
        {/* Earpiece */}
        <div className="w-16 h-2 bg-slate-950 rounded-full mb-3 border border-slate-800 flex justify-center items-center">
          <div className="w-8 h-0.5 bg-slate-800 rounded-full" />
        </div>

        <div className="text-[10px] font-mono tracking-widest text-slate-400 font-extrabold mb-2">
          NOKIA • SEHAS 3310
        </div>

        {/* Monochromatic Green LCD Display */}
        <div className="w-full h-52 bg-[#9ebd6e] border-4 border-slate-800 rounded-xl p-3 font-mono text-[#1a2d08] shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#1a2d08_1px,transparent_1px)] [background-size:3px_3px] opacity-10 pointer-events-none" />

          {/* Status Bar */}
          <div className="flex justify-between items-center text-[10px] font-bold border-b border-[#1a2d08]/30 pb-1">
            <span>📶 BSNL 3G</span>
            <span>🔋 100%</span>
          </div>

          {/* Screen Content */}
          <div className="flex-1 my-1 text-[11px] leading-tight flex flex-col justify-center font-bold">
            {ussdScreen === 'menu' && (
              <div className="space-y-0.5">
                <p className="underline mb-1">SEHAS AIIMS Portal</p>
                <p>1. Check Pure Alcohol Quota</p>
                <p>2. Request ASHA Care Nudge</p>
                <p>3. Family Insurance Cover</p>
                <p>4. Recent Purchases</p>
              </div>
            )}

            {ussdScreen === 'quota' && (
              <p>
                [AIIMS QUOTA]<br />
                {selectedCitizen.name} ({selectedCitizen.gender})<br />
                Intake: {selectedCitizen.usedUnits} / {rules.maxMonthlyUnits} U<br />
                Rem: {rules.maxMonthlyUnits - selectedCitizen.usedUnits} Units
              </p>
            )}

            {ussdScreen === 'asha' && (
              <p>
                [ASHA CARE DISPATCHED]<br />
                Counselor assigned to profile {selectedCitizen.id}.
              </p>
            )}

            {ussdScreen === 'insurance' && (
              <p>
                [FAMILY INSURANCE]<br />
                Linked Cover: {selectedCitizen.insuranceBalance}<br />
                Policy Active
              </p>
            )}

            {ussdScreen === 'history' && (
              <p>
                [RECENT ACTIVITY]<br />
                Last: {selectedCitizen.lastPurchase}<br />
                Logged: {selectedCitizen.usedUnits} Units
              </p>
            )}

            {ussdScreen === 'invalid' && (
              <p className="text-center">
                [INVALID OPTION]<br />
                Press 1, 2, 3, or 4.
              </p>
            )}
          </div>

          <div className="border-t border-[#1a2d08]/30 pt-1 flex justify-between items-center text-[11px] font-bold h-6">
            <span>INPUT: {ussdInput}</span>
            <span className="animate-pulse">_</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="w-full mt-4 grid grid-cols-3 gap-2 px-1">
          <button 
            onClick={() => handleKeyClick('SEND')}
            className="bg-emerald-800 hover:bg-emerald-700 active:translate-y-0.5 text-emerald-100 font-bold text-xs py-2 rounded-lg border-b-2 border-emerald-950 shadow-md cursor-pointer transition-all"
          >
            CALL / OK
          </button>
          
          <button 
            onClick={resetPhone}
            className="bg-slate-700 hover:bg-slate-600 active:translate-y-0.5 text-white font-bold text-[10px] py-2 rounded-lg border-b-2 border-slate-900 shadow-md cursor-pointer transition-all"
          >
            NAV
          </button>

          <button 
            onClick={() => handleKeyClick('CLEAR')}
            className="bg-rose-900 hover:bg-rose-800 active:translate-y-0.5 text-rose-100 font-bold text-xs py-2 rounded-lg border-b-2 border-rose-950 shadow-md cursor-pointer transition-all"
          >
            END / C
          </button>
        </div>

        {/* Keypad */}
        <div className="w-full mt-3 grid grid-cols-3 gap-2 px-1">
          {[
            { num: '1', sub: '._@' },
            { num: '2', sub: 'ABC' },
            { num: '3', sub: 'DEF' },
            { num: '4', sub: 'GHI' },
            { num: '5', sub: 'JKL' },
            { num: '6', sub: 'MNO' },
            { num: '7', sub: 'PQRS' },
            { num: '8', sub: 'TUV' },
            { num: '9', sub: 'WXYZ' },
            { num: '*', sub: 'a<->A' },
            { num: '0', sub: '␣' },
            { num: '#', sub: '⇧' },
          ].map((key) => (
            <button
              key={key.num}
              onClick={() => handleKeyClick(key.num)}
              className="bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 active:translate-y-0.5 text-slate-100 rounded-xl py-2 flex flex-col items-center justify-center border-b-2 border-slate-950 shadow-md cursor-pointer transition-all active:shadow-inner"
            >
              <span className="text-sm font-extrabold font-mono leading-none">{key.num}</span>
              <span className="text-[8px] text-slate-400 font-sans tracking-tight">{key.sub}</span>
            </button>
          ))}
        </div>

        <div className="w-1.5 h-1.5 bg-slate-950 rounded-full mt-4 border border-slate-800" />
      </div>
    </div>
  );
}