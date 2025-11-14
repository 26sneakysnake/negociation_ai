import React from 'react';
import './AutoPilotToggle.css';

function AutoPilotToggle({ active, onToggle, disabled }) {
  return (
    <div className="autopilot-toggle">
      <label className="toggle-container">
        <input
          type="checkbox"
          checked={active}
          onChange={onToggle}
          disabled={disabled}
        />
        <span className="toggle-slider"></span>
      </label>
      <div className="toggle-label">
        <span className="toggle-icon">🤖</span>
        <span className="toggle-text">
          Auto-Pilot {active ? 'ON' : 'OFF'}
        </span>
      </div>
      {active && (
        <div className="autopilot-status">
          AI can respond automatically
        </div>
      )}
    </div>
  );
}

export default AutoPilotToggle;
