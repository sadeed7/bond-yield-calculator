# Bond Yield Calculator

Full-stack bond yield calculator: React (Vite) + NestJS + TypeScript. Single repo with `frontend/` and `backend/`.

## Features

- **Inputs**: Face value, annual coupon rate (%), market price, years to maturity, coupon frequency (annual / semi-annual).
- **Outputs**: Current yield, yield to maturity (binary search), total interest earned, premium/discount indicator.
- **Cash flow schedule**: Period, payment date, coupon payment, cumulative interest, remaining principal.

## Run locally

1. **Backend** (port 3000):
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

2. **Frontend** (port 5173, proxies API to backend):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open http://localhost:5173 and use the form. Ensure the backend is running for "Calculate" to work.

## Tests

Core algorithm tests only (Jest):

```bash
cd backend
npm test
```

## Docs

- `docs/ALGORITHM.md` – YTM (binary search), current yield, total interest, premium/discount, cash flow schedule.
- `docs/PROMPTING_NOTES.md` – Mapping from prompt to implementation and design choices.
