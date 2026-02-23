# Prompting Decisions and Implementation Notes

## Mapping from prompt to implementation

| Requirement | Implementation |
|-------------|----------------|
| React frontend, NestJS backend, TypeScript | Monorepo: `frontend/` (Vite + React + TS), `backend/` (NestJS + TS). |
| Inputs: Face Value, Coupon Rate %, Market Price, Years to Maturity, Coupon Frequency | DTO `CalculateBondRequestDto` with class-validator; React form with controlled inputs. |
| Outputs: Current Yield, YTM, Total Interest, Premium/Discount | `BondCalculationResultDto`; Chakra UI stat cards and tag. |
| Cash flow schedule: Period, Payment Date, Coupon, Cumulative Interest, Remaining Principal | `buildBondCashFlows()` in `bond.utils.ts`; Chakra `Table` in `App.tsx`. |
| YTM via numerical method (Newton-Raphson or binary search) | Binary search in `calculateYTM()` (see ALGORITHM.md). |
| Clean architecture, DTO validation, unit-testable pure functions | Pure logic in `bond.utils.ts`; NestJS service delegates to it; DTOs validated by ValidationPipe. |
| React form UI + table for schedule | Single-page form + results + striped table. |
| TypeScript strict mode | `strict: true` in both tsconfigs. |
| Explainability | `docs/ALGORITHM.md` and this file. |

## UI library

- Chakra UI chosen to simply cover forms, cards, stats, table, and tags with minimal custom CSS.

## Testing

- Only core algorithm tests for now: `backend/src/bonds/bond.utils.spec.ts` (Jest) for the pure functions in `bond.utils.ts`.
