import React, { useState } from 'react';
import './SuggestionPanel.css';

function SuggestionPanel({ suggestion, allSuggestions }) {
  const [showHistory, setShowHistory] = useState(false);

  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#ef4444',
      high: '#f59e0b',
      medium: '#3b82f6',
      low: '#6b7280'
    };
    return colors[priority] || colors.low;
  };

  const getTypeIcon = (type) => {
    const icons = {
      counter: '🛡️',
      question: '❓',
      warning: '⚠️',
      opportunity: '✨',
      close: '🎯'
    };
    return icons[type] || '💡';
  };

  if (!suggestion && allSuggestions.length === 0) {
    return (
      <div className="suggestion-panel">
        <h3>AI Suggestions</h3>
        <div className="empty-suggestions">
          <p>AI will provide tactical suggestions in real-time during the negotiation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="suggestion-panel">
      <div className="panel-header">
        <h3>AI Suggestions</h3>
        {allSuggestions.length > 1 && (
          <button
            className="history-toggle"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Latest' : `History (${allSuggestions.length})`}
          </button>
        )}
      </div>

      {!showHistory && suggestion ? (
        <div className="current-suggestion">
          <div
            className="suggestion-priority"
            style={{ background: getPriorityColor(suggestion.priority) }}
          >
            {suggestion.priority.toUpperCase()}
          </div>

          <div className="suggestion-content">
            <div className="suggestion-type">
              <span className="type-icon">{getTypeIcon(suggestion.type)}</span>
              <span className="type-label">{suggestion.type}</span>
            </div>

            <div className="suggestion-text">
              {suggestion.text}
            </div>

            <div className="suggestion-reasoning">
              <strong>Why:</strong> {suggestion.reasoning}
            </div>

            <div className="suggestion-footer">
              <div className="confidence">
                <span>Confidence:</span>
                <div className="confidence-bar">
                  <div
                    className="confidence-fill"
                    style={{ width: `${suggestion.confidence * 100}%` }}
                  />
                </div>
                <span>{Math.round(suggestion.confidence * 100)}%</span>
              </div>

              {suggestion.auto_pilot_available && (
                <div className="auto-pilot-badge">
                  🤖 Auto-Pilot Available
                </div>
              )}
            </div>

            {suggestion.voice_script && (
              <div className="voice-script">
                <strong>Script:</strong>
                <p>{suggestion.voice_script}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="suggestion-history">
          {allSuggestions.map((item, idx) => (
            <div key={idx} className="history-item">
              <div className="history-header">
                <span className="type-icon">{getTypeIcon(item.type)}</span>
                <span className="type-label">{item.type}</span>
                <span
                  className="priority-badge"
                  style={{ background: getPriorityColor(item.priority) }}
                >
                  {item.priority}
                </span>
              </div>
              <div className="history-text">{item.text}</div>
              <div className="history-time">
                {new Date(item.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SuggestionPanel;
