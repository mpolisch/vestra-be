# Vestra - Backend API

Vestra is an AI-powered retirement planning tool for Canadians. Input your financial details, visualize your retirement projection, and chat with an AI assistant that understands your actual plan.

---

## Related Repo

Frontend: [vestra-fe](https://github.com/mpolisch/vestra-fe)

---

## Tech Stack

| Layer       | Technology                     |
| ----------- | ------------------------------ |
| Runtime     | Node.js                        |
| Framework   | Express                        |
| Language    | TypeScript                     |
| Database    | PostgreSQL                     |
| Auth        | JWT + bcrypt + httpOnly cookies|
| AI          | Claude API (Anthropic)         |
| Hosting     | Railway                        |

---

## Database Schema (ERD)

![ERD](public/Vestra%20DB%20ERD.jpg)

DB Schema is subject to change.

---

## API Reference

### Auth


| Method | Endpoint               | Description                        | Auth Required |
| ------ | ---------------------- | ---------------------------------- | ------------- |
| POST   | `/api/auth/register`   | Register a new user                | No            |
| POST   | `/api/auth/login`      | Login, sets httpOnly cookie        | No            |
| POST   | `/api/auth/logout`     | Clears auth cookie                 | No            |
| GET    | `/api/auth/me`         | Returns current authenticated user | Yes           |

Rest of the methods are TBD. API is subject to change.

--- 

## Getting Started

### Requirements

- Node.js 20.19.0+
- npm
- PostgreSQL (local or Railway)

### Installation 

```bash
git clone https://github.com/mpolisch/vestra-be.git
cd vestra-be
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

Run the development server (with hot reload):

### Running Locally

```bash
npm run dev
```

## Running on Production Server

```bash
npm run build
npm run start
```

API runs at [http://localhost:4000](http://localhost:4000)

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run the compiled production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run migrate` | Run database migrations |

---

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT stored in httpOnly, Secure, SameSite=Strict cookies
- All database queries use parameterized statements (SQL injection prevention)
- Secure HTTP headers via helmet.js
- Rate limiting on auth endpoints (express-rate-limit)
- CORS restricted to whitelisted frontend origin
- PostgreSQL encryption at rest via Neon

---

## Future Enhancements

- Email verification on registration
- Password reset flow
- Column-level encryption for sensitive financial data
- Tax calculation by province (federal + provincial brackets)
- CRA contribution room API integration
- CPP/OAS projections
- Monte Carlo stress-testing
- Conversation summarization for long chat histories
- PDF export of retirement plan
- Automated security scanning in CI
- Migrations tracking table, update init_db.ts to skip already-run files, and auto-run migrations on deploy