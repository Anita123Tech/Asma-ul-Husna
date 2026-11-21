import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import audioTimings from "../src/data/audioTimings.js";
import { NAMES } from "../src/data/referenceData.js";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const continuousTrack = path.join(projectRoot, "public/audio/asma-ul-husna.mp3");
const hasContinuousTrack = existsSync(continuousTrack);

const invalidTimings = audioTimings.filter((timing, index) => {
  const valid =
    timing.id === index + 1 &&
    timing.status === "verified" &&
    Number.isFinite(timing.start) &&
    Number.isFinite(timing.end) &&
    timing.end > timing.start;
  return !valid;
});

const verifiedCount = audioTimings.filter(
  (timing) => timing.status === "verified",
).length;

console.log("\nAsma ul Husna audio check");
console.log(`Reference names: ${NAMES.length}`);
console.log(
  `Name timings: ${verifiedCount} verified of ${audioTimings.length}.`,
);

if (hasContinuousTrack) {
  console.log("The continuous recitation track is present.");
} else {
  console.log("\nMissing continuous track:");
  console.log("  public/audio/asma-ul-husna.mp3");
  process.exitCode = 1;
}

if (invalidTimings.length > 0 || audioTimings.length !== NAMES.length) {
  console.log("\nInvalid name timing entries:");
  for (const timing of invalidTimings) {
    console.log(`  ${timing.id}  ${timing.name}  ${timing.status}`);
  }
  process.exitCode = 1;
} else {
  console.log("All 99 name timings are valid and verified.");
}
