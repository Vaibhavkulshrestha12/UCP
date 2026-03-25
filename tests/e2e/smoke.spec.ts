import { test, expect } from "@playwright/test";

test("landing page renders core messaging", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Competitive Intelligence, Centralized.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Enter UCP" })).toBeVisible();
});
