# LinguaLearn - Language Learning Tool

[![Demo Video](https://img.shields.io/badge/Demo-Video-red)](https://your-video-link-here)

LinguaLearn is a comprehensive language learning application that helps users translate text, practice pronunciation with text-to-speech functionality, build vocabulary, and practice language skills through interactive exercises.

## Features

- **Text Translation**: Translate text between multiple languages using Deep Translate API
- **Text-to-Speech**: Listen to proper pronunciation of words and phrases
- **Vocabulary Management**: Save and organize words and phrases you want to learn
- **Practice Exercises**: Interactive exercises to reinforce language learning (flashcards, matching games, fill-in-the-blanks)

## Live Demo

The application is deployed and accessible at: https://learn.supserrr.tech

## Architecture

This application is deployed on a high-availability architecture:

- **Web Servers**: Two identical web servers running the Node.js application
  - Web-01: 3.86.231.113
  - Web-02: 3.83.164.61
- **Load Balancer**: Nginx load balancer distributing traffic between the web servers
  - LB-01: 44.202.43.15

The load balancer uses the "least connections" algorithm to distribute traffic efficiently, with health checks to ensure requests are only sent to operational servers.

## APIs Used

- [Deep Translate API (RapidAPI)](https://rapidapi.com/gatzuma/api/deep-translate1/) - For text translation between languages
- [Free Dictionary API](https://dictionaryapi.dev/) - For retrieving word definitions and examples

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js with Express
- **Storage**: Local Storage (client-side) for development
- **Deployment**: PM2 for process management, Nginx for load balancing

## Local Setup

### Prerequisites

- Node.js (v16+) and npm installed
- API key for Deep Translate API (RapidAPI)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/lingua-learn.git
   cd lingua-learn
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your API keys:
   ```
   PORT=3000
   RAPIDAPI_KEY=your_rapidapi_key
   ```

4. Start the server:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Deployment

This application is designed to be deployed on two web servers with a load balancer. Detailed deployment instructions can be found in the [deployment documentation](deployment-doc.md).

### Server Setup

The application is deployed on:
- Two standard web servers (Web-01 and Web-02)
- One load balancer server (LB-01)

Each server runs Ubuntu, with Node.js and PM2 on the web servers and Nginx on the load balancer.

### Load Balancer Configuration

The load balancer is configured with:
- Health checks to detect server failures
- Least connections algorithm for traffic distribution
- Proxy headers for proper client IP forwarding

## Development Challenges

During the development of this application, several challenges were encountered:

1. **API Integration**: Setting up proper error handling for API requests and responses was crucial to provide a good user experience. The RapidAPI services required specific headers and response handling.

2. **Cross-Browser Compatibility**: The text-to-speech functionality works differently across browsers. We implemented a fallback mechanism for browsers that don't support the Web Speech API.

3. **Load Balancer Configuration**: Ensuring proper health checks and traffic distribution required careful configuration of the Nginx load balancer.

## Security Considerations

- API keys are stored as environment variables rather than in the code
- The application uses proper error handling to prevent leaking sensitive information
- Frontend input validation helps prevent potential security issues

## Future Enhancements

- User authentication and accounts
- Progress tracking and statistics
- More interactive practice exercises
- Mobile application version
- Advanced language learning features like grammar checking

## Credits

- [Deep Translate API](https://rapidapi.com/gatzuma/api/deep-translate1/)
- [Free Dictionary API](https://dictionaryapi.dev/)
- Icons from [FontAwesome](https://fontawesome.com/)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
