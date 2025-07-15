# PDF Knowledge Quest

## Purpose

PDF Knowledge Quest is a web application designed to help users extract, search, and interact with knowledge from PDF documents. Upload your PDFs and instantly query their content using AI-powered chat. The app is ideal for students, educators, and professionals who need fast access to information within large documents.

## Technical Features

- **PDF Upload & Processing:** Upload PDF files and extract text using a Django backend.
- **Vector Search:** Text chunks are embedded and indexed with FAISS for semantic search.
- **AI Chatbot:** Ask questions about your documents; answers are generated using OpenAI's GPT-3.5 model, based only on your uploaded content.
- **Modern Frontend:** Built with React, TypeScript, Vite, shadcn-ui, and Tailwind CSS for a fast, responsive UI.
- **REST API:** Django REST Framework powers the backend API for document management and chat.
- **Document Management:** List, view, and manage uploaded documents.
- **Instant Preview:** See results and chat responses in real time.

## How can I edit this code?

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/de0951eb-266c-4f50-bcb7-1903a99fba9c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
