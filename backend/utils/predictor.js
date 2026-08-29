/**
 * FEATURE 1: Smart Budget Predictor
 * Projects end-of-month spending based on the average daily spend so far,
 * and returns an alert level so the frontend can warn the user early.
 */
function predictMonthEnd({ expenses, budgetAmount, month, year }) {
  const now = new Date();
  const isCurrentMonth = now.getMonth() === month && now.getFullYear() === year;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayOfMonth = isCurrentMonth ? now.getDate() : daysInMonth;

  const spentSoFar = expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgDailySpend = dayOfMonth > 0 ? spentSoFar / dayOfMonth : 0;
  const projectedTotal = Math.round(avgDailySpend * daysInMonth * 100) / 100;

  const projectedOverBudget = budgetAmount ? projectedTotal - budgetAmount : null;
  const percentOfBudgetProjected = budgetAmount
    ? Math.round((projectedTotal / budgetAmount) * 1000) / 10
    : null;

  let alertLevel = 'none'; // none | info | warning | danger
  let message = 'No budget set for this month yet.';

  if (budgetAmount) {
    if (percentOfBudgetProjected >= 100) {
      alertLevel = 'danger';
      message = `At this pace you're projected to spend ${percentOfBudgetProjected}% of your budget — about ${Math.abs(
        projectedOverBudget
      ).toFixed(2)} over.`;
    } else if (percentOfBudgetProjected >= 85) {
      alertLevel = 'warning';
      message = `Heads up — you're on track to use ${percentOfBudgetProjected}% of your budget by month end.`;
    } else {
      alertLevel = 'info';
      message = `You're on track. Projected to use ${percentOfBudgetProjected}% of your budget.`;
    }
  }

  return {
    daysInMonth,
    dayOfMonth,
    spentSoFar: Math.round(spentSoFar * 100) / 100,
    avgDailySpend: Math.round(avgDailySpend * 100) / 100,
    projectedTotal,
    budgetAmount: budgetAmount || null,
    projectedOverBudget: projectedOverBudget !== null ? Math.round(projectedOverBudget * 100) / 100 : null,
    percentOfBudgetProjected,
    alertLevel,
    message
  };
}

module.exports = { predictMonthEnd };
