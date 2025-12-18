const sourceInput = "Bangkok (BKK)";
const dbValue = "Bangkok (BKK)";

const regex = new RegExp(sourceInput, "i");
console.log(`Input: "${sourceInput}"`);
console.log(`DB Value: "${dbValue}"`);
console.log(`Regex: ${regex}`);
console.log(`Match? ${regex.test(dbValue)}`);

const escapedInput = sourceInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const escapedRegex = new RegExp(escapedInput, "i");
console.log(`Escaped Input: "${escapedInput}"`);
console.log(`Escaped Regex: ${escapedRegex}`);
console.log(`Escaped Match? ${escapedRegex.test(dbValue)}`);
