import { execSync } from "child_process";

console.log("[AIOS] Running Prisma migrations...");
execSync("npx prisma migrate dev", { stdio: "inherit" });
