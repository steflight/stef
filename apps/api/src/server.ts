import { buildApp } from "./app.ts";

const port = Number(process.env.PORT ?? 4000);
const { app } = buildApp();
await app.listen({ host: "0.0.0.0", port });
console.log(`Kladrichat API listening on http://localhost:${port}`);
