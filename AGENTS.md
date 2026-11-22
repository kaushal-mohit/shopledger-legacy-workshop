# Repository Guidelines

## Stack

ShopLedger is a CommonJS Node.js application using Express and `body-parser`. Its browser interface is static HTML, CSS, and vanilla JavaScript. Application records are stored in `data/db.json`.

## Module Map

- `server.js` creates the Express app and serves `public/`.
- `routes/` contains the products, orders, customers, and reports HTTP handlers.
- `lib/` contains coupons, dates, inventory, invoices, ledger, orders, pricing, reports, storage, and tax logic.
- `config.js` contains shop, tax, inventory, and coupon settings.
- `public/` contains the UI; `data/db.json` contains the local data store.

## Commands

- `npm start` starts the server on port 3000 by default; `PORT` overrides the port.
- `npm test` is a placeholder and exits with “no test specified.” There is no configured build, lint, or formatting command.

## Change Rules

- Write characterization tests before changing behavior.
- Change only the module the ticket is about.
- Tests must never read or write `data/db.json`; use isolated test data.
- Do not add dependencies.
