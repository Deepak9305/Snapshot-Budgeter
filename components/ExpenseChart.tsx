import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BudgetCategory, CATEGORY_COLORS } from '../types';

interface ChartData {
  category: string;
  amount: number;
}

interface ExpenseChartProps {
  data: ChartData[];
  currency: string;
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ data, currency }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400">
        <p>No data available for this period</p>
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="category" 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => value.split(' ')[0]} // Shorten labels
          />
          <YAxis 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            formatter={(value: number) => [`${currency} ${value.toLocaleString()}`, 'Spent']}
          />
          <Bar dataKey="amount" radius={[8, 8, 0, 0]} animationDuration={1000}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category as BudgetCategory] || '#64748b'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseChart;