module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "add", "chore", "fix", "refactor", "docs"],
    ],
  },
};
