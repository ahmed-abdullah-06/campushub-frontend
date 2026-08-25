# CampusHub Frontend

The React + Material UI client application for CampusHub, connecting students across campus[cite: 1].

## Tech Stack

* **Framework:** React + Vite
* **UI Library:** Material UI (MUI) v5
* **Routing:** React Router v6
* **HTTP Client:** Axios (with JWT Interceptors)
* **State Management:** React Context API (`AuthContext`)

## Setup & Running Locally

1. **Install Dependencies:**
   ```bash
   npm install

Configure Environment:
    Create a .env file based on .env.example:   
        VITE_API_URL=http://localhost:5000/api

Start Development Server:
    npm run dev   -->   Open http://localhost:5173 to access the application.

---

### Next Milestones to Launch CampusHub

With both `backend/` and `frontend/` local development completely operational, here are the final steps to complete the project[cite: 1]:

1. **End-to-End Flow Testing:** Register a test student account, log in, create a post on Lost & Found, and post an item for sale in the Marketplace[cite: 1].
2. **Production Deployment (Render & MongoDB Atlas):**
   * Push your repository to **GitHub**[cite: 1].
   * Deploy `backend/` as a **Render Web Service** and set your environment variables (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`)[cite: 1].
   * Deploy `frontend/` as a **Render Static Site** and point `VITE_API_URL` to your live Render backend URL[cite: 1].

Would you like to perform a manual user-flow check first, or start the GitHub and Render deployment setup directly[cite: 1]?