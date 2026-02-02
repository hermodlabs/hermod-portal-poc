/*
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === "production" ? "/hermod-portal-poc/" : "/",
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.js$/,
  },
});
*/

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === "production" ? "/hermod-portal-poc/" : "/",
});