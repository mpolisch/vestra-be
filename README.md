# Vestra - Backend API

Vestra is an AI-powered retirement planning tool for Canadians. Input your financial details, visualize your retirement projection, and chat with an AI assistant that understands your actual plan.

Live API: https://vestra-be-production.up.railway.app
Frontend: https://vestra-chi.vercel.app
Frontend Repo: [vestra-fe](https://github.com/mpolisch/vestra-fe)

---

## Tech Stack

| Layer       | Technology                     |
| ----------- | ------------------------------ |
| Runtime     | Node.js                        |
| Framework   | Express 5                      |
| Language    | TypeScript                     |
| Database    | PostgreSQL                     |
| Auth        | JWT + bcrypt + httpOnly cookies|
| AI          | Claude Haiku (Anthropic API)   |
| Hosting     | Railway                        |

---

## Database Schema (ERD)

![ERD](src/assets/Vestra%20DB%20ERD.jpg)

---

## Architecture

![Architecture diagram showing a user/browser communicating over HTTPS with a Next.js frontend hosted on Vercel, which communicates via HTTPS/REST with an Express API hosted on Railway. The Express API connects to a PostgreSQL database within the same Railway environment via TCP, and to the Claude API (Anthropic) externally via HTTPS using the Anthropic SDK.](src/assets/Vestra%20Architecture.jpg)

---

## API Reference

### Auth
| Method | Endpoint               | Description                        | Auth Required |
| ------ | ---------------------- | ---------------------------------- | ------------- |
| POST   | `/api/auth/register`   | Register a new user                | No            |
| POST   | `/api/auth/login`      | Login, sets httpOnly cookie        | No            |
| POST   | `/api/auth/logout`     | Clears auth cookie                 | No            |
| GET    | `/api/auth/me`         | Returns current authenticated user | Yes           |

### Plans
| Method | Endpoint          | Description              | Auth |
| ------ | ----------------- | ------------------------ | ---- |
| GET    | `/api/plans`      | Get all plans for user   | Yes  |
| POST   | `/api/plans`      | Create a new plan        | Yes  |
| GET    | `/api/plans/:id`  | Get a specific plan      | Yes  |
| PUT    | `/api/plans/:id`  | Update a plan            | Yes  |
| DELETE | `/api/plans/:id`  | Delete a plan            | Yes  |

### Projections
| Method | Endpoint                   | Description                    | Auth |
| ------ | -------------------------- | ------------------------------ | ---- |
| GET    | `/api/plans/:id/projection`| Get retirement projection data | Yes  |

### Chat
| Method | Endpoint               | Description                          | Auth |
| ------ | ---------------------- | ------------------------------------ | ---- |
| GET    | `/api/plans/:id/chat`  | Get chat history for a plan          | Yes  |
| POST   | `/api/plans/:id/chat`  | Send a message, receive AI response  | Yes  |

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

Copy `.env.example` to `.env` and fill in the values

### Run Migrations

```bash
npm run migrate
```

### Start Development Server

```bash
npm run dev
```

## Running on Production Server

```bash
npm run build
npm start
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
| `npm run typecheck` | TypeScript type check without emitting |
| `npm run test` | Run Jest unit tests |

---

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT stored in httpOnly, Secure, SameSite=strict cookies
- All database queries use parameterized statements (SQL injection prevention)
- Secure HTTP headers via helmet.js
- Rate limiting on auth endpoints: 20 req/15min
- Rate limiting on AI chat endpoint: 10 req/min
- CORS restricted to whitelisted frontend origin
- trust proxy enabled for correct IP detection behind Railway's load balancer
- Input validation on all endpoints via Zod schemas
- ANTHROPIC_API_KEY, JWT_SECRET, CORS_ORIGIN validated at startup
- PostgreSQL private networking via Railway internal DNS

---

## Projection Model

Growth rates by risk tolerance:
- Conservative: 4% annual return
- Moderate: 6% annual return  
- Aggressive: 8% annual return

Contribution priority strategies:
- TFSA First: maximizes tax-free growth
- Balanced: 50/30/20 split across TFSA/RRSP/unregistered
- RRSP Heavy: 70/30 split favouring RRSP

Unregistered savings grow at 2% (HISA rate).

Known simplifications (documented as future enhancements):
- CRA annual contribution limits not enforced
- FHSA receives no new contributions in current model
- Post-retirement drawdown not modeled
- Growth rates are fixed (no volatility)

---

## Future Enhancements

- AI streaming responses: SSE-based streaming for real-time chat feel
- AI tool use: allow Claude to call projection recalculation and plan update functions mid-conversation for real-time "what if" scenarios
- CRA contribution limits: enforce annual TFSA ($7,000), RRSP (18% of income) limits with overflow logic
- FHSA contribution logic: model annual FHSA contributions with $8,000/year limit and $40,000 lifetime cap
- CPP/OAS projections: integrate government benefit estimates into retirement income modeling
- Post-retirement drawdown: model spending rate, safe withdrawal rate, and portfolio longevity
- Monte Carlo simulation: stress-test projections across variable return scenarios
- Redis-backed rate limiting: replace in-memory rate limiter with Redis for multi-instance deployments, keyed on userId
- User-based chat rate limiting: key chat limiter on userId instead of IP for fairness on shared networks
- Column-level encryption: encrypt sensitive financial fields at rest
- Email verification: verify email on registration
- Password reset flow: forgot password via email link
- Request logging: Morgan middleware for structured HTTP request logs
- Migrations tracking table: skip already-run migrations, auto-run on deploy
- Unit tests for projection logic: Jest tests for compound growth calculations and contribution allocation
- PDF export: generate downloadable retirement plan summary
- Province-level tax calculations: federal + provincial tax brackets for more accurate income modeling
- Content-Security-Policy headers: explicit CSP configuration via helmet to restrict script sources, prevent XSS, and whitelist known domains (Vercel CDN, Railway API, Google Fonts). Skipped for initial deployment due to misconfiguration risk with Recharts inline styles and third-party fonts

---

## Known Limitations

- Chat history might reference stale plan data if the user edits their plan mid-conversation
- In-memory rate limiting can't be shared across instances
- JWT tokens have no server-side revocation so a stolen token could remain valid for 7 days
- CRA contributions limits are not enforced, meaning TFSA, RRSP, and FHSA contributions are simplified