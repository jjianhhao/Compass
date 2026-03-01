# Setup

This guide walks you through getting the project running locally.

## Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (v18 or later) — or the relevant runtime for this project
- A package manager: `npm`, `yarn`, or `pnpm`

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Compass
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the example env file and fill in the required values:

   ```bash
   cp .env.example .env
   ```

   Open `.env` and update the values as needed.

4. **Run the development server**

   ```bash
   npm run dev
   ```

## Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Build for production         |
| `npm run test`  | Run the test suite           |
| `npm run lint`  | Lint the codebase            |

## Project Structure

```
Compass/
├── src/          # Source code
├── public/       # Static assets
├── tests/        # Test files
└── README.md
```

## Troubleshooting

- **Dependencies not installing?** Delete `node_modules/` and the lock file, then re-run `npm install`.
- **Environment variables not loading?** Make sure `.env` exists and is not committed to git.

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -m "feat: add your feature"`
3. Open a pull request against `main`
