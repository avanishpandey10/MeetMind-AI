# 🧠 MeetMind AI
### AI-Powered Meeting & Workflow Assistant

> Transform raw meeting transcripts into structured summaries, action items, and follow-up emails — in seconds.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org)
[![Groq API](https://img.shields.io/badge/Groq-API-orange.svg)](https://groq.com)

---

## 📸 Screenshots

### 🏠 Home — Meeting Input
<!-- Add screenshot here -->
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/aedb97c3-89bd-4d34-bc7a-5e1c87aa2f91" />
> *Paste a transcript, upload a file, or drag & drop*

---

### 📊 Results Dashboard
<!-- Add screenshot here -->
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/5887b694-2787-4d53-9090-f93d20804406" />
> *Summary, action items, and decisions in one view*

---

### 💬 Chat with Meeting
<!-- Add screenshot here -->
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/a126ba02-bb93-46da-a2c3-1c09055fa039" />
> *Ask anything about your meeting content*

---

### 📧 Follow-up Email Generator
<!-- Add screenshot here -->
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/c7f1dd60-0b30-4fc6-a429-0505e92c0f3b" />
> *Auto-generated professional email, ready to copy*

---

## ✨ Features

### Core
| Feature | Description |
|--------|-------------|
| 📝 Smart Input | Paste notes, upload `.txt`/`.vtt` files, or drag & drop |
| 🤖 AI Analysis | Summaries, action items with assignees, deadlines, and key decisions |
| 📊 Dashboard | Tabbed view with stats cards and status tracking |
| 📧 Email Generator | One-click follow-up email in Markdown format |

### Bonus
- 💬 **Chat with Meetings** — Ask questions about any processed transcript
- 🔍 **Meeting History** — Search and browse all past meetings
- 📥 **Export as Markdown** — Download full summaries
- 📄 **Pagination** — Browse large meeting collections
- ⚡ **Real-time Processing** — Fast analysis powered by Groq + Llama 3

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express |
| Database | MongoDB / MongoDB Atlas |
| AI | Groq API + Llama 3 |

---

## 📦 Installation

### Prerequisites
- Node.js v18+
- MongoDB v6+ (local or [Atlas](https://www.mongodb.com/atlas))
- [Groq API Key](https://console.groq.com/) (free)

---

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/meeting-assistant.git
cd meeting-assistant/backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/meeting-assistant
GROQ_API_KEY=gsk_your_groq_api_key_here
NODE_ENV=development
```

```bash
# 4. Test Groq connection
node test-groq.js

# 5. Start the server
npm run dev
# → Running at http://localhost:5000
```

---

### Frontend Setup

```bash
cd ../frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
# → Running at http://localhost:3000
```

---

## 🏗️ Project Structure

```
meeting-assistant/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   └── Meeting.js           # MongoDB schema
│   │   ├── routes/
│   │   │   └── meetingRoutes.js     # API endpoints
│   │   ├── services/
│   │   │   └── llmService.js        # Groq AI integration
│   │   └── utils/
│   │       └── errorHandler.js      # Error handling
│   ├── server.js                    # Entry point
│   ├── test-groq.js                 # Groq connection test
│   ├── test-api.js                  # Full API test
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── MeetingInput.jsx
    │   │   ├── MeetingResults.jsx
    │   │   ├── MeetingHistory.jsx
    │   │   ├── ChatInterface.jsx
    │   │   └── LoadingSpinner.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── ResultsPage.jsx
    │   │   └── HistoryPage.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/meetings/process` | Process new meeting transcript |
| `POST` | `/api/meetings/upload` | Upload transcript file |
| `GET` | `/api/meetings` | List all meetings (supports `?search=&page=&limit=`) |
| `GET` | `/api/meetings/:id` | Get meeting by ID |
| `POST` | `/api/meetings/:id/followup-email` | Generate follow-up email |
| `POST` | `/api/meetings/:id/chat` | Chat with meeting content |
| `PATCH` | `/api/meetings/:id/action-items/:itemId` | Update action item status |
| `GET` | `/api/meetings/:id/export` | Export meeting as Markdown |
| `GET` | `/health` | Health check |

---

## 🎯 Sample Output

```json
{
  "summary": "The engineering standup covered API refactoring, frontend dashboard work, and database migration planning. Priya is completing payment integration by Friday; Tom needs updated API endpoints by Thursday.",

  "action_items": [
    { "description": "Complete payment integration", "assignee": "Priya", "deadline": "Friday" },
    { "description": "Fix responsive design issues", "assignee": "Tom", "deadline": "Thursday" },
    { "description": "Update API documentation", "assignee": "Priya", "deadline": "Next Monday" }
  ],

  "decisions": [
    "Database migration scheduled for Saturday at 2 AM",
    "Lisa will lead the migration",
    "Tom will be on standby for testing"
  ]
}
```

---

## 🧪 Testing

```bash
# Test Groq API connection
cd backend && node test-groq.js

# Test full API workflow
cd backend && node test-api.js

# Manual cURL test
curl -X POST http://localhost:5000/api/meetings/process \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "John: Finish the report by Friday.\nSarah: I will handle data analysis.\nDecision: Present to board on Monday.",
    "title": "Test Meeting"
  }'
```

---

## 🛠️ Configuration

### Switch LLM Provider

**OpenAI:**
```javascript
// llmService.js
this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
```

**Anthropic Claude:**
```javascript
// npm install @anthropic-ai/sdk
// Use Anthropic SDK instead of OpenAI
```

**Google Gemini:**
```javascript
// npm install @google/generative-ai
// Use GoogleGenerativeAI instead of OpenAI
```

### Database

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/meeting-assistant

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/meeting-assistant
```

---

## 🔒 Security

- ✅ CORS configured for frontend
- ✅ Input validation on all routes
- ✅ Secrets stored in environment variables
- ✅ MongoDB injection prevention via Mongoose
- ✅ Rate limiting ready

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| `Groq API not configured` | Set `GROQ_API_KEY` in `.env` |
| `MongoDB connection error` | Start MongoDB or switch to Atlas |
| `CORS error` | Confirm backend is running on port 5000 |
| `EADDRINUSE` | Change `PORT` in `.env` or kill the existing process |

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| API Response Time | < 2 seconds |
| File Upload Limit | 10 MB |
| Groq Free Rate Limit | 30 req/min |
| Groq Daily Limit | 14,400 req/day |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [Groq](https://groq.com) — Free LLM API access
- [Meta](https://ai.meta.com) — Llama 3 models
- [Vite](https://vitejs.dev) — Fast build tooling
- [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS
- [React](https://reactjs.org) — UI framework

---

<div align="center">

⭐ **Star this repo if you found it useful!** ⭐

Made with ❤️ and ☕

</div>
