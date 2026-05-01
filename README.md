# vestra-be

The backend for Vestra, built with [Express](https://expressjs.com) and TypeScript.

## Requirements

- Node.js 20+
- npm

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server (with hot reload):

```bash
npm run dev
```

Server runs on [http://localhost:4000](http://localhost:4000) by default. Override with the `PORT` environment variable.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run the compiled production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without writing |

## Production

```bash
npm run build
npm run start
```