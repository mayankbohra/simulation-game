# Murder Mystery Detective Game

An interactive murder mystery game that uses AI models to create and manage immersive detective cases.

## Features

- 🔍 Investigate murder mysteries by examining evidence and interrogating suspects
- 🧩 Each case includes suspects
- 📝 Interactive button options for easy navigation
- 🎭 AI generates realistic character responses and adapts to your investigation
- 🕵️‍♀️ Make arrests when you think you've solved the case

## Getting Started

### Prerequisites

- Node.js 18.x or later
- OpenAI API key
- Anthropic API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory and add your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

### Running the Game

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Play

1. Click "Start New Case" to begin a new murder mystery
2. Interrogate suspects by selecting "Interrogate Suspects" options
3. Make an arrest when you're ready to solve the case

## Technologies Used

- Next.js 15.2.3 for the frontend and API routes
- OpenAI GPT-4o and Anthropic Claude for game content generation
- React 19.0.0
- TailwindCSS 4 for styling
- Eslint for code quality

## Development Scripts

- `npm run dev`: Start development server with Turbopack
- `npm run build`: Create production build
- `npm run start`: Start production server
- `npm run lint`: Run linter
