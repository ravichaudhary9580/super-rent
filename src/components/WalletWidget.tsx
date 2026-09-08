"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Wallet as WalletIcon, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Loader2, 
  X, 
  History, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  ShieldCheck,
  Building
} from "lucide-react";

interface WalletWidgetProps {
  externalBalance?: number;
  onBalanceUpdate?: (newBalance: number) => void;
  isModalOpenExternal?: boolean;
  setIsModalOpenExternal?: (isOpen: boolean) => void;
  modalOnly?: boolean;
}

export function WalletWidget({ 
  externalBalance, 
  onBalanceUpdate, 
  isModalOpenExternal, 
  setIsModalOpenExternal,
  modalOnly 
}: WalletWidgetProps) {
  const [balance, setBalance] = useState<number>(externalBalance !== undefined ? externalBalance : 500);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [localModalOpen, setLocalModalOpen] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [rechargeAmount, setRechargeAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isRecharging, setIsRecharging] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [txSuccess, setTxSuccess] = useState<any | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isModalOpen = isModalOpenExternal !== undefined ? isModalOpenExternal : localModalOpen;
  const setIsModalOpen = (open: boolean) => {
    if (setIsModalOpenExternal) {
      setIsModalOpenExternal(open);
    } else {
      setLocalModalOpen(open);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isModalOpen]);

  const fetchWallet = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/wallet");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        setTotalSpent(data.totalSpent || 0);
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

  useEffect(() => {
    if (externalBalance !== undefined) {
      setBalance(externalBalance);
    }
  }, [externalBalance]);

  const handleDeposit = async () => {
    const finalAmount = customAmount ? Number(customAmount) : rechargeAmount;
    if (isNaN(finalAmount) || finalAmount <= 0) {
      setMessage("Please enter a valid deposit amount greater than ₹0");
      return;
    }

    try {
      setIsRecharging(true);
      setMessage("");
      setTxSuccess(null);

      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: finalAmount, 
          note: `Owner Wallet Deposit to Provider App (Direct Account Deposit)`
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deposit failed");

      setBalance(data.newBalance);
      setTxSuccess(data.transaction || { amount: finalAmount });
      setMessage(data.message || `₹${finalAmount} added to your wallet!`);
      if (onBalanceUpdate) onBalanceUpdate(data.newBalance);

      // Refresh wallet & transaction ledger
      await fetchWallet();

      setTimeout(() => {
        setIsModalOpen(false);
        setMessage("");
        setTxSuccess(null);
        setCustomAmount("");
      }, 2000);
    } catch (err: any) {
      setMessage(err.message || "Failed to process deposit");
    } finally {
      setIsRecharging(false);
    }
  };

  return (
    <>
      {!modalOnly && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-700/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5 relative z-10">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
                <WalletIcon className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">
                  Owner Wallet Balance
                </p>
                <div className="flex flex-wrap items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    {isLoading ? "..." : `₹${balance.toLocaleString("en-IN")}`}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 shrink-0" /> Debit on Buying Lead
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Total Spent: <strong className="text-slate-200">₹{totalSpent.toLocaleString("en-IN")}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Deposit Funds</span>
              </button>

              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
              >
                <History className="w-4 h-4 text-slate-400" />
                <span>Ledger ({transactions.length})</span>
                {showHistory ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
              </button>
            </div>
          </div>

          {/* Ledger Drawer */}
          {showHistory && (
            <div className="mt-5 pt-4 border-t border-slate-700/60 animate-in fade-in slide-in-from-top-2 duration-200">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <span>Recent Financial Activity</span>
              </h4>

              {transactions.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">
                  No transactions yet. Deposit funds to buy leads.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {transactions.map((tx: any) => {
                    const isCredit = tx.type === "credit";
                    return (
                      <div
                        key={tx._id}
                        className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-800/60 border border-slate-700/40 text-xs gap-2"
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
                              isCredit ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {isCredit ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-200 truncate max-w-[160px] sm:max-w-md text-xs">
                              {tx.description || (isCredit ? "Wallet Top-up" : "Lead Purchase")}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`font-black text-xs sm:text-sm ${
                              isCredit ? "text-emerald-400" : "text-slate-300"
                            }`}
                          >
                            {isCredit ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                          </span>
                          <div className="text-[9px] font-bold text-slate-400 uppercase">
                            {tx.status || "Completed"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Funds / Deposit Modal */}
      {mounted && isModalOpen && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            width: "100vw", 
            height: "100vh", 
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zoom: 1
          }}
        >
          {/* Backdrop click to close */}
          <div 
            className="absolute inset-0" 
            onClick={() => setIsModalOpen(false)} 
          />

          <div 
            className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-8 shadow-2xl border border-slate-100 relative z-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 text-blue-600 rounded-xl sm:rounded-2xl mx-auto flex items-center justify-center mb-2.5 sm:mb-3">
                <Building className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Deposit Funds to Wallet
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Owner to Provider App Account Transaction. Added balance is used to buy leads.
              </p>
            </div>

            {message && (
              <div
                className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
                  message.includes("Error") || message.includes("failed") || message.includes("Valid")
                    ? "bg-red-50 text-red-600 border border-red-100"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {txSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                <span>{message}</span>
              </div>
            )}

            {/* Quick Presets */}
            <div className="space-y-2.5 sm:space-y-3 mb-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                Select Amount
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[300, 500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setRechargeAmount(amt);
                      setCustomAmount("");
                    }}
                    className={`py-2.5 rounded-xl sm:rounded-2xl font-black text-sm border transition-all cursor-pointer ${
                      !customAmount && rechargeAmount === amt
                        ? "bg-slate-900 text-white border-slate-900 shadow-md"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="mb-4 sm:mb-5">
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Or Enter Custom Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-base">
                  ₹
                </span>
                <input
                  type="number"
                  min="50"
                  max="100000"
                  step="50"
                  placeholder="e.g. 1500"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Bank Gateway Notice */}
            <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-xl sm:rounded-2xl text-[11px] text-amber-800 mb-5 sm:mb-6 flex items-start gap-2">
              <span className="text-amber-600 font-bold shrink-0">ℹ️ Note:</span>
              <span>
                Direct company deposit is active. Bank / Razorpay API integration will connect here later. Clicking Deposit instantly credits your wallet.
              </span>
            </div>

            <button
              onClick={handleDeposit}
              disabled={isRecharging}
              className="w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-xl shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isRecharging ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              <span>
                {isRecharging
                  ? "Processing Deposit..."
                  : `Deposit ₹${customAmount ? Number(customAmount).toLocaleString("en-IN") : rechargeAmount.toLocaleString("en-IN")} to Wallet`}
              </span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
