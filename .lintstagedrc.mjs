const config = {
  "*.{md,json}": "prettier --write",
  "*.{js,mjs}": ["eslint", "prettier --write"],
  "*.{ts,tsx}": [
    () => "tsc -p tsconfig.app.json --noEmit",
    "eslint",
    "prettier --write",
  ],
};

export default config;
