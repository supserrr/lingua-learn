// Text-to-speech functionality

// API call to convert text to speech
async function textToSpeech(text, languageCode = 'en-US') {
  // In a real application, this would call your backend API
  // For development purposes, we'll use the browser's built-in speech synthesis
  
  try {
    // Uncomment this in a real application
    /*
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
    */
    
    // For development, use browser's speech synthesis
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
      
      // Speak
      speechSynthesis.speak(utterance);
      
      // Resolve with a placeholder (since we're not returning actual audio content)
      resolve('browser-speech-synthesis');
    });
    
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw new Error('Failed to convert text to speech');
  }
}

// Play audio from base64 encoded content
function playAudio(audioContent) {
  // If using browser's speech synthesis, no need to do anything
  if (audioContent === 'browser-speech-synthesis') {
    return;
  }
  
  // For real API implementation
  const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
  audio.play();
}
