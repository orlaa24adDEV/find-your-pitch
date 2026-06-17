import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../components/Navbar";

const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

let mockAuth: any = {};

vi.mock("../context/AuthContext", () => ({
  useAuth: () => mockAuth,
}));

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );

describe("Navbar", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows login and register links when not authenticated", () => {
    mockAuth = { user: null, isAuthenticated: false, logout: mockLogout };
    renderNavbar();
    expect(screen.getByText("Iniciar sesión")).toBeInTheDocument();
    expect(screen.getByText("Registrarse")).toBeInTheDocument();
  });

  it("shows avatar initial when authenticated", () => {
    mockAuth = { user: { name: "Test User", role: "user", avatarUrl: null }, isAuthenticated: true, logout: mockLogout };
    renderNavbar();
    const avatars = screen.getAllByText("T");
    expect(avatars.length).toBeGreaterThanOrEqual(1);
  });

  it("shows admin link for admin user", async () => {
    mockAuth = { user: { name: "Admin", role: "admin", avatarUrl: null }, isAuthenticated: true, logout: mockLogout };
    renderNavbar();
    const avatars = screen.getAllByText("A");
    await userEvent.click(avatars[0]);
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("shows mis reservas link for non-admin user", async () => {
    mockAuth = { user: { name: "User", role: "user", avatarUrl: null }, isAuthenticated: true, logout: mockLogout };
    renderNavbar();
    const avatars = screen.getAllByText("U");
    await userEvent.click(avatars[0]);
    expect(screen.getByText("Mis reservas")).toBeInTheDocument();
  });

  it("shows avatar image when avatarUrl is provided", () => {
    mockAuth = { user: { name: "User", role: "user", avatarUrl: "/data/images/avatars/test.webp" }, isAuthenticated: true, logout: mockLogout };
    renderNavbar();
    const avatars = screen.getAllByAltText("Avatar");
    expect(avatars.length).toBeGreaterThanOrEqual(1);
    expect(avatars[0]).toHaveAttribute("src", expect.stringContaining("test.webp"));
  });

  it("opens dropdown on avatar click", async () => {
    mockAuth = { user: { name: "Test User", role: "user", avatarUrl: null }, isAuthenticated: true, logout: mockLogout };
    renderNavbar();
    const avatars = screen.getAllByText("T");
    await userEvent.click(avatars[0]);
    expect(screen.getByText("Mi perfil")).toBeInTheDocument();
    expect(screen.getByText("Cerrar sesión")).toBeInTheDocument();
  });

  it("calls logout and navigate on cerrar sesion click", async () => {
    mockAuth = { user: { name: "Test User", role: "user", avatarUrl: null }, isAuthenticated: true, logout: mockLogout };
    renderNavbar();
    const avatars = screen.getAllByText("T");
    await userEvent.click(avatars[0]);
    await userEvent.click(screen.getByText("Cerrar sesión"));
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
