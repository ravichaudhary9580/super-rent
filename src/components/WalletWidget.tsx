"use client";

import { useState, useEffect } from "react";
import { Wallet as WalletIcon, PlusCircle, ArrowUpRight, ArrowDownRight, Loader2, X } from "lucide-react";

interface WalletWidgetProps {
  onBalanceUpdate?: (newBalance: number) => void;
}

export function WalletWidget({ onBalanceUpdate }: WalletWidgetProps) {
  const [balance, setBalance] = useState<number>(500);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [rechargeAmount, setRechargeAmount] = useState<number>(500);
  const [isRecharging, setIsRecharging] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const fetchWallet = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/wallet");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        setTotalSpent(data.totalSpent);
        setTransactions(data.transactions || []);
        if (onBalanceUpdate) onBalanceUpdate(data.balance);
      }
    } catch (err) {
      console.error("Error fetching wallet:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleRecharge = async (amount: number) => {
    try {
      setIsRecharging(true);
      setMessage("");

      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, razorpayPaymentId: `RZP_${Date.now()}` }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Recharge failed");

      setMessage(data.message);
      setBalance(data.newBalance);
      if (onBalanceUpdate) onBalanceUpdate(data.newBalance);
      await fetchWallet();
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage("");
      }, 1500);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setIsRecharging(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
              <WalletIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">Buyer Wallet Balance</p>
              <div className="flex flex-wrap items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  {isLoading ? "..." : `₹${balance.toLocaleString("en-IN")}`}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Ready to auto-debit
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-2xl font-extrabold text-sm shadow-lg shadow-blue-600/30 transition-all duration-200 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Funds</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recharge Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
                <WalletIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">Recharge Buyer Wallet</h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">Funds will be available instantly to buy high-intent leads.</p>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm font-bold ${message.includes("Error") || message.includes("failed") ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                {message}
              </div>
            )}

            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Select Amount</label>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {[300, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRechargeAmount(amt)}
                    className={`py-2.5 sm:py-3 rounded-2xl font-black text-base sm:text-lg border transition-all ${
                      rechargeAmount === amt
                        ? "bg-slate-900 text-white border-slate-900 shadow-md"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleRecharge(rechargeAmount)}
              disabled={isRecharging}
              className="w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {isRecharging ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              <span>{isRecharging ? "Processing..." : `Recharge ₹${rechargeAmount}`}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
