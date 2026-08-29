import React from 'react';
import SplitExpenseWidget from '../components/SplitExpense';

export default function SplitPage() {
  return (
    <div>
      <h1>Split Bills</h1>
      <p className="subtitle">Split an expense with friends or roommates and track who has settled up.</p>
      <SplitExpenseWidget />
    </div>
  );
}
