import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "../components/ui/Input";

describe("Input", () => {
  it("renders with label", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("renders error message", () => {
    render(<Input error="Campo requerido" />);
    expect(screen.getByText("Campo requerido")).toBeInTheDocument();
  });

  it("does not render error when not provided", () => {
    const { container } = render(<Input />);
    expect(container.querySelector(".text-red-500")).not.toBeInTheDocument();
  });

  it("applies error styles to input", () => {
    render(<Input error="Error" />);
    expect(screen.getByRole("textbox")).toHaveClass("border-red-400");
  });

  it("calls onChange handler", async () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    await userEvent.type(screen.getByRole("textbox"), "a");
    expect(onChange).toHaveBeenCalled();
  });

  it("renders with placeholder", () => {
    render(<Input placeholder="Tu nombre" />);
    expect(screen.getByPlaceholderText("Tu nombre")).toBeInTheDocument();
  });

  it("renders without label", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});
