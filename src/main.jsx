import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import OriginalApp from './App.jsx'

const EnhancedApp = () => {
  const [surchargeStats, setSurchargeStats] = useState({
    totalInsuranceCollected: 0,
    totalMaintenanceCollected: 0,
    totalGovtLevyCollected: 0,
    totalSurchargesCollected: 0
  });

  useEffect(() => {
    // 1. Dynamic calculation for Dashboard Surcharge Ledger
    const updateDashboardStats = () => {
      const rows = document.querySelectorAll('tbody tr');
      let successCount = 0;
      rows.forEach(row => {
        if (row.textContent.includes('SUCCESSFUL')) {
          successCount++;
        }
      });

      setSurchargeStats({
        totalInsuranceCollected: successCount * 5,
        totalMaintenanceCollected: successCount * 3,
        totalGovtLevyCollected: successCount * 2,
        totalSurchargesCollected: successCount * 10
      });
    };

    // 2. Inject Surcharge Breakdown into Receipt ONLY when opened post-order
    const injectSurchargeIntoReceipt = () => {
      // Find the receipt modal container if present in DOM
      const receiptContainer = document.querySelector('.fixed.inset-0 .bg-slate-950');
      if (receiptContainer && !document.getElementById('surcharge-receipt-breakdown')) {
        const surchargeBlock = document.createElement('div');
        surchargeBlock.id = 'surcharge-receipt-breakdown';
        surchargeBlock.className = 'border-t border-slate-800 pt-2 mt-2 space-y-1 text-slate-300';
        surchargeBlock.innerHTML = `
          <div class="flex justify-between font-bold text-amber-400">
            <span>Mandatory Surcharge Fee:</span>
            <span>₹10.00</span>
          </div>
          <div class="flex justify-between text-[11px] text-slate-400 pl-2">
            <span>• Health Insurance (50%):</span>
            <span class="text-emerald-400 font-bold">₹5.00</span>
          </div>
          <div class="flex justify-between text-[11px] text-slate-400 pl-2">
            <span>• Shop Maintenance (30%):</span>
            <span class="text-amber-400 font-bold">₹3.00</span>
          </div>
          <div class="flex justify-between text-[11px] text-slate-400 pl-2">
            <span>• State Revenue Levy (20%):</span>
            <span class="text-indigo-400 font-bold">₹2.00</span>
          </div>
        `;
        receiptContainer.appendChild(surchargeBlock);
      }
    };

    // Observe DOM changes to catch order completion & modal opening
    const observer = new MutationObserver(() => {
      updateDashboardStats();
      injectSurchargeIntoReceipt();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Top Universal Surcharge Announcement Banner */}
      <div className="bg-amber-500 text-slate-950 font-mono text-xs font-bold px-6 py-2 flex justify-between items-center shadow-md border-b border-amber-400">
        <span>⚠️ MANDATORY DEDUCTION: ₹10 SURCHARGE PER TRANSACTION</span>
        <div className="flex space-x-4">
          <span>🏥 Insurance Fund: <strong>₹5</strong></span>
          <span>🛠️ Maintenance & Service: <strong>₹3</strong></span>
          <span>🏛️ Government Levy: <strong>₹2</strong></span>
        </div>
      </div>

      {/* Surcharge Financial Summary Strip (Appended to Dashboard View) */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="text-slate-400 font-bold uppercase tracking-wider">
            🏛️ State Surcharge Ledger Summary
          </span>
          <div className="flex space-x-6">
            <span className="text-emerald-400">
              Insurance Pool: <strong>₹{surchargeStats.totalInsuranceCollected}</strong>
            </span>
            <span className="text-amber-400">
              Maintenance Pool: <strong>₹{surchargeStats.totalMaintenanceCollected}</strong>
            </span>
            <span className="text-indigo-400">
              Govt Treasury: <strong>₹{surchargeStats.totalGovtLevyCollected}</strong>
            </span>
            <span className="text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              Total Surcharges: <strong>₹{surchargeStats.totalSurchargesCollected}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Untouched Base Application */}
      <OriginalApp />
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EnhancedApp />
  </StrictMode>,
)