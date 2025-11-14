import React, { useState, useEffect, useRef } from 'react';
import WebSocketService from '../services/WebSocketService';
import AudioCapture from '../services/AudioCapture';
import SuggestionPanel from './SuggestionPanel';
import AutoPilotToggle from './AutoPilotToggle';
import './LiveScreen.css';

function LiveScreen({ sessionId, context, onBack }) {
  const [isRecording, setIsRecording] = useState(false);
  const [autoPilot, setAutoPilot] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [status, setStatus] = useState('Connecting...');
  const [isConnected, setIsConnected] = useState(false);

  const audioCapture = useRef(new AudioCapture());

  useEffect(() => {
    // Connect WebSocket
    WebSocketService.connect(sessionId);

    // Setup event handlers
    WebSocketService.on('connect', () => {
      setIsConnected(true);
      setStatus('Connected');
    });

    WebSocketService.on('disconnect', () => {
      setIsConnected(false);
      setStatus('Disconnected');
    });

    WebSocketService.on('status', (data) => {
      setStatus(data.message);
    });

    WebSocketService.on('suggestion', (data) => {
      setSuggestions(prev => [data, ...prev.slice(0, 9)]); // Keep last 10
    });

    WebSocketService.on('transcript', (data) => {
      setTranscripts(prev => [...prev, data]);
    });

    WebSocketService.on('autoPilot', (data) => {
      console.log('Auto-pilot response:', data);
      // Handle auto-pilot audio playback here
    });

    // Cleanup
    return () => {
      handleStopRecording();
      WebSocketService.disconnect();
    };
  }, [sessionId]);

  const handleStartRecording = async () => {
    try {
      await audioCapture.current.start((audioChunk) => {
        // Send audio chunk to backend
        WebSocketService.sendAudio(audioChunk);
      });

      setIsRecording(true);
      setStatus('Recording...');
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const handleStopRecording = () => {
    audioCapture.current.stop();
    setIsRecording(false);
    setStatus('Stopped');
  };

  const handleToggleAutoPilot = () => {
    const newState = !autoPilot;
    setAutoPilot(newState);

    if (newState) {
      WebSocketService.activateAutoPilot({
        boundaries: {
          red_lines: context?.red_lines || []
        },
        voice_profile: 'default'
      });
    } else {
      WebSocketService.deactivateAutoPilot();
    }
  };

  const getLatestSuggestion = () => {
    return suggestions.length > 0 ? suggestions[0] : null;
  };

  return (
    <div className="live-screen">
      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-left">
          <div className={`recording-indicator ${isRecording ? 'active' : ''}`}>
            {isRecording ? '🔴 LIVE' : '⚫ Ready'}
          </div>
          <div className="connection-status">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
            {status}
          </div>
        </div>

        <div className="status-right">
          <AutoPilotToggle
            active={autoPilot}
            onToggle={handleToggleAutoPilot}
            disabled={!isConnected}
          />
          <button
            className="btn btn-secondary"
            onClick={onBack}
          >
            ← Back to Prep
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="live-content">
        {/* Left Panel: Transcript */}
        <div className="transcript-panel">
          <h3>Conversation</h3>
          <div className="transcript-list">
            {transcripts.length === 0 ? (
              <div className="empty-state">
                <p>Start recording to see the conversation transcript...</p>
              </div>
            ) : (
              transcripts.map((item, idx) => (
                <div key={idx} className={`transcript-item ${item.speaker}`}>
                  <div className="transcript-header">
                    <span className="speaker">
                      {item.speaker === 'user' ? 'You' : 'Counterparty'}
                    </span>
                    <span className="timestamp">
                      {new Date(item.timestamp * 1000).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="transcript-text">{item.transcript}</div>
                  <div className="transcript-meta">
                    <span className="emotion">{item.emotion}</span>
                    {item.hesitation_markers?.length > 0 && (
                      <span className="hesitation">
                        Hesitation: {item.hesitation_markers.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Suggestions */}
        <div className="suggestion-container">
          <SuggestionPanel
            suggestion={getLatestSuggestion()}
            allSuggestions={suggestions}
          />
        </div>
      </div>

      {/* Control Panel */}
      <div className="control-panel">
        <button
          className={`record-button ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={!isConnected}
        >
          <div className="record-button-icon">
            {isRecording ? '⏹' : '🎤'}
          </div>
          <div className="record-button-text">
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </div>
        </button>

        {context && (
          <div className="quick-ref">
            <div className="quick-ref-item">
              <strong>Target:</strong> {context.target_outcome}
            </div>
            <div className="quick-ref-item">
              <strong>Minimum:</strong> {context.minimum_acceptable}
            </div>
            <div className="quick-ref-item">
              <strong>BATNA:</strong> {context.batna}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveScreen;
