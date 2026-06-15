import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast } from "../context/ToastContext";
import ToastContainer from "../components/ToastContainer";
import { type ReactNode } from "react";

const TestConsumer = () => {
  const { addToast } = useToast();
  return (
    <div>
      <button onClick={() => addToast("Success!", "success")}>Add Success</button>
      <button onClick={() => addToast("Error!", "error")}>Add Error</button>
      <button onClick={() => addToast("Info!")}>Add Info</button>
    </div>
  );
};

const renderWithToast = (ui: ReactNode) =>
  render(
    <ToastProvider>
      {ui}
      <ToastContainer />
    </ToastProvider>
  );

describe("ToastContext + ToastContainer", () => {
  it("adds and displays a success toast", async () => {
    renderWithToast(<TestConsumer />);
    await userEvent.click(screen.getByText("Add Success"));
    expect(screen.getByText("Success!")).toBeInTheDocument();
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("adds and displays an error toast", async () => {
    renderWithToast(<TestConsumer />);
    await userEvent.click(screen.getByText("Add Error"));
    expect(screen.getByText("Error!")).toBeInTheDocument();
    expect(screen.getByText("✕")).toBeInTheDocument();
  });

  it("adds and displays an info toast", async () => {
    renderWithToast(<TestConsumer />);
    await userEvent.click(screen.getByText("Add Info"));
    expect(screen.getByText("Info!")).toBeInTheDocument();
    expect(screen.getByText("i")).toBeInTheDocument();
  });

  it("removes toast on close button click", async () => {
    renderWithToast(<TestConsumer />);
    await userEvent.click(screen.getByText("Add Success"));
    expect(screen.getByText("Success!")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "×" }));
    expect(screen.queryByText("Success!")).not.toBeInTheDocument();
  });

  it("shows nothing when there are no toasts", () => {
    const { container } = renderWithToast(<TestConsumer />);
    expect(container.querySelectorAll(".fixed.top-4.right-4 > *").length).toBe(0);
  });
});
