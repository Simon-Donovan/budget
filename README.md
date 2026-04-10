# Budget

A personal daily spending tracker that pulls live bank balance data into a Google Sheet and visualises cumulative monthly spend against a configurable target.

## How it works

Each day you record your bank's available balance (and any credits received). The app calculates how much you spent that day — `previous balance + credits − new balance` — and plots a cumulative spend curve for the month against a straight-line target (currently $3,500/month, set in [src/constants.ts](src/constants.ts)).

Data is stored in a Google Sheet (one row per day, columns: Date, Available, Credit). The Express API server reads from and writes to that sheet via the Google Sheets API using a service-account JWT.

### Adding a balance entry

On the **Current** tab you have two options:

- **Fetch Today's Balance** — triggers a headless browser session that logs into your bank, scrapes the available balance and any overnight credits, and writes the row to the sheet automatically.
- **Enter manually** — reveals a small form where you type the Available and Credit values yourself.

### Views

| Tab | What it shows |
|---|---|
| Current | Line chart of cumulative spend this month + a sidebar with today's spend, daily target, variance, and a 5-day spend history |
| Archive | The same chart for every previous month |

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS v4, Chart.js |
| Build | Vite 6 |
| Backend | Node / Express (TypeScript, run via `tsx`) |
| Data | Google Sheets API (`google-spreadsheet` + `google-auth-library`) |
| Tests | Vitest (unit), Playwright (e2e) |

## Setup

### 1. Google Sheets credentials

Create a service account in Google Cloud and download the JSON key. Copy the relevant fields into `api/sheets.json`:

```json
{
  "client_email": "your-service-account@project.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "sheet_id": "your-google-sheet-id"
}
```

Share the sheet with the service account email (Editor access).

The sheet must have a tab named **Current** with columns: `Date`, `Available`, `Credit`.

### 2. Bank credentials (optional — for auto-fetch)

If you want to use the **Fetch Today's Balance** button, populate `api/account.json` with whatever credentials the headless fetch script needs. See [api/fetch-balance.ts](api/fetch-balance.ts) for the expected shape.

### 3. Install dependencies

```bash
npm install
```

## Available scripts

### `npm start`

Starts the real API server (connects to Google Sheets) and the Vite dev server concurrently, then opens the app at `http://localhost:5173`.

- API server: `http://localhost:3001`
- Frontend dev server: `http://localhost:5173`

Use this for day-to-day use against live data.

### `npm run dev`

Starts the **mock** API server (serves canned data from `mock/`) and the Vite dev server, then opens the app at `http://localhost:5173`.

Use this for UI development without needing Google Sheets credentials.

### `npm run build`

Type-checks the project with `tsc` then bundles the frontend with Vite into `dist/`.

### `npm run preview`

Serves the production `dist/` bundle locally via Vite's built-in preview server.

### `npm run serve`

Starts the production server (`serve.ts`) on port 3000. Serves the static `dist/` build and the real API together from a single process, then opens `http://localhost:3000/`.

Run `npm run build` first.

### `npm test`

Runs the Vitest unit test suite.

### `npm run e2e`

Opens the Playwright UI runner for end-to-end tests (defined in `e2e/`).
