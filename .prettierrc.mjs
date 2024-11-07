/**
 * @type {import('prettier').Options}
 */
export default {
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  printWidth: 180,
  tabWidth: 4,
  importOrder: [
    "<BUILTIN_MODULES>", // Node.js built-in modules
    "<THIRD_PARTY_MODULES>", // Imports not matched by other special words or groups.
    "", // Empty line
    "^@plasmo/(.*)$",
    "",
    "^@plasmohq/(.*)$",
    "",
    "^~(.*)$",
    "",
    "^[./]"
  ]
}
