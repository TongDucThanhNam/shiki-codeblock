import { bundledThemes } from "shiki";

console.log("Available bundled themes:");
const themeNames = Object.keys(bundledThemes);

console.log('\nThemes containing "one":');
console.log(themeNames.filter((name) => name.includes("one")));

console.log('\nThemes containing "light":');
console.log(themeNames.filter((name) => name.includes("light")));

console.log("\nAll available themes:");
console.log(themeNames.sort());
