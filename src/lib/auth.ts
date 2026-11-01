import fs from "fs";
import path from "path";

export function getActiveAdminKey(): string {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/ADMIN_SECRET_KEY=["']?([^"'\r\n]+)["']?/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch {}
  return (process.env.ADMIN_SECRET_KEY || "MasrDirectory#2026!").replace(/^["']|["']$/g, "").trim();
}

export const ADMIN_SESSION_TOKEN =
  process.env.ADMIN_SESSION_TOKEN || "egypt_local_dir_admin_authenticated_token_2026";

