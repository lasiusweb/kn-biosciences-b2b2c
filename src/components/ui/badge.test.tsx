import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Badge } from "@/components/ui/badge";

describe("Badge Component", () => {
  it("renders correctly with default variant", () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText("Test Badge")).toBeInTheDocument();
    expect(screen.getByText("Test Badge")).toHaveClass("bg-primary");
  });

  it("renders with secondary variant", () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>);
    expect(screen.getByText("Secondary Badge")).toHaveClass("bg-secondary");
  });

  it("renders with destructive variant", () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>);
    expect(screen.getByText("Destructive Badge")).toHaveClass("bg-destructive");
  });

  it("applies custom className", () => {
    render(<Badge className="custom-class">Custom Badge</Badge>);
    expect(screen.getByText("Custom Badge")).toHaveClass("custom-class");
  });
});
