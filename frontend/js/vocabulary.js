// Vocabulary management functionality

// Set up vocabulary management
function setupVocabularyManagement() {
  const vocabLanguageFilter = document.getElementById('vocabLanguageFilter');
  const vocabSearch = document.getElementById('vocabSearch');
  
  // Filter vocabulary by language
  vocabLanguageFilter.addEventListener('change', () => {
    filterVocabulary();
  });
  
  // Search vocabulary
  vocabSearch.addEventListener('input', () => {
    filterVocabulary();
  });
}

// Load vocabulary from storage
function loadVocabulary() {
  const userId = localStorage.getItem('userId');
  
  // In a real app, this would call your backend API
  // For development, we'll use localStorage
  let vocabulary = JSON.parse(localStorage.getItem(`vocabulary_${userId}`)) || [];
  
  // Display vocabulary
  displayVocabulary(vocabulary);
}

// Add item to vocabulary
function addToVocabulary(vocabItem) {
  const userId = localStorage.getItem('userId');
  
  // Get existing vocabulary
  let vocabulary = JSON.parse(localStorage.getItem(`vocabulary_${userId}`)) || [];
  
  // Add new item
  vocabulary.push(vocabItem);
  
  // Save to storage
  localStorage.setItem(`vocabulary_${userId}`, JSON.stringify(vocabulary));
  
  // Update display
  displayVocabulary(vocabulary);
}

// Display vocabulary in the UI
function displayVocabulary(vocabulary) {
  const vocabularyList = document.getElementById('vocabularyList');
  
  // Clear current list
  vocabularyList.innerHTML = '';
  
  // Show empty state if no items
  if (vocabulary.length === 0) {
    vocabularyList.innerHTML = `
      <div class="empty-state">
        <p>You haven't saved any words yet. Start translating and save words to build your vocabulary!</p>
      </div>
    `;
    return;
  }
  
  // Add items to list
  vocabulary.forEach((item, index) => {
    const vocabItem = document.createElement('div');
    vocabItem.className = 'vocab-item';
    vocabItem.dataset.index = index;
    vocabItem.dataset.sourceLanguage = item.sourceLanguage;
    vocabItem.dataset.targetLanguage = item.targetLanguage;
    
    vocabItem.innerHTML = `
      <div class="word-info">
        <h3>${item.sourceText}</h3>
        <p>${item.translatedText}</p>
        <span class="language-info">${item.sourceLanguageName} → ${item.targetLanguageName}</span>
      </div>
      <div class="vocab-actions">
        <button class="speech-btn" data-text="${item.sourceText}" data-lang="${item.sourceLanguage}">🔊</button>
        <button class="speech-btn" data-text="${item.translatedText}" data-lang="${item.targetLanguage}">🔊</button>
        <button class="delete-btn" data-index="${index}">🗑️</button>
      </div>
    `;
    
    vocabularyList.appendChild(vocabItem);
  });
  
  // Add event listeners for speech and delete buttons
  addVocabularyEventListeners();
}

// Add event listeners to vocabulary items
function addVocabularyEventListeners() {
  // Speech buttons
  const speechButtons = document.querySelectorAll('.vocabulary-list .speech-btn');
  speechButtons.forEach(button => {
    button.addEventListener('click', () => {
      const text = button.dataset.text;
      const languageCode = getLanguageCodeForSpeech(button.dataset.lang);
      
      textToSpeech(text, languageCode)
        .catch(error => {
          console.error('Text-to-speech error:', error);
          alert('Failed to generate speech. Please try again.');
        });
    });
  });
  
  // Delete buttons
  const deleteButtons = document.querySelectorAll('.vocabulary-list .delete-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', () => {
      const index = parseInt(button.dataset.index);
      deleteVocabularyItem(index);
    });
  });
}

// Delete vocabulary item
function deleteVocabularyItem(index) {
  const userId = localStorage.getItem('userId');
  
  // Get existing vocabulary
  let vocabulary = JSON.parse(localStorage.getItem(`vocabulary_${userId}`)) || [];
  
  // Remove item
  vocabulary.splice(index, 1);
  
  // Save to storage
  localStorage.setItem(`vocabulary_${userId}`, JSON.stringify(vocabulary));
  
  // Update display
  displayVocabulary(vocabulary);
}

// Filter vocabulary based on language and search
function filterVocabulary() {
  const userId = localStorage.getItem('userId');
  const languageFilter = document.getElementById('vocabLanguageFilter').value;
  const searchQuery = document.getElementById('vocabSearch').value.toLowerCase();
  
  // Get all vocabulary
  let vocabulary = JSON.parse(localStorage.getItem(`vocabulary_${userId}`)) || [];
  
  // Apply filters
  let filteredVocabulary = vocabulary.filter(item => {
    // Language filter
    if (languageFilter !== 'all') {
      if (item.sourceLanguage !== languageFilter && item.targetLanguage !== languageFilter) {
        return false;
      }
    }
    
    // Search filter
    if (searchQuery) {
      return (
        item.sourceText.toLowerCase().includes(searchQuery) ||
        item.translatedText.toLowerCase().includes(searchQuery)
      );
    }
    
    return true;
  });
  
  // Display filtered vocabulary
  displayVocabulary(filteredVocabulary);
}
