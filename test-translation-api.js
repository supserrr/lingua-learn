// test-translation-api.js
// This script tests the RapidAPI Translation service

const fetch = require('node-fetch');
require('dotenv').config();

const testTranslationAPI = async () => {
  console.log('Testing Translation API...');
  
  const url = 'https://deep-translate1.p.rapidapi.com/language/translate/v2';
  
  // Test phrases in different languages
  const testPhrases = [
    { text: 'Hello, how are you?', source: 'en', target: 'es', expected: 'Hola, ¿cómo estás?' },
    { text: 'I love learning languages', source: 'en', target: 'fr', expected: 'J\'aime apprendre les langues' },
    { text: 'Buenos días', source: 'es', target: 'en', expected: 'Good morning' }
  ];
  
  // Get API key from environment or use default
  const apiKey = process.env.RAPIDAPI_KEY || '1bac348c61msh514a66a69096841p154653jsn03abaa71adb2';
  
  for (const test of testPhrases) {
    try {
      console.log(`\nTranslating: "${test.text}" from ${test.source} to ${test.target}`);
      
      const options = {
        method: 'POST',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'deep-translate1.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: test.text,
          source: test.source,
          target: test.target
        })
      };
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Extract translated text
      const translatedText = result.data?.translations?.translatedText;
      
      if (translatedText) {
        console.log(`Translation result: "${translatedText}"`);
        console.log(`Expected: "${test.expected}"`);
        console.log(`Match: ${translatedText.toLowerCase().includes(test.expected.toLowerCase()) ? 'YES ✓' : 'NO ✗'}`);
      } else {
        console.log('No translation returned');
      }
      
    } catch (error) {
      console.error('Translation error:', error.message);
    }
  }
};

// Run the test
testTranslationAPI();
