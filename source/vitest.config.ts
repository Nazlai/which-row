import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    browser: {
      screenshotFailures: false,
      provider: playwright(),
      enabled: true,
      instances: [
        {
          browser: "chromium",
        },
      ],
    },
  },
});
