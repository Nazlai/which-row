import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import App from "../App";

describe("app", () => {
  it("should upload a csv and retreive row number by key", async () => {
    const screen = await render(<App />);

    const csvFile = new File(
      [["hello,bar", "world,baz"].join("\n")],
      "example.csv",
      {
        type: "text/csv",
      }
    );
    const input = screen.getByLabelText(/upload/i);
    await expect
      .element(screen.getByRole("button", { name: /submit/i }))
      .not.toBeInTheDocument();

    await input.upload(csvFile);
    await screen.getByRole("textbox", { name: /search/i }).fill("hello");
    await screen.getByRole("button", { name: /submit/i }).click();
    await expect.element(screen.getByText("1")).toBeVisible();
  });

  it("should display matched rows if more than one row matches key", async () => {
    const screen = await render(<App />);

    const csvFile = new File(
      [["hello,bar", "world,bar"].join("\n")],
      "example.csv",
      {
        type: "text/csv",
      }
    );
    const input = screen.getByLabelText(/upload/i);

    await input.upload(csvFile);
    await screen.getByRole("textbox", { name: /search/i }).fill("bar");
    await screen.getByRole("button", { name: /submit/i }).click();
    await expect.element(screen.getByText("1,2")).toBeVisible();
  });

  it("should display record not found when key is not present in uploaded csv", async () => {
    const screen = await render(<App />);

    const csvFile = new File(
      [["hello,bar", "world,baz"].join("\n")],
      "example.csv",
      {
        type: "text/csv",
      }
    );
    const input = screen.getByLabelText(/upload/i);

    await input.upload(csvFile);
    await screen.getByRole("textbox", { name: /search/i }).fill("foo");
    await screen.getByRole("button", { name: /submit/i }).click();
    await expect.element(screen.getByText("not found")).toBeVisible();
  });

  it("should display file name on upload", async () => {
    const screen = await render(<App />);

    const csvFile = new File(
      [["hello,bar", "world,baz"].join("\n")],
      "example.csv",
      {
        type: "text/csv",
      }
    );

    const input = screen.getByLabelText(/upload/i);

    await input.upload(csvFile);
    await expect.element(screen.getByText("example.csv")).toBeVisible();
  });
});
