// Translator functionality
function setupTranslator() {
  const sourceLanguageSelect = document.getElementById('sourceLanguage');
  const targetLanguageSelect = document.getElementById('targetLanguage');
  const swapLanguagesBtn = document.getElementById('swapLanguages');
  const sourceTextArea = document.getElementById('sourceText');
  const translatedTextArea = document.getElementById('translatedText');
  const translateBtn = document.getElementById('translateBtn');
  const clearSourceBtn = document.getElementById('clearSource');
  const sourceSpeechBtn = document.getElementById('sourceSpeech');
  const targetSpeechBtn = document.getElementById('targetSpeech');
  const saveWordBtn = document.getElementById('saveWord');
  
  // Swap languages
  swapLanguagesBtn.addEventListener('click', () => {
    const sourceValue = sourceLanguageSelect.value;
    const targetValue = targetLanguageSelect.value;
    
    sourceLanguageSelect.value = targetValue;
    targetLanguageSelect.value = sourceValue;
    
    // If there's text, swap it too
    if (sourceTextArea.value || translatedTextArea.value) {
      const sourceText = sourceTextArea.value;
      sourceTextArea.value = translatedTextArea.value;
      translatedTextArea.value = sourceText;
    }
  });
  
  // Translate text
  translateBtn.addEventListener('click', () => {
    const sourceText = sourceTextArea.value.trim();
    
    if (!sourceText) {
      alert('Please enter text to translate');
      return;
    }
    
    // Show loading state
    translatedTextArea.value = 'Translating...';
    translateBtn.disabled = true;
    
    // Call translation API
    translateText(
      sourceText,
      sourceLanguageSelect.value,
      targetLanguageSelect.value
    )
      .then(translatedText => {
        translatedTextArea.value = translatedText;
      })
      .catch(error => {
        console.error('Translation error:', error);
        translatedTextArea.value = 'Translation failed. Please try again.';
      })
      .finally(() => {
        translateBtn.disabled = false;
      });
  });
  
  // Clear source text
  clearSourceBtn.addEventListener('click', () => {
    sourceTextArea.value = '';
    translatedTextArea.value = '';
  });
  
  // Text-to-speech for source text
  sourceSpeechBtn.addEventListener('click', () => {
    const text = sourceTextArea.value.trim();
    
    if (!text) {
      alert('Please enter text to speak');
      return;
    }
    
    // Get language code for speech synthesis
    const languageCode = getLanguageCodeForSpeech(sourceLanguageSelect.value);
    
    // Call text-to-speech API
    textToSpeech(text, languageCode)
      .then(audioContent => {
        playAudio(audioContent);
      })
      .catch(error => {
        console.error('Text-to-speech error:', error);
        alert('Failed to generate speech. Please try again.');
      });
  });
  
  // Text-to-speech for translated text
  targetSpeechBtn.addEventListener('click', () => {
    const text = translatedTextArea.value.trim();
    
    if (!text) {
      alert('Please translate text first');
      return;
    }
    
    // Get language code for speech synthesis
    const languageCode = getLanguageCodeForSpeech(targetLanguageSelect.value);
    
    // Call text-to-speech API
    textToSpeech(text, languageCode)
      .then(audioContent => {
        playAudio(audioContent);
      })
      .catch(error => {
        console.error('Text-to-speech error:', error);
        alert('Failed to generate speech. Please try again.');
      });
  });
  
  // Save word/phrase to vocabulary
  saveWordBtn.addEventListener('click', () => {
    const sourceText = sourceTextArea.value.trim();
    const translatedText = translatedTextArea.value.trim();
    
    if (!sourceText || !translatedText) {
      alert('Please translate text before saving to vocabulary');
      return;
    }
    
    // Get the language names for display
    const sourceLanguageName = getLanguageName(sourceLanguageSelect.value);
    const targetLanguageName = getLanguageName(targetLanguageSelect.value);
    
    // Create vocabulary item
    const vocabItem = {
      sourceText,
      translatedText,
      sourceLanguage: sourceLanguageSelect.value,
      targetLanguage: targetLanguageSelect.value,
      sourceLanguageName,
      targetLanguageName,
      dateAdded: new Date().toISOString()
    };
    
    // Add to vocabulary
    addToVocabulary(vocabItem);
    
    alert('Added to your vocabulary!');
  });
}

// API call to translate text
async function translateText(text, sourceLanguage, targetLanguage) {
  // In a real application, this would call your backend API
  // For development purposes, we'll use a simulated API response
  
  try {
    // Uncomment this in a real application
    /*
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        sourceLanguage,
        targetLanguage
      })
    });
    
    if (!response.ok) {
      throw new Error('Translation request failed');
    }
    
    const data = await response.json();
    return data.translatedText;
    */
    
    // For development, simulate a delayed response
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple simulation of translation (not accurate)
        const translations = {
          'en-es': {
            'hello': 'hola',
            'world': 'mundo',
            'how are you': 'cómo estás',
            'goodbye': 'adiós',
            'thank you': 'gracias',
            'please': 'por favor',
            'yes': 'sí',
            'no': 'no',
            'sorry': 'lo siento',
            'help': 'ayuda'
          },
          'en-fr': {
            'hello': 'bonjour',
            'world': 'monde',
            'how are you': 'comment allez-vous',
            'goodbye': 'au revoir',
            'thank you': 'merci',
            'please': 's\'il vous plaît',
            'yes': 'oui',
            'no': 'non',
            'sorry': 'désolé',
            'help': 'aide'
          }
        };
        
        const key = `${sourceLanguage}-${targetLanguage}`;
        const reverseKey = `${targetLanguage}-${sourceLanguage}`;
        
        if (translations[key] && translations[key][text.toLowerCase()]) {
          resolve(translations[key][text.toLowerCase()]);
        } else if (translations[reverseKey]) {
          // Check if it's a reverse translation
          const reverseTranslation = Object.entries(translations[reverseKey])
            .find(([_, value]) => value.toLowerCase() === text.toLowerCase());
          
          if (reverseTranslation) {
            resolve(reverseTranslation[0]);
          } else {
            resolve(`[Translated: ${text}]`);
          }
        } else {
          resolve(`[Translated: ${text}]`);
        }
      }, 1000);
    });
    
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate text');
  }
}

// Helper function to get language code for speech synthesis
function getLanguageCodeForSpeech(languageCode) {
  // Map language codes to speech synthesis language codes
  const speechLanguageCodes = {
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'it': 'it-IT',
    'ja': 'ja-JP',
    'zh': 'zh-CN',
    'ru': 'ru-RU',
    'ar': 'ar-SA',
    'hi': 'hi-IN'
  };
  
  return speechLanguageCodes[languageCode] || 'en-US';
}

// Helper function to get language name
function getLanguageName(languageCode) {
  const languages = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'ja': 'Japanese',
    'zh': 'Chinese',
    'ru': 'Russian',
    'ar': 'Arabic',
    'hi': 'Hindi'
  };
  
  return languages[languageCode] || languageCode;
}
