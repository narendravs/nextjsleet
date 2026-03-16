import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import Login from "@/components/Modals/Login";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// Mocks
jest.mock("react-firebase-hooks/auth");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("react-toastify");

describe("Login component", () => {
  const mockUseSignInWithEmailAndPassword =
    useSignInWithEmailAndPassword as jest.Mock;
  const mockUseRouter = useRouter as jest.Mock;
  const mockPush = jest.fn();
  const mockSignIn = jest.fn();
  const mockToastError = toast.error as jest.Mock;

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUseSignInWithEmailAndPassword.mockReturnValue([
      mockSignIn,
      null,
      false,
      null,
    ]); // [signIn, user, loading, error]
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <RecoilRoot>
        <Login />
      </RecoilRoot>,
    );

  it("renders email and password inputs and a login button", () => {
    renderComponent();
    expect(screen.getByLabelText(/your email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("updates input fields on change", () => {
    renderComponent();
    const emailInput = screen.getByLabelText(/your email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(
      /your password/i,
    ) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  it("shows an error if fields are empty on submit", async () => {
    renderComponent();
    const loginButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Please fill all fields",
        expect.any(Object),
      );
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("calls signInWithEmailAndPassword on form submit with correct credentials", async () => {
    mockSignIn.mockResolvedValue({ user: { uid: "123" } });
    renderComponent();

    fireEvent.change(screen.getByLabelText(/your email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/your password/i), {
      target: { value: "password123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
      );
    });
  });

  it("redirects to home page on successful login", async () => {
    mockSignIn.mockResolvedValue({ user: { uid: "123" } });
    renderComponent();

    fireEvent.change(screen.getByLabelText(/your email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/your password/i), {
      target: { value: "password123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("shows an error toast if firebase hook returns an error", () => {
    const error = { message: "Invalid credentials" };
    mockUseSignInWithEmailAndPassword.mockReturnValue([
      mockSignIn,
      null,
      false,
      error,
    ]);
    renderComponent();
    expect(mockToastError).toHaveBeenCalledWith(
      error.message,
      expect.any(Object),
    );
  });

  it("shows an error toast if signIn throws an error", async () => {
    const error = new Error("Something went wrong");
    mockSignIn.mockRejectedValue(error);
    renderComponent();

    fireEvent.change(screen.getByLabelText(/your email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/your password/i), {
      target: { value: "password123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        error.message,
        expect.any(Object),
      );
    });
  });
});
