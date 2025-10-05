# Brahmanda: AI-Powered Exoplanet Discovery Platform

 
<img width="1854" height="967" alt="Screenshot from 2025-10-05 07-41-29" src="https://github.com/user-attachments/assets/d2e080af-c5d7-48e4-a036-4113db3f5a07" />


**Brahmanda** (from the Sanskrit word for "universe") is a modern, web-based platform designed for the new age of astronomical discovery. It empowers both professional researchers and amateur enthusiasts to analyze stellar data from NASA missions like Kepler and TESS, leveraging a powerful AI model to predict the existence of exoplanets.

This repository contains the complete frontend for the Brahmanda platform, built with React, TypeScript, and a state-of-the-art UI/UX design system to create an immersive "mission control" experience.

---

## ✨ Features

- **Cinematic User Experience:** A futuristic, "living" interface with fluid animations, interactive backgrounds, and a cohesive "Brahmanda Console" design aesthetic.
- **AI Prediction Terminal:** Input 16 key stellar parameters and receive a real-time prediction from our trained model on the likelihood of an exoplanet's existence, complete with a confidence score.
- **Dynamic 3D Visualization:** The platform's crown jewel. On detail pages, the application uses a generative AI (Stability AI) to create a scientifically plausible, interactive 3D model of the exoplanet based on its known data (temperature, radius, star type).
- **Interactive Data Exploration:** Browse, search, and sort through thousands of data points from the Kepler and TESS archives in a fast, responsive data terminal.
- **Personal Research Hub:** A dedicated space for users to manage their work, including a log of all past AI predictions and a personal annotation system for saving research notes.
- **Secure Authentication:** A complete JWT-based authentication flow for user registration and login.
- **Modern Tech Stack:** Built with the latest industry-standard tools for a robust, scalable, and maintainable codebase.

---

## 🛠️ Tech Stack & Key Libraries

- **Framework:** [React](https://reactjs.org/) (via [Vite](https://vitejs.dev/))
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching & Caching:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **3D Graphics:** [React Three Fiber](https://github.com/pmndrs/react-three-fiber) & [Drei](https://github.com/pmndrs/drei)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **API Client:** [Axios](https://axios-http.com/)

---

## 🚀 Getting Started

Follow these instructions to set up and run the project locally for development.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A running instance of the [Brahmanda Backend API](https://github.com/your-backend-repo-link) (*<- Link to your backend repo here*)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/brahmanda-frontend.git
cd brahmanda-frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

This project requires API keys for its core functionality.

1.  Create a new file named `.env` in the root of the project.
2.  Copy the contents of `.env.example` (if you have one) or add the following variables:

    ```env
    # The base URL of your running backend API
    VITE_API_BASE_URL=http://10.22.198.160:8000/api/v1

    # Your secret API key from Stability AI for generating planet textures
    VITE_STABILITY_API_KEY=sk-your-stability-ai-api-key
    ```

    > **Important:** The `VITE_` prefix is required for Vite to expose these variables to the client-side code.

### 4. Run the Development Server

Once the dependencies are installed and the environment variables are set, you can start the development server.

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

---

## 📁 Project Structure

The project follows a feature-based directory structure for scalability and maintainability.

```
/src
├── api/             # Axios client and interceptors configuration.
├── components/
│   ├── layout/      # Main layout components (Sidebar, Header, etc.).
│   ├── shared/      # Reusable components across multiple pages (e.g., ExoplanetVisualizer).
│   └── ui/          # Components from shadcn/ui.
├── pages/           # Each top-level route has its own folder and component.
│   ├── auth/        # Login, Signup pages.
│   ├── dashboard/
│   ├── kepler/
│   └── ...
├── services/        # Logic for interacting with external APIs (e.g., Stability AI).
├── store/           # Global state management with Zustand (e.g., authStore).
├── App.tsx          # Main application component with routing.
└── main.tsx         # The entry point of the application.
```

---

## 🤝 Contributing

We welcome contributions to the Brahmanda project! If you'd like to contribute, please follow these steps:

1.  **Fork** the repository.
2.  Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name`).
3.  Make your changes and commit them with clear, descriptive messages.
4.  **Push** your branch to your fork.
5.  Create a **Pull Request** to the `main` branch of the original repository.

Please ensure your code follows the existing style and conventions.

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

## ✨ Acknowledgements

- Data sourced from the [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/).
- Planet textures generated via the [Stability AI API](https://platform.stability.ai/).
- Built with an incredible ecosystem of open-source libraries.
```
