module.exports = {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "type-enum": [2, "always", ["chore", "add", "update", "move", "draft"]],
        "type-case": [2, "always", "lower-case"],
        "type-empty": [2, "never"],
        "subject-empty": [2, "never"],
        "subject-full-stop": [2, "never", "."],
    },
};
