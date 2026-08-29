import React, { useEffect, useState } from 'react';
import api from '../api/axios';

// FEATURE 3: Bill Splitting (mini-Splitwise)
export default function SplitExpenseWidget() {
  const [splits, setSplits] = useState([]);
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidBy, setPaidBy] = useState('You');
  const [participants, setParticipants] = useState([{ name: '', share: '' }]);
  const [error, setError] = useState('');

  const loadSplits = async () => {
    const { data } = await api.get('/split');
    setSplits(data);
  };

  useEffect(() => {
    loadSplits();
  }, []);

  const addParticipantRow = () => {
    setParticipants([...participants, { name: '', share: '' }]);
  };

  const updateParticipant = (idx, field, value) => {
    const next = [...participants];
    next[idx][field] = value;
    setParticipants(next);
  };

  const removeParticipant = (idx) => {
    setParticipants(participants.filter((_, i) => i !== idx));
  };

  const handleSplitEvenly = () => {
    const amount = Number(totalAmount);
    if (!amount || !participants.length) return;
    const share = Math.round((amount / participants.length) * 100) / 100;
    setParticipants(participants.map((p) => ({ ...p, share: String(share) })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/split', {
        title,
        totalAmount: Number(totalAmount),
        paidBy,
        participants: participants.map((p) => ({ ...p, share: Number(p.share) }))
      });
      setTitle('');
      setTotalAmount('');
      setPaidBy('You');
      setParticipants([{ name: '', share: '' }]);
      loadSplits();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create split');
    }
  };

  const toggleSettled = async (splitId, idx) => {
    await api.patch(`/split/${splitId}/settle/${idx}`);
    loadSplits();
  };

  const handleDelete = async (id) => {
    await api.delete(`/split/${id}`);
    loadSplits();
  };

  return (
    <div>
      <form className="card" onSubmit={handleSubmit}>
        <h3>Split a Bill</h3>
        {error && <p className="error">{error}</p>}
        <div className="form-row">
          <input
            type="text"
            placeholder="What's this for? (e.g. Dinner)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Total amount"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            step="0.01"
            required
          />
          <input
            type="text"
            placeholder="Paid by"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
          />
        </div>

        <h4>Participants</h4>
        {participants.map((p, idx) => (
          <div className="form-row" key={idx}>
            <input
              type="text"
              placeholder="Name"
              value={p.name}
              onChange={(e) => updateParticipant(idx, 'name', e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Share amount"
              value={p.share}
              onChange={(e) => updateParticipant(idx, 'share', e.target.value)}
              step="0.01"
              required
            />
            {participants.length > 1 && (
              <button type="button" className="link-btn" onClick={() => removeParticipant(idx)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <div className="form-row">
          <button type="button" onClick={addParticipantRow}>
            + Add Participant
          </button>
          <button type="button" onClick={handleSplitEvenly}>
            Split Evenly
          </button>
        </div>
        <button type="submit">Create Split</button>
      </form>

      <div className="card">
        <h3>Your Splits</h3>
        {!splits.length && <p>No split bills yet.</p>}
        {splits.map((split) => (
          <div key={split._id} className="split-item">
            <div className="split-header">
              <strong>{split.title}</strong> — ${split.totalAmount.toFixed(2)} (paid by {split.paidBy})
              <button className="link-btn" onClick={() => handleDelete(split._id)}>
                Delete
              </button>
            </div>
            <ul className="split-participants">
              {split.participants.map((p, idx) => (
                <li key={idx} className={p.settled ? 'settled' : ''}>
                  {p.name}: ${p.share.toFixed(2)}{' '}
                  <button className="link-btn" onClick={() => toggleSettled(split._id, idx)}>
                    {p.settled ? 'Settled ✓' : 'Mark Settled'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
