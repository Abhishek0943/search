export function capitalizeFirstLetter(str: string): string {
  if (!str) return str;                   // handle empty strings
  return str.charAt(0).toUpperCase()      // uppercase first char
       + str.slice(1);                    // append the rest unchanged
}