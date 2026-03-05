import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import("next").NextConfig} */
const nextConfig = {
  turbopack: {
    // Prevent Turbopack from inferring a wrong workspace root (e.g. from another
    // package-lock.json elsewhere on the machine), which can lead to loading the
    // wrong .env.local / Convex URL.
    root: __dirname,
  },
  images: {
    domains: ["img.clerk.com", "images.clerk.dev"],
  },
};

export default nextConfig;

