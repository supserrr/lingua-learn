// Main application script
document.addEventListener('DOMContentLoaded', () => {
  // Navigation handling
  const navLinks = document.querySelectorAll('nav a');
  const sections = document.querySelectorAll('.section');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Update active link
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      // Show corresponding section
      const targetId = link.getAttribute('href').substring(1);
      sections.forEach(section => {
        if (section.id === targetId) {
          section.classList.remove('hidden');
        } else {
          section.classList.add('hidden');
        }
      });
    });
  });
  
  // Initialize the application components
  initTranslator();
  initVocabulary();
  initPractice();
  
  // Set a temporary user ID (in a real app, this would be from authentication)
  localStorage.setItem('userId', 'user1234');
  
  // Load vocabulary on page load
  loadVocabulary();
});

// Initialize each section
function initTranslator() {
  // Initialize translator functionality (defined in translator.js)
  setupTranslator();
}

function initVocabulary() {
  // Initialize vocabulary management (defined in vocabulary.js)
  setupVocabularyManagement();
}

function initPractice() {
  // Initialize practice features
  const practiceCards = document.querySelectorAll('.practice-card');
  const practiceArea = document.getElementById('practiceArea');
  
  practiceCards.forEach(card => {
    const startBtn = card.querySelector('button');
    startBtn.addEventListener('click', () => {
      // Show practice area
      practiceArea.classList.remove('hidden');
      
      // Load the appropriate practice exercise
      const practiceType = card.id;
      loadPracticeExercise(practiceType);
    });
  });
}

function loadPracticeExercise(type) {
  const practiceArea = document.getElementById('practiceArea');
  
  // Clear previous content
  practiceArea.innerHTML = '';
  
  switch (type) {
    case 'flashcards':
      practiceArea.innerHTML = `
        <h3>Flashcard Practice</h3>
        <p>Coming soon! This feature will be available in the next update.</p>
        <div class="flashcard-container">
          <div class="flashcard">
            <div class="flashcard-front">
              <p>Front side of the flashcard</p>
            </div>
            <div class="flashcard-back hidden">
              <p>Back side of the flashcard</p>
            </div>
          </div>
          <div class="flashcard-controls">
            <button class="secondary-btn">Flip</button>
            <button class="secondary-btn">Next</button>
          </div>
        </div>
      `;
      break;
    case 'matchingGame':
      practiceArea.innerHTML = `
        <h3>Matching Game</h3>
        <p>Coming soon! This feature will be available in the next update.</p>
        <div class="matching-game-container">
          <p>Match words with their translations</p>
        </div>
      `;
      break;
    case 'fillBlanks':
      practiceArea.innerHTML = `
        <h3>Fill in the Blanks</h3>
        <p>Coming soon! This feature will be available in the next update.</p>
        <div class="fill-blanks-container">
          <p>Complete the sentences with the correct words</p>
        </div>
      `;
      break;
    default:
      practiceArea.innerHTML = '<p>Select a practice type to begin.</p>';
  }
}
