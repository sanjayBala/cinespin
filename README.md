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
*   **Share Functionality:** Share your movie and TV show discoveries with friends directly from the app.
*   **No Results Guidance:** Helpful feedback when no matches are found for your criteria.
*   **Duplicate Prevention:** Advanced randomization and history tracking ensures you don't see the same recommendations repeatedly, even after extensive use.
*   **Multi-Page Results:** Automatically fetches from multiple result pages to provide greater diversity in recommendations.
*   **Enhanced Randomization:** Uses server-side memory to track recently shown items and prioritize fresh content.
*   **Optimized Images:** Fast-loading movie posters with Next.js image optimization.
*   **Cache Management:** Implements a comprehensive caching strategy with:
    - Next.js 14.2's experimental `staleTimes` to expire server-side cache after 20 seconds
    - Client-side cache expiration logic using localStorage for consistent cache freshness
*   **Auto-History Clearing:** Automatically clears viewing history every 5 minutes to ensure fresh recommendations.

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

## 🧪 Recent Improvements

The latest version of CineSpin includes several enhancements to provide a better user experience:

*   **Rapid Data Refreshing:** Cache is cleared every 20 seconds to ensure fresh content.
*   **More Diverse Recommendations:** Fetches from multiple API pages and uses advanced selection algorithms.
*   **Automatic History Reset:** Viewing history is cleared every 5 minutes to prevent repetitive recommendations.
*   **Advanced Selection Logic:** Smart prioritization of unseen or less recently seen content.
*   **Server-Side Memory:** Tracks recently shown recommendations to avoid repetition across users.

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