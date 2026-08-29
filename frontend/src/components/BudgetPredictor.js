import React, { useEffect, useState } from 'react';
import api from '../api/axios';

// FEATURE 1: Smart Budget Predictor
export default function BudgetPredictor({ month, year, refreshKey, onSaved }) {
  const [budgetInput, setBudgetInput] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadPrediction = async () => {
    const { data } = await api.get('/budget/predict', { params: { month, year } });
    setPrediction(data);
  };

  const loadBudget = async () => {
    const { data } = await api.get('/budget', { params: { month, year } });
    if (data) setBudgetInput(String(data.amount));
  };

  useEffect(() => {
    loadBudget();
    loadPrediction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, refreshKey]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/budget', { month, year, amount: Number(budgetInput) });
      await loadPrediction();
      if (onSaved) onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h3>Smart Budget Predictor</h3>
      <form className="form-row" onSubmit={handleSaveBudget}>
        <input
          type="number"
          placeholder="Set monthly budget"
          value={budgetInput}
          onChange={(e) => setBudgetInput(e.target.value)}
          step="0.01"
          required
        />
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Budget'}
        </button>
      </form>

      {prediction && (
        <div className={`alert alert-${prediction.alertLevel}`}>
          <p className="alert-message">{prediction.message}</p>
          <div className="prediction-stats">
            <div>
              <strong>₹{prediction.spentSoFar.toFixed(2)}</strong>
              <span>Spent so far</span>
            </div>
            <div>
              <strong>₹{prediction.avgDailySpend.toFixed(2)}</strong>
              <span>Avg / day</span>
            </div>
            <div>
              <strong>₹{prediction.projectedTotal.toFixed(2)}</strong>
              <span>Projected month total</span>
            </div>
            {prediction.budgetAmount && (
              <div>
                <strong>{prediction.percentOfBudgetProjected}%</strong>
                <span>Of budget projected</span>
              </div>
            )}
          </div>
          {prediction.budgetAmount && (
            <div className="progress-bar-outer">
              <div
                className={`progress-bar-inner bar-${prediction.alertLevel}`}
                style={{ width: `${Math.min(prediction.percentOfBudgetProjected, 100)}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}