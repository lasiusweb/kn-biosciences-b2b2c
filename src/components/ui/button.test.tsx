import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  it("renders correctly", () => {
    render(<Button>Test Button</Button>);
    expect(
      screen.getByRole("button", { name: /test button/i }),
    ).toBeInTheDocument();
  });
});
