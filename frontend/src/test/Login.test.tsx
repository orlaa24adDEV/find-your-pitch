import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { type ReactNode } from "react";
import Login from "../pages/Login";

const mockLogin = vi.fn();
const mockAddToast = vi.fn();
const mockNavigate = vi.fn();
const mockLoginService = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock("../context/ToastContext", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

vi.mock("../services/auth.service", () => ({
  login: (...args: unknown[]) => mockLoginService(...args),
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

describe("Login", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields", () => {
    renderLogin();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    renderLogin();
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));
    expect(screen.getByText("El email es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("La contraseña es obligatoria")).toBeInTheDocument();
  });

  it("shows email validation error for empty field", async () => {
    renderLogin();
    await userEvent.type(screen.getByLabelText("Contraseña"), "pass123");
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));
    expect(screen.getByText("El email es obligatorio")).toBeInTheDocument();
  });

  it("calls login service and navigates on success", async () => {
    mockLoginService.mockResolvedValueOnce({
      user: { name: "Test", email: "test@test.com", role: "user" },
      accessToken: "token123",
    });

    renderLogin();
    await userEvent.type(screen.getByLabelText("Email"), "test@test.com");
    await userEvent.type(screen.getByLabelText("Contraseña"), "Password1!");
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockLoginService).toHaveBeenCalledWith("test@test.com", "Password1!");
      expect(mockLogin).toHaveBeenCalledWith(
        { name: "Test", email: "test@test.com", role: "user" },
        "token123"
      );
      expect(mockAddToast).toHaveBeenCalledWith("Sesión iniciada correctamente", "success");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("navigates to /admin for admin user", async () => {
    mockLoginService.mockResolvedValueOnce({
      user: { name: "Admin", email: "admin@test.com", role: "admin" },
      accessToken: "token123",
    });

    renderLogin();
    await userEvent.type(screen.getByLabelText("Email"), "admin@test.com");
    await userEvent.type(screen.getByLabelText("Contraseña"), "Password1!");
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin");
    });
  });

  it("shows error toast on failure", async () => {
    mockLoginService.mockRejectedValueOnce({
      response: { data: { message: "Credenciales inválidas" } },
    });

    renderLogin();
    await userEvent.type(screen.getByLabelText("Email"), "test@test.com");
    await userEvent.type(screen.getByLabelText("Contraseña"), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("Credenciales inválidas", "error");
    });
  });

  it("shows link to register", () => {
    renderLogin();
    const link = screen.getByRole("link", { name: /regístrate/i });
    expect(link).toHaveAttribute("href", "/register");
  });
});
