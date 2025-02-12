import { expect, test, describe } from "bun:test";
import { getAlert } from "./index";

describe("getAlert", () => {
  test("should fetch weather alerts for a valid state code", async () => {
    const result = await getAlert({ stateCode: "CA" });
    expect(result).toBeTruthy();
  });
});