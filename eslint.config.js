const browserGlobals = {
  AbortController: "readonly",
  Blob: "readonly",
  CSS: "readonly",
  Element: "readonly",
  Event: "readonly",
  HTMLCanvasElement: "readonly",
  HTMLElement: "readonly",
  HTMLInputElement: "readonly",
  HTMLSelectElement: "readonly",
  Image: "readonly",
  IntersectionObserver: "readonly",
  MutationObserver: "readonly",
  ResizeObserver: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  XMLSerializer: "readonly",
  cancelAnimationFrame: "readonly",
  clearTimeout: "readonly",
  console: "readonly",
  document: "readonly",
  getComputedStyle: "readonly",
  navigator: "readonly",
  performance: "readonly",
  requestAnimationFrame: "readonly",
  setTimeout: "readonly",
  window: "readonly",
};

const nodeGlobals = {
  Buffer: "readonly",
  URL: "readonly",
  console: "readonly",
  fetch: "readonly",
  process: "readonly",
  setTimeout: "readonly",
};

export default [
  {
    ignores: [
      ".dist-check-*/*",
      "_site/**",
      "coverage/**",
      "dist/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-async-promise-executor": "error",
      "no-constant-condition": ["error", { checkLoops: false }],
      "no-debugger": "error",
      "no-fallthrough": "error",
      "no-new-native-nonconstructor": "error",
      "no-promise-executor-return": "error",
      "no-prototype-builtins": "error",
      "no-undef": "error",
      "no-unreachable": "error",
      "no-unsafe-optional-chaining": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", caughtErrors: "none" }],
      "no-useless-catch": "error",
      "no-var": "error",
      "prefer-const": "error",
    },
  },
  {
    files: ["metallicss.js", "demo/**/*.js", "test/browser/**/*.js", "test/fixtures/**/*.js"],
    languageOptions: {
      globals: browserGlobals,
    },
  },
  {
    files: [
      "eslint.config.js",
      "playwright.config.js",
      "prettier.config.js",
      "scripts/**/*.mjs",
      "test/**/*.js",
    ],
    languageOptions: {
      globals: nodeGlobals,
    },
  },
];
