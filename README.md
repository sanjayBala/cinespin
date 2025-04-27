# CineSpin 🎬

A retro-styled movie recommendation app that helps you discover your next favorite film.

## Features

- Retro cinema-inspired user interface
- Advanced movie filtering options
- Integration with TMDb API for up-to-date movie data
- Random movie selection from a large pool
- Responsive design for all devices

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [TMDb API](https://www.themoviedb.org/documentation/api) - Movie data

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cinespin.git
cd cinespin
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your TMDb API key:
```
NEXT_PUBLIC_TMDB_API_KEY="your-tmdb-api-key"
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment on Vercel

1. Create a [Vercel account](https://vercel.com/signup) if you haven't already

2. Install the Vercel CLI:
```bash
npm install -g vercel
```

3. Deploy to Vercel:
```bash
vercel
```

Alternatively, you can deploy directly from the Vercel dashboard:

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Add the following environment variable:
   - Name: `NEXT_PUBLIC_TMDB_API_KEY`
   - Value: Your TMDB API key
6. Click "Deploy"

## Environment Variables

The following environment variables are required:

- `NEXT_PUBLIC_TMDB_API_KEY`: Your TMDB API key (get it from [TMDB website](https://www.themoviedb.org/settings/api))

## Project Structure

- `/src/app` - Next.js app router pages and layouts
- `/src/components` - React components
- `/src/lib` - Utility functions and API clients
- `/public` - Static assets

## Development

- Run development server: `npm run dev`
- Build production: `npm run build`
- Start production server: `npm start`
- Run linter: `npm run lint`

## Credits

- [TMDb](https://www.themoviedb.org/) for providing the movie data API
- Created by [Sanjay Balaji](https://sanjaybalaji.dev)

## License

MIT License - see [LICENSE](LICENSE) for details
