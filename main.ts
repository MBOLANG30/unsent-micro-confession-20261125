// Unsent: The Micro-Confession Sprint
// A tiny deterministic program that writes one unsent micro-confession
// to $MAKEFUN_OUTPUT_DIR/entry.txt (fallback /output).
// Exactly two parts: a "To:" line and the one line never sent.
// The program never deletes anything; it only creates the output
// directory if needed and writes the file.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The confession, written once and fixed. No randomness, no input,
// no environment-dependent content: every run writes these exact bytes.
const TO_LINE = "To: Mara, my old flatmate";
const MESSAGE_LINE =
  "Your chipped blue mug is still on the second shelf, and I wash it every Sunday even though no one drinks from it anymore.";

const ENTRY = TO_LINE + "\n" + MESSAGE_LINE;

// Validate the format the sealed scorer checks, before writing:
// whole file 1-260 characters, not only whitespace; exactly two lines;
// the message line at most 200 characters.
function validate(text) {
  const chars = Array.from(text);
  if (chars.length < 1 || chars.length > 260) {
    throw new Error("entry must be 1-260 characters, got " + chars.length);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (text.includes("\r")) {
    throw new Error("entry must use plain newlines, no carriage returns");
  }
  const lines = text.split("\n");
  if (lines.length !== 2) {
    throw new Error("entry must be exactly two lines, got " + lines.length);
  }
  if (!lines[0].startsWith("To: ")) {
    throw new Error('first line must start with "To: "');
  }
  if (Array.from(lines[1]).length > 200) {
    throw new Error("message line must be at most 200 characters");
  }
  if (lines[1].trim().length === 0) {
    throw new Error("message line must not be empty");
  }
}

validate(ENTRY);

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, ENTRY, "utf8");
// Read back and confirm the file on disk is exactly what we validated,
// so a partial or altered write fails loudly instead of silently grading.
if (readFileSync(outPath, "utf8") !== ENTRY) {
  throw new Error("written entry.txt does not match the validated entry");
}
