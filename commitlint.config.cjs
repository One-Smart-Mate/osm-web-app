// commitlint.config.js
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Allowed commit types
    "type-enum": [
      2,
      "always",
      [
        "feat",     // A new feature
        "fix",      // A bug fix
        "docs",     // Documentation only changes
        "style",    // Changes that do not affect the code (formatting, semicolons, etc.)
        "refactor", // A code change that neither fixes a bug nor adds a feature
        "perf",     // A code change that improves performance
        "test",     // Adding or updating tests
        "chore",    // Changes to the build process, tooling, or dependencies
        "revert"    // Revert a previous commit
      ],
    ],

    // Maximum 100 characters in the header
    "header-max-length": [2, "always", 100],

    // Require a scope (e.g., feat(auth), fix(api))
    "scope-empty": [0], // 0 = off, 1 = warning, 2 = error

    // Subject must be lowercase or sentence-case
    "subject-case": [2, "always", ["sentence-case", "lower-case"]],
  },
};
