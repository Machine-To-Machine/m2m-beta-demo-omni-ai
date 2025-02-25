# Omni AI (beta)

A Node.js backend service that provides AI chat capabilities employing other AIs and data services with machine-to-machine (M2M) verification capabilities.

## Features

- Connect to Stock.Service: Stock data retrieval from Yahoo Finance
- Connect to WealthWhisperer.AI: AI-powered chat responses using OpenAI GPT-4
- Verifiable Credentials (VC) authentication
- Secure API endpoints with input validation
- Machine-to-machine verification

## Prerequisites

- Node.js 16+
- npm or yarn
- Valid OpenAI API key
- Valid Verifiable Credentials (VC)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a .env file in the root directory following the .env.example template:


## Usage

Start the development server:

```bash
npm run dev
```

For production:

```bash
npm start
```

The server will start on `http://localhost:8001` (or specified port)

## API Endpoints

### Health Check
```
GET /health
Response: { "status": "OK" }
```

### Test Endpoint
```
POST /test
Body: { "name": "string" }
Response: { "message": "Hello {name}" }
```

### Stock Data
```
POST /stock
Body: {
  "symbol": "string",
  "period1": "number",
  "period2": "number"
}
Response: { "message": "Success", "data": { ... } }
```

### Chat Interface
```
POST /chat
Body: {
  "question": "string",
  "vcStatus": "boolean"
}
Response: { "message": "AI response", "data": null }
```

## Authentication

The service uses Verifiable Credentials (VC) for authentication. Include the VC JWT token in your requests when `vcStatus` is true.

## Dependencies

- Express.js - Web framework
- OpenAI - AI integration
- @web5/credentials - VC verification
- Axios - HTTP client
- dotenv - Environment configuration
- cors - CORS middleware
