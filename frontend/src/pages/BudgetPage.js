import React, { useState } from 'react';
import BudgetPredictor from '../components/BudgetPredictor';

export default function BudgetPage() {
  const now = new Date();
  const [month] = useState(now.getMonth());
  const [year] = useState(now.getFullYear());

  return (
    <div>
      <h1>Smart Budget Predictor</h1>
      <p className="subtitle">
        Set a monthly budget and see a live projection of your end-of-month spend based on your current pace.
      </p>
      <BudgetPredictor month={month} year={year} refreshKey={0} />
    </div>
  );
}
