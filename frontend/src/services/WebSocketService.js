class WebSocketService {
  constructor() {
    this.ws = null;
    this.url = null;
    this.callbacks = {
      onSuggestion: null,
      onAlert: null,
      onTranscript: null,
      onStatus: null,
      onAutoPilot: null,
      onConnect: null,
      onDisconnect: null,
      onError: null
    };
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
  }

  connect(sessionId) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = process.env.REACT_APP_WS_PORT || '8000';
    this.url = `${protocol}//${host}:${port}/ws/live/${sessionId}`;

    console.log('Connecting to WebSocket:', this.url);

    try {
      this.ws = new WebSocket(this.url);
      this._setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    }
  }

  _setupEventHandlers() {
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      if (this.callbacks.onConnect) {
        this.callbacks.onConnect();
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this._handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      if (this.callbacks.onDisconnect) {
        this.callbacks.onDisconnect();
      }
      this._attemptReconnect();
    };
  }

  _handleMessage(data) {
    const { type } = data;

    switch (type) {
      case 'suggestion':
        if (this.callbacks.onSuggestion) {
          this.callbacks.onSuggestion(data.data);
        }
        break;

      case 'alert':
        if (this.callbacks.onAlert) {
          this.callbacks.onAlert(data.data);
        }
        break;

      case 'transcript':
        if (this.callbacks.onTranscript) {
          this.callbacks.onTranscript(data.data);
        }
        break;

      case 'status':
        if (this.callbacks.onStatus) {
          this.callbacks.onStatus(data.data);
        }
        break;

      case 'auto_pilot':
        if (this.callbacks.onAutoPilot) {
          this.callbacks.onAutoPilot(data.data);
        }
        break;

      default:
        console.warn('Unknown message type:', type);
    }
  }

  _attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

      setTimeout(() => {
        if (this.url) {
          this.ws = new WebSocket(this.url);
          this._setupEventHandlers();
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  sendAudio(audioBlob) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(audioBlob);
    } else {
      console.warn('WebSocket not connected');
    }
  }

  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected');
    }
  }

  activateAutoPilot(params) {
    this.sendMessage({
      type: 'auto_pilot',
      action: 'activate',
      params
    });
  }

  deactivateAutoPilot() {
    this.sendMessage({
      type: 'auto_pilot',
      action: 'deactivate'
    });
  }

  on(event, callback) {
    if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase()}${event.slice(1)}`)) {
      this.callbacks[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`] = callback;
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

export default new WebSocketService();
