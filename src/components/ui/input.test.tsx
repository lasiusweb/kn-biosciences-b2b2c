import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Input } from "@/components/ui/input";

describe("Input Component", () => {
  it("renders correctly with placeholder", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Input className="custom-class" />);
    expect(screen.getByRole("textbox")).toHaveClass("custom-class");
  });

  it("can be disabled", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("handles value prop", () => {
    render(<Input value="test value" />);
    expect(screen.getByDisplayValue("test value")).toBeInTheDocument();
  });
});
