import React from 'react';
import { ReceiptEntry, CATEGORY_COLORS } from '../types';
import { Trash2, ShoppingBag, Utensils, Car, Zap, Tv, Heart, HelpCircle } from 'lucide-react';

interface TransactionListProps {
  transactions: ReceiptEntry[];
  onDelete: (id: string) => void;
  currency: string;
}

const getIconForCategory = (category: string) => {
  switch (category) {
    case 'Food & Dining': return Utensils;
    case 'Shopping': return ShoppingBag;
    case 'Transport': return Car;
    case 'Bills & Utilities': return Zap;
    case 'Entertainment': return Tv;
    case 'Health & Wellness': return Heart;
    default: return HelpCircle;
  }
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, currency }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-400">No transactions found.</p>
      </div>
    );
  }

  // Sort by newest
  const sorted = [...transactions].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-4">
      {sorted.map((t) => {
        const Icon = getIconForCategory(t.category);
        return (
          <div key={t.id} className="group bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: CATEGORY_COLORS[t.category] }}
              >
                <Icon size={18} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">{t.merchant}</h4>
                <p className="text-xs text-slate-500">{t.date} • {t.category}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-800">
                {currency !== t.currency ? t.currency : ''} {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <button 
                onClick={() => onDelete(t.id)}
                className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 p-2"
                aria-label="Delete transaction"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;