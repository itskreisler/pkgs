// @ts-check
import { fileURLToPath } from "url";
import { dirname } from "path";
// code
function calculateDirname(filePath: string): string {
  const path: string = dirname(filePath);
  const isPNPM: boolean = path.includes("pnpm");
  const isUSER: boolean = path.includes("@");

  let sliceValue: number;

  if (isPNPM) {
    sliceValue = isUSER ? -101 : -76;
  } else {
    sliceValue = isUSER ? -47 : -32;
  }

  return path.slice(0, sliceValue);
}
const __filename: string = fileURLToPath(import.meta.url);
export const __dirname: string = calculateDirname(__filename);