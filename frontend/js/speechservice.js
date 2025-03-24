// Text-to-speech functionality

// API call to convert text to speech
async function textToSpeech(text, languageCode = 'en-US') {
  try {
    // First try to use the Google Cloud API
    const response = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        languageCode
      })
    });
    
    if (!response.ok) {
      throw new Error('Text-to-speech request failed');
    }
    
    const data = await response.json();
    return data.audioContent; // Base64 encoded audio
  } catch (apiError) {
    console.warn('API text-to-speech failed, falling back to browser synthesis:', apiError);
    
    // Fallback to browser's speech synthesis if API fails
    return new Promise((resolve, reject) => {
      // Check if speech synthesis is supported
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported in this browser'));
        return;
      }
      
      // Stop any ongoing speech
      speechSynthesis.cancel();
      
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language
      utterance.lang = languageCode;
      
      // Handle completion/error
      utterance.onend = () => resolve('browser-speech-synthesis');
      utterance.onerror = (err) => reject(new Error(`Speech synthesis error: ${err.message}`));
      
      // Speak
      speechSynthesis.speak(utterance);
    });
  }
}

// Play audio from base64 encoded content
function playAudio(audioContent) {
  // If using browser's speech synthesis, no need to do anything
  if (audioContent === 'browser-speech-synthesis') {
    return;
  }
  
  // For API implementation
  const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
  audio.play().catch(err => {
    console.error('Error playing audio:', err);
    
    // Fallback to alert
    alert('Could not play audio. Your browser may not support this feature.');
  });
}