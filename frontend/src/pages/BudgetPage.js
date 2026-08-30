import React, { useState } from 'react';
import BudgetPredictor from '../components/BudgetPredictor';
import BudgetOverview from '../components/BudgetOverview';

export default function BudgetPage() {
  const now = new Date();
  const [month] = useState(now.getMonth());
  const [year] = useState(now.getFullYear());
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <h1>Dashboard — {now.toLocaleString('default', { month: 'long' })} {year}</h1><br />
      
      <BudgetPredictor
        month={month}
        year={year}
        refreshKey={refreshKey}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
      <BudgetOverview month={month} year={year} refreshKey={refreshKey} />
    </div>
  );
}