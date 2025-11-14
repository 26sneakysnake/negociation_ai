import React, { useState } from 'react';
import PrepScreen from './components/PrepScreen';
import LiveScreen from './components/LiveScreen';
import './App.css';

function App() {
  const [mode, setMode] = useState('prep'); // 'prep' or 'live'
  const [sessionId, setSessionId] = useState(null);
  const [context, setContext] = useState(null);

  const handleStartLive = (sessionData) => {
    setSessionId(sessionData.sessionId);
    setContext(sessionData.context);
    setMode('live');
  };

  const handleBackToPrep = () => {
    setMode('prep');
    setSessionId(null);
    setContext(null);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎯 NegotiAI Coach</h1>
        <p className="tagline">AI-Powered Real-Time Negotiation Assistant</p>
      </header>

      <main className="app-main">
        {mode === 'prep' ? (
          <PrepScreen onReady={handleStartLive} />
        ) : (
          <LiveScreen
            sessionId={sessionId}
            context={context}
            onBack={handleBackToPrep}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Hackathon Pioneers AI Lab @StationF | Powered by ElevenLabs, Mistral AI, Qdrant</p>
      </footer>
    </div>
  );
}

export default App;
