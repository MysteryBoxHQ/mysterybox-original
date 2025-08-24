import { createGalaxyBox } from "./galaxy-box-seed.js";
import { createAppleBox } from "./apple-box-seed.js";

async function runSeed() {
  try {
    await createGalaxyBox();
    await createAppleBox();
    console.log("Samsung Galaxy and Apple boxes created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating boxes:", error);
    process.exit(1);
  }
}

runSeed();