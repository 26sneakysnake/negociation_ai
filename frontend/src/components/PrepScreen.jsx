import React, { useState } from 'react';
import { uploadContext, processVoiceBrief } from '../services/api';
import './PrepScreen.css';

function PrepScreen({ onReady }) {
  const [step, setStep] = useState(1); // 1: context, 2: brief, 3: strategy
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form data
  const [contextFile, setContextFile] = useState(null);
  const [formData, setFormData] = useState({
    target_outcome: '',
    minimum_acceptable: '',
    red_lines: '',
    batna: '',
    initial_position: '',
    counterparty_info: ''
  });

  const [analysis, setAnalysis] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setContextFile(file);
    setLoading(true);
    setError(null);

    try {
      const result = await uploadContext(file);
      setSessionId(result.session_id);
      setStep(2);
    } catch (err) {
      setError('Failed to upload context: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitBrief = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Process red lines as array
      const redLines = formData.red_lines
        .split('\n')
        .map(line => line.trim())
        .filter(line => line);

      const context = {
        target_outcome: formData.target_outcome,
        minimum_acceptable: formData.minimum_acceptable,
        red_lines: redLines,
        batna: formData.batna,
        initial_position: formData.initial_position,
        counterparty_info: {
          notes: formData.counterparty_info
        },
        expected_tactics: [],
        relevant_patterns: [],
        prepared_responses: {}
      };

      const result = await processVoiceBrief(sessionId, context);
      setAnalysis(result.analysis);
      setStep(3);
    } catch (err) {
      setError('Failed to process brief: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLive = () => {
    onReady({
      sessionId,
      context: formData,
      analysis
    });
  };

  return (
    <div className="prep-screen">
      <div className="prep-container">
        <div className="prep-steps">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Upload Context</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Strategy Brief</span>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Review & Start</span>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Step 1: Upload Context */}
        {step === 1 && (
          <div className="step-content">
            <h2>Upload Negotiation Context</h2>
            <p className="step-description">
              Upload relevant documents (contract, proposal, background info)
            </p>

            <div className="upload-area">
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                disabled={loading}
              />
              <label htmlFor="file-upload" className="upload-label">
                <div className="upload-icon">📄</div>
                <div className="upload-text">
                  {contextFile ? contextFile.name : 'Click to upload or drag & drop'}
                </div>
                <div className="upload-hint">PDF, DOC, DOCX, TXT</div>
              </label>
            </div>

            {loading && <div className="loading">Processing document...</div>}

            <button
              className="btn btn-secondary"
              onClick={() => setStep(2)}
              disabled={loading}
            >
              Skip (Optional)
            </button>
          </div>
        )}

        {/* Step 2: Strategy Brief */}
        {step === 2 && (
          <div className="step-content">
            <h2>Define Your Strategy</h2>
            <p className="step-description">
              Set your objectives, limits, and alternative options
            </p>

            <form onSubmit={handleSubmitBrief} className="strategy-form">
              <div className="form-group">
                <label htmlFor="target_outcome">Target Outcome *</label>
                <input
                  type="text"
                  id="target_outcome"
                  name="target_outcome"
                  className="input-field"
                  placeholder="e.g., 50K ARR annual contract"
                  value={formData.target_outcome}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="minimum_acceptable">Minimum Acceptable *</label>
                <input
                  type="text"
                  id="minimum_acceptable"
                  name="minimum_acceptable"
                  className="input-field"
                  placeholder="e.g., 35K ARR minimum"
                  value={formData.minimum_acceptable}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="batna">BATNA (Best Alternative) *</label>
                <input
                  type="text"
                  id="batna"
                  name="batna"
                  className="input-field"
                  placeholder="e.g., Walk away and pursue competitor deal"
                  value={formData.batna}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="red_lines">Red Lines (one per line)</label>
                <textarea
                  id="red_lines"
                  name="red_lines"
                  className="input-field"
                  placeholder="e.g.,&#10;No payment terms beyond 60 days&#10;No exclusivity clause&#10;Minimum 20% margin"
                  value={formData.red_lines}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label htmlFor="initial_position">Initial Position</label>
                <input
                  type="text"
                  id="initial_position"
                  name="initial_position"
                  className="input-field"
                  placeholder="e.g., Starting ask at 60K ARR"
                  value={formData.initial_position}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="counterparty_info">Counterparty Info</label>
                <textarea
                  id="counterparty_info"
                  name="counterparty_info"
                  className="input-field"
                  placeholder="What do you know about them? Budget constraints, priorities, etc."
                  value={formData.counterparty_info}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Analyzing...' : 'Analyze Strategy'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Review & Start */}
        {step === 3 && analysis && (
          <div className="step-content">
            <h2>Strategy Analysis</h2>
            <p className="step-description">
              AI has analyzed your strategy. Review the feedback before starting.
            </p>

            <div className="analysis-results">
              <div className="analysis-section">
                <h3>✅ Strengths</h3>
                <ul>
                  {analysis.strengths?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="analysis-section">
                <h3>⚠️ Weaknesses</h3>
                <ul>
                  {analysis.weaknesses?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="analysis-section">
                <h3>💡 Improvements</h3>
                <ul>
                  {analysis.improvements?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="analysis-section">
                <h3>❓ Challenge Questions</h3>
                <ul>
                  {analysis.challenge_questions?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="form-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setStep(2)}
              >
                Revise Strategy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleStartLive}
              >
                Start Live Session 🎯
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PrepScreen;
