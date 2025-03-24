const express = require('express');
const router = express.Router();
const axios = require('axios');
const fetch = require('node-fetch');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const { TranslationServiceClient } = require('@google-cloud/translate');

// Initialize clients
const textToSpeechClient = new TextToSpeechClient();
const translationClient = new TranslationServiceClient();

// Translation API using RapidAPI
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'en' } = req.body;
    
    const url = 'https://deep-translate1.p.rapidapi.com/language/translate/v2';
    const options = {
      method: 'POST',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '1bac348c61msh514a66a69096841p154653jsn03abaa71adb2',
        'x-rapidapi-host': 'deep-translate1.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,
        source: sourceLanguage,
        target: targetLanguage
      })
    };

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Format response to match expected structure
    res.json({
      data: {
        translations: [
          {
            translatedText: result.data ? result.data.translations.translatedText : text
          }
        ]
      }
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed', message: error.message });
  }
});

// Text-to-Speech API
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, languageCode = 'en-US' } = req.body;
    
    const request = {
      input: { text },
      voice: { languageCode, ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await textToSpeechClient.synthesizeSpeech(request);
    
    // Convert buffer to base64 for frontend playback
    const audioContent = response.audioContent.toString('base64');
    
    res.json({ audioContent });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ error: 'Text-to-speech conversion failed' });
  }
});

// Dictionary API
router.get('/definition/:word', async (req, res) => {
  try {
    const { word } = req.params;
    const { language = 'en' } = req.query;
    
    // Using Free Dictionary API for English definitions
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/${language}/${word}`);
    
    res.json(response.data);
  } catch (error) {
    console.error('Dictionary API error:', error);
    res.status(500).json({ error: 'Could not fetch word definition' });
  }
});

// Vocabulary storage (simulated for now - would use a database in production)
let vocabulary = {};

router.post('/vocabulary', (req, res) => {
  const { userId, word, definition, language } = req.body;
  
  if (!vocabulary[userId]) {
    vocabulary[userId] = [];
  }
  
  vocabulary[userId].push({ word, definition, language, addedAt: new Date() });
  
  res.json({ success: true, vocabulary: vocabulary[userId] });
});

router.get('/vocabulary/:userId', (req, res) => {
  const { userId } = req.params;
  
  if (!vocabulary[userId]) {
    vocabulary[userId] = [];
  }
  
  res.json({ vocabulary: vocabulary[userId] });
});

module.exports = router;