class AudioCapture {
  constructor() {
    this.mediaRecorder = null;
    this.audioStream = null;
    this.isRecording = false;
    this.onAudioChunk = null;
    this.chunkInterval = 250; // milliseconds
  }

  async start(onAudioChunk) {
    try {
      this.onAudioChunk = onAudioChunk;

      // Request microphone access
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      // Create MediaRecorder
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      };

      this.mediaRecorder = new MediaRecorder(this.audioStream, options);

      // Handle data available
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.onAudioChunk) {
          this.onAudioChunk(event.data);
        }
      };

      // Handle errors
      this.mediaRecorder.onerror = (error) => {
        console.error('MediaRecorder error:', error);
      };

      // Start recording with time slicing
      this.mediaRecorder.start(this.chunkInterval);
      this.isRecording = true;

      console.log('Audio capture started');
      return true;

    } catch (error) {
      console.error('Error starting audio capture:', error);
      throw error;
    }
  }

  stop() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }

    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }

    console.log('Audio capture stopped');
  }

  pause() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.pause();
    }
  }

  resume() {
    if (this.mediaRecorder && !this.isRecording) {
      this.mediaRecorder.resume();
    }
  }

  getRecordingState() {
    return this.isRecording;
  }
}

export default AudioCapture;
