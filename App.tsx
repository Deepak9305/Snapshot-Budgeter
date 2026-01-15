import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  Download, 
  ShieldCheck, 
  X,
  Filter,
  ArrowLeft
} from 'lucide-react';
import StatsCard from './components/StatsCard';
import ExpenseChart from './components/ExpenseChart';
import TransactionList from './components/TransactionList';
import { 
  ReceiptEntry, 
  BudgetCategory, 
  TimeRange, 
  CURRENCIES, 
} from './types';

type ViewState = 'dashboard' | 'privacy';

function App() {
  // State
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [transactions, setTransactions] = useState<ReceiptEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('Month');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  
  // Form State
  const [formData, setFormData] = useState({
    merchant: '',
    amount: '',
    category: BudgetCategory.Food,
    date: new Date().toISOString().split('T')[0]
  });

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('snapshot_budgeter_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTransactions(parsed);
        // Detect initial currency if data exists, otherwise keep default
        if (parsed.length > 0) {
            const counts: Record<string, number> = {};
            parsed.forEach((t: ReceiptEntry) => { counts[t.currency] = (counts[t.currency] || 0) + 1 });
            const mostFrequent = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
            setSelectedCurrency(mostFrequent);
        }
      } catch (e) {
        console.error("Failed to parse local data", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('snapshot_budgeter_data', JSON.stringify(transactions));
  }, [transactions]);

  // Derived State: Filtered Transactions
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    // 1. Filter by Currency
    let filtered = transactions.filter(t => t.currency === selectedCurrency);
    
    // 2. Filter by Time
    filtered = filtered.filter(t => {
      const tDate = new Date(t.date);
      const diffTime = Math.abs(now.getTime() - tDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      switch(timeRange) {
        case 'Week': return diffDays <= 7;
        case 'Month': return diffDays <= 30;
        case 'Quarter': return diffDays <= 90;
        case 'Year': return diffDays <= 365;
        case 'All': return true;
        default: return true;
      }
    });

    return filtered;
  }, [transactions, timeRange, selectedCurrency]);

  // Stats Calculations
  const totalSpent = filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const avgTransaction = filteredTransactions.length > 0 ? totalSpent / filteredTransactions.length : 0;
  
  // Chart Data Preparation
  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredTransactions.forEach(t => {
      grouped[t.category] = (grouped[t.category] || 0) + t.amount;
    });
    return Object.entries(grouped).map(([category, amount]) => ({
      category,
      amount
    })).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Handlers
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.merchant || !formData.amount) return;

    const newTransaction: ReceiptEntry = {
      id: crypto.randomUUID(),
      merchant: formData.merchant,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      currency: selectedCurrency, 
      timestamp: new Date(formData.date).getTime()
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    // Reset Form
    setFormData({
      merchant: '',
      amount: '',
      category: BudgetCategory.Food,
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Merchant', 'Category', 'Amount', 'Currency'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => 
        [t.date, `"${t.merchant}"`, `"${t.category}"`, t.amount, t.currency].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `budget_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navigateToPrivacy = () => {
    setCurrentView('privacy');
    window.scrollTo(0, 0);
  };

  const navigateToDashboard = () => {
    setCurrentView('dashboard');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={navigateToDashboard}
          >
            <div className="bg-indigo-600 p-2 rounded-xl text-white transition-transform group-hover:scale-105">
              <Wallet size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Snapshot<span className="text-indigo-600">Budgeter</span></h1>
          </div>
          
          <div className="flex items-center gap-2">
            {currentView === 'dashboard' ? (
              <>
                <button 
                  onClick={navigateToPrivacy}
                  className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors"
                  title="Privacy Policy"
                >
                  <ShieldCheck size={20} />
                </button>
                <button 
                  onClick={handleExportCSV}
                  className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors"
                  title="Export CSV"
                >
                  <Download size={20} />
                </button>
              </>
            ) : (
              <button 
                onClick={navigateToDashboard}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Budget
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {currentView === 'dashboard' ? (
          <>
            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex">
                {(['Week', 'Month', 'Quarter', 'Year', 'All'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      timeRange === range 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>

              {/* Main Currency Selection */}
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar max-w-full">
                 <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Currency</span>
                 <div className="flex gap-1">
                    {CURRENCIES.map(curr => (
                        <button
                          key={curr}
                          onClick={() => setSelectedCurrency(curr)}
                          className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                              selectedCurrency === curr 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                            {curr}
                        </button>
                    ))}
                 </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <StatsCard 
                title="Total Spent" 
                value={`${selectedCurrency} ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                icon={Wallet} 
                colorClass="bg-indigo-500 text-indigo-500" 
              />
              <StatsCard 
                title="Transactions" 
                value={filteredTransactions.length.toString()} 
                icon={CreditCard} 
                colorClass="bg-emerald-500 text-emerald-500" 
              />
              <StatsCard 
                title="Avg. Transaction" 
                value={`${selectedCurrency} ${avgTransaction.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
                icon={TrendingUp} 
                colorClass="bg-orange-500 text-orange-500" 
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Filter size={18} className="text-slate-400" />
                        Spending by Category
                    </h3>
                    <ExpenseChart data={chartData} currency={selectedCurrency} />
                </div>

                {/* List Section */}
                <div className="lg:col-span-1">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">Recent Transactions</h3>
                    <TransactionList 
                        transactions={filteredTransactions} 
                        onDelete={handleDelete} 
                        currency={selectedCurrency}
                    />
                </div>
            </div>
          </>
        ) : (
          <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
             <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Privacy Policy</h2>
                    <p className="text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
             </div>

             <div className="prose prose-slate max-w-none space-y-8">
                <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">1. Overview</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Snapshot Budgeter is built on a "Privacy-First" and "Offline-Only" architecture. We believe that your financial data belongs to you alone. This policy details how our application handles your information.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">2. Data Collection & Storage</h3>
                    <p className="text-slate-600 leading-relaxed">
                        We do not operate a backend server or database. All data you enter into Snapshot Budgeter (transactions, categories, amounts) is stored strictly within your device's browser utilizing the <code>localStorage</code> API.
                    </p>
                    <ul className="list-disc pl-5 mt-4 space-y-2 text-slate-600">
                        <li><strong>No Server Uploads:</strong> Your data never leaves your device.</li>
                        <li><strong>No Tracking Cookies:</strong> We do not use cookies for tracking or analytics.</li>
                        <li><strong>No Account Required:</strong> The app functions entirely without user accounts or login credentials.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">3. Data Usage</h3>
                    <p className="text-slate-600 leading-relaxed">
                        The data you input is processed locally in real-time to generate the visualizations, charts, and summaries displayed on your dashboard. This processing happens entirely within your web browser's memory.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">4. Third-Party Sharing</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Since we do not collect your data, it is impossible for us to share, sell, or disclose it to third parties. We do not integrate with third-party analytics services or advertising networks.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">5. User Control & Deletion</h3>
                    <p className="text-slate-600 leading-relaxed">
                        You retain full ownership of your data. You may:
                    </p>
                    <ul className="list-disc pl-5 mt-4 space-y-2 text-slate-600">
                        <li>Delete individual transaction entries via the application interface.</li>
                        <li>Clear all application data by clearing your browser's "Local Storage" or site data.</li>
                        <li>Export your data to CSV format for your own records.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">6. Contact Us</h3>
                    <p className="text-slate-600 leading-relaxed">
                        If you have questions about the privacy architecture of this open-source application, please review the source code or contact the repository maintainer.
                    </p>
                    <p className="text-slate-600 leading-relaxed mt-4">
                        For your reference, a <a href="privacy.html" target="_blank" className="text-indigo-600 font-medium hover:underline">standalone version of this Privacy Policy</a> is available for review.
                    </p>
                </section>
             </div>
             
             <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
                <button 
                  onClick={navigateToDashboard}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-100"
                >
                  Return to Dashboard
                </button>
             </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} Snapshot Budgeter. Offline & Secure.</p>
          <button 
            onClick={navigateToPrivacy}
            className="mt-2 text-slate-500 hover:text-indigo-600 transition-colors underline decoration-slate-300 hover:decoration-indigo-600 underline-offset-4"
          >
            Privacy Policy
          </button>
      </footer>

      {/* FAB - Only show on dashboard */}
      {currentView === 'dashboard' && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 bg-slate-900 hover:bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-110 z-30"
          aria-label="Add Transaction"
        >
          <Plus size={28} />
        </button>
      )}

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Add Expense</h2>
            <p className="text-slate-500 text-sm mb-6">Adding transaction in <span className="font-bold text-indigo-600">{selectedCurrency}</span></p>
            
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Merchant</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  placeholder="e.g. Starbucks, Uber"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  value={formData.merchant}
                  onChange={e => setFormData({...formData, merchant: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Amount ({selectedCurrency})</label>
                   <input 
                    required
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                   />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white text-sm"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value as BudgetCategory})}
                    >
                        {Object.values(BudgetCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input 
                    required
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-900 text-white font-semibold py-4 rounded-xl hover:bg-indigo-600 transition-colors mt-4 shadow-lg shadow-indigo-200"
              >
                Save Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;