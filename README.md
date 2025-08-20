# 📘 Lexicon

Lexicon is a modern **RAG (Retrieval-Augmented Generation) application** that allows you to upload files like **PDF, CSV, or any document link** and query them with AI-powered responses. It combines a powerful backend deployed on **Render**, a **Qdrant Cloud vector database**, and a sleek React frontend deployed on **Vercel**.

## 🚀 Live Demo

🔗 [Try Lexicon Here](https://rag-application-notebook-lm.vercel.app/)

---

## 🛠️ Tech Stack

### Frontend

* **React** – Component-based UI
* **Tailwind CSS** – Utility-first styling
* **Lucide React** – Icon library
* **React Query** – Data fetching & caching
* **Framer Motion** – Smooth animations

### Backend

* **Node.js** – Runtime environment
* **Express.js** – API handling
* **LangChain** – RAG implementation
* **OpenAI API** – AI-powered responses
* **Qdrant Cloud** – Vector database for embeddings
* **Render** – Backend deployment

---

## ⚡ Key Features

* 📂 Upload PDFs, CSVs, or provide document URLs
* 🔎 Intelligent RAG-powered document retrieval
* ⚡ Fast & scalable backend (deployed on Render)
* 🗄️ Vector storage with **Qdrant Cloud**
* 🎨 Clean and modern UI with animations
* 🔐 Secure environment variable support

---

## 🚀 How to Run the Project

### Frontend

1. Clone the repository

```bash
git clone <repo-url>
cd client
```

2. Install dependencies

```bash
npm install
```

3. Start the frontend

```bash
npm run dev
```
4. create environment variable - .env.local
```bash
REACT_APP_API_URL=your-backeend-url
```

### Backend

1. Navigate to backend folder

```bash
cd server
```

2. Install dependencies

```bash
npm install
```

3. Start the backend server

```bash
npm run dev
```

4.create environment variable - .env
```bash
OPENAI_API_KEY=Your-open-ai-api-key
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-qdrant-cloude-apiKey
QDRANT_URL=your-qdrant-cloude-url
PORT=3001
```

---

## 📸 Screenshots

### Landing Page

Modern UI with clean layout for file uploads and document links


---

## 📂 Project Structure

```
RAG-application-notebookLM/
├── client/               # Frontend (React + Tailwind)
│   ├── src/
│   │   ├── Components/   # UI Components
│   │   └── App.jsx       # Main App Entry
├── backend/              # Backend (Node.js + Express)
│   └── server.js         # Express Server
```

---

## 🔮 Future Enhancements

* Multi-file support for batch processing
* Fine-tuned retrieval with hybrid search
* UI improvements with better visualization
* Authentication & user-based storage
* Export chat history as PDF/CSV
* Multi-language support

---

## 📬 Feedback

If you’d like to suggest improvements or contribute, feel free to reach me at - vidyasagark890@gmail.com

---

**Backend:** Render | **Vector DB:** Qdrant Cloud | **Frontend:** Vercel
