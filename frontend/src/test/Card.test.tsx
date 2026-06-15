import { render, screen } from "@testing-library/react";
import Card from "../components/ui/Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card><p>Content</p></Card>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("applies default classes", () => {
    render(<Card>Content</Card>);
    const el = screen.getByText("Content");
    expect(el.className).toContain("bg-white");
    expect(el.className).toContain("rounded-xl");
    expect(el.className).toContain("shadow-sm");
  });

  it("applies custom className", () => {
    render(<Card className="custom-class">Content</Card>);
    const el = screen.getByText("Content");
    expect(el.className).toContain("custom-class");
  });
});
