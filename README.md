# Hush

Hush is an AI-powered note summarizer and quiz generator designed to help students and professionals optimize their learning process. By transforming uploaded documents into concise summaries and interactive quizzes, Hush makes studying more efficient and engaging.

## 🚀 Features

- **AI Document Summarization**: Instantly generate high-quality summaries from your uploaded notes and documents.
- **Interactive Quiz Generation**: Automatically create quizzes based on your content to test your knowledge.
- **Topic Extraction**: Intelligent identification of key concepts within your documents.
- **Learning Mastery Tracking**: Monitor your progress and master subjects over time.
- **Vibrant UI**: A modern, responsive frontend built with React and Tailwind CSS.
- **Secure Authentication**: Built-in user authentication and profile management.
- **Rate Limiting**: Protects the API from abuse while ensuring fair usage.

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Database**: SQLAlchemy with SQLite
- **AI/LLM**: Integration with LLM providers for summarization and quiz generation
- **Embeddings**: Vector store integration for document similarity and topic extraction
- **Rate Limiting**: Slowapi

### Frontend
- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Hooks

## 📂 Project Structure

```bash
hush_project/
├── app/                # FastAPI Backend
│   ├── auth/           # Authentication logic
│   ├── database/       # DB models and session management
│   ├── routes/         # API endpoints (upload, auth, quiz)
│   └── services/       # Core AI services (LLM, embedding, quiz, etc.)
├── frontend/           # React Frontend
│   └── src/            # Components, pages, and assets
├── requirements.txt    # Python dependencies
└── .env                # Configuration and API keys
```

## ⚙️ Setup and Installation

### Backend
1. Create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure environment variables in `.env`.
4. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 📄 License

This project is licensed under the MIT License.
