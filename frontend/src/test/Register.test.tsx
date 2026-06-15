import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Register from "../pages/Register";

const mockLogin = vi.fn();
const mockAddToast = vi.fn();
const mockNavigate = vi.fn();
const mockRegisterService = vi.fn();

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
  register: (...args: unknown[]) => mockRegisterService(...args),
}));

const typeIntoField = async (label: string, value: string) => {
  const input = screen.getByLabelText(label);
  await userEvent.clear(input);
  await userEvent.type(input, value);
};

const fillForm = async (overrides: Record<string, string> = {}) => {
  const fields = {
    name: "Test User",
    age: "25",
    email: "test@test.com",
    password: "Password1!",
    confirmPassword: "Password1!",
    ...overrides,
  };
  await typeIntoField("Nombre", fields.name);
  await typeIntoField("Edad", fields.age);
  await typeIntoField("Email", fields.email);
  await typeIntoField("Contraseña", fields.password);
  await typeIntoField("Confirmar contraseña", fields.confirmPassword);
};

const renderRegister = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

describe("Register", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields", () => {
    renderRegister();
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByLabelText("Edad")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    renderRegister();
    await userEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(screen.getByText("El nombre es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("La edad es obligatoria")).toBeInTheDocument();
    expect(screen.getByText("El email es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("La contraseña es obligatoria")).toBeInTheDocument();
  });

  it("shows password validation errors", async () => {
    renderRegister();
    await typeIntoField("Nombre", "Test");
    await typeIntoField("Edad", "25");
    await typeIntoField("Email", "test@test.com");
    await typeIntoField("Contraseña", "short");
    await typeIntoField("Confirmar contraseña", "short");
    await userEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(screen.getByText("Mínimo 8 caracteres")).toBeInTheDocument();
  });

  it("shows password mismatch error", async () => {
    renderRegister();
    await typeIntoField("Nombre", "Test");
    await typeIntoField("Edad", "25");
    await typeIntoField("Email", "test@test.com");
    await typeIntoField("Contraseña", "Password1!");
    await typeIntoField("Confirmar contraseña", "Different1!");
    await userEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(screen.getByText("Las contraseñas no coinciden")).toBeInTheDocument();
  });

  it("shows invalid email error", async () => {
    renderRegister();
    await typeIntoField("Nombre", "Test");
    await typeIntoField("Edad", "25");
    await typeIntoField("Email", "invalid-email");
    await typeIntoField("Contraseña", "Password1!");
    await typeIntoField("Confirmar contraseña", "Password1!");

    const form = screen.getByRole("button", { name: /crear cuenta/i }).closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockRegisterService).not.toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText("Email inválido")).toBeInTheDocument();
    });
  });

  it("shows invalid age error", async () => {
    renderRegister();
    await typeIntoField("Nombre", "Test");
    await typeIntoField("Edad", "200");
    await typeIntoField("Email", "test@test.com");
    await typeIntoField("Contraseña", "Password1!");
    await typeIntoField("Confirmar contraseña", "Password1!");

    const form = screen.getByRole("button", { name: /crear cuenta/i }).closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockRegisterService).not.toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText("Edad inválida (1-120)")).toBeInTheDocument();
    });
  });

  it("calls register service and navigates on success", async () => {
    mockRegisterService.mockResolvedValueOnce({
      user: { name: "Test User", email: "test@test.com", role: "user" },
      accessToken: "token123",
    });

    renderRegister();
    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(mockRegisterService).toHaveBeenCalledWith("Test User", "test@test.com", "Password1!", 25);
      expect(mockLogin).toHaveBeenCalledWith(
        { name: "Test User", email: "test@test.com", role: "user" },
        "token123"
      );
      expect(mockAddToast).toHaveBeenCalledWith("Cuenta creada correctamente", "success");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows error toast on failure", async () => {
    mockRegisterService.mockRejectedValueOnce({
      response: { data: { message: "Email ya registrado" } },
    });

    renderRegister();
    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("Email ya registrado", "error");
    });
  });

  it("renders link to login", () => {
    renderRegister();
    expect(screen.getByRole("link", { name: /inicia sesión/i })).toHaveAttribute("href", "/login");
  });

  it("shows password requirements list", () => {
    renderRegister();
    expect(screen.getByText(/Mínimo 8 caracteres/i)).toBeInTheDocument();
    expect(screen.getByText(/Al menos una mayúscula/i)).toBeInTheDocument();
    expect(screen.getByText(/Al menos un número/i)).toBeInTheDocument();
    expect(screen.getByText(/Al menos un carácter especial/i)).toBeInTheDocument();
  });
});
