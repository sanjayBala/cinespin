# CineSpin 🎬

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?style=for-the-badge&logo=vercel&logoColor=white)](https://cinespin.vercel.app)

[![GitHub Actions Tests](https://github.com/sanjayBala/cinespin/actions/workflows/test.yml/badge.svg)](https://github.com/sanjayBala/cinespin/actions/workflows/test.yml)

**Tired of endless scrolling? CineSpin helps you discover your next favorite movie or TV show with a fun, retro twist!**

CineSpin offers a unique, cinema-inspired interface to find random film or TV recommendations based on your preferences. Simply set your criteria, and let CineSpin do the searching.

**Visit the live app:** [cinespin.sanjaybalaji.dev](https://cinespin.sanjaybalaji.dev)

## ✨ Features

*   **Retro UI:** A visually engaging design reminiscent of old-school cinema marquees.
*   **Smart Filtering:** Fine-tune recommendations by genre, release year, rating, language, and more.
*   **Movie & TV Support:** Discover both films and television series.
*   **Randomized Discovery:** Get a single, curated recommendation instead of overwhelming lists.
*   **Powered by TMDb:** Utilizes the extensive [The Movie Database (TMDb)](https://www.themoviedb.org/documentation/api) API for accurate and up-to-date information.
*   **Responsive Design:** Fully functional and great-looking on desktops, tablets, and mobile devices.
*   **Mobile-Friendly:** Touch-optimized controls and layouts for a smooth mobile experience.

## 🚀 Getting Started

Want to run CineSpin locally? Follow these steps:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/sanjayBala/cinespin.git
    cd cinespin
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables:**
    Create a `.env.local` file in the project root and add your TMDb API key:
    ```
    NEXT_PUBLIC_TMDB_API_KEY="YOUR_TMDB_API_KEY"
    ```
    *(You can get a free API key from the [TMDb website](https://www.themoviedb.org/settings/api).)*

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

CineSpin is built with modern web technologies:

*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Data:** [TMDb API](https://www.themoviedb.org/documentation/api)
*   **Icons:** [React Icons](https://react-icons.github.io/react-icons/)
*   **Testing:** [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/react)
*   **Deployment:** [Vercel](https://vercel.com/)

## 🧪 Running Tests

To run the automated tests:

```bash
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

## ☁️ Deployment

This project is automatically deployed using Vercel upon pushes to the `main` branch. You can also deploy manually:

1.  **Install Vercel CLI:**
    ```bash
    npm install -g vercel
    ```
2.  **Deploy:**
    ```bash
    vercel
    ```
    *(Follow the prompts, ensuring you add the `NEXT_PUBLIC_TMDB_API_KEY` environment variable in your Vercel project settings.)*

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/sanjayBala/cinespin/issues).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [Sanjay Balaji](https://sanjaybalaji.dev)