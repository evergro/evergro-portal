import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return listSourceFiles(path);
    return /\.(vue|ts)$/.test(path) ? [path] : [];
  });
}

describe("data imports", () => {
  it("views and components import data from services/api, never from the mock files", () => {
    const root = join(import.meta.dirname, "..");
    const offenders = [join(root, "features"), join(root, "components")]
      .flatMap(listSourceFiles)
      .filter((file) => /services\/(mockApi|promoApi)/.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });
});
