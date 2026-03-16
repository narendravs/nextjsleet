import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import SignUp from "@/components/Modals/SignUp";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { setDoc } from "firebase/firestore";

// Mocks
jest.mock("react-firebase-hooks/auth");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("react-toastify");

describe("SignUp component", () => {
  const mockCreateUser = jest.fn();
  const mockUseCreateUserWithEmailAndPassword =
    useCreateUserWithEmailAndPassword as jest.Mock;
  const mockUseRouter = useRouter as jest.Mock;
  const mockPush = jest.fn();
  const mockToastError = toast.error as jest.Mock;
  const mockToastLoading = toast.loading as jest.Mock;
  const mockToastDismiss = toast.dismiss as jest.Mock;
  const mockSetDoc = setDoc as jest.Mock;

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUseCreateUserWithEmailAndPassword.mockReturnValue([
      mockCreateUser,
      null,
      false,
      null,
    ]);
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <RecoilRoot>
        <SignUp />
      </RecoilRoot>,
    );

  it("renders all input fields and a register button", () => {
    renderComponent();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register/i }),
    ).toBeInTheDocument();
  });

  it("shows an error toast for the first empty field", async () => {
    renderComponent();
    fireEvent.submit(screen.getByRole("button", { name: /register/i }));
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled();
      const toastContent = mockToastError.mock.calls[0][0];
      // Check if it's a React element with the expected text
      expect(toastContent.type).toBe("div");
      expect(toastContent.props.children).toEqual(
        expect.arrayContaining([
          "Please fill ",
          expect.objectContaining({
            type: "span",
            props: expect.objectContaining({ children: "Email" }),
          }),
        ]),
      );
    });
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it("calls createUserWithEmailAndPassword and setDoc on successful registration", async () => {
    const newUser = { user: { uid: "123", email: "test@example.com" } };
    mockCreateUser.mockResolvedValue(newUser);
    mockSetDoc.mockResolvedValue(undefined);

    renderComponent();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(mockToastLoading).toHaveBeenCalledWith(
        "Creating your account",
        expect.any(Object),
      );
      expect(mockCreateUser).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
      );
    });

    await waitFor(() => {
      expect(mockSetDoc).toHaveBeenCalled();
      const userData = mockSetDoc.mock.calls[0][1];
      expect(userData.uid).toBe("123");
      expect(userData.email).toBe("test@example.com");
      expect(userData.displayName).toBe("Test User");
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockToastDismiss).toHaveBeenCalledWith("loadingToast");
    });
  });

  it("shows an error toast if registration fails", async () => {
    const error = new Error("Email already in use");
    mockCreateUser.mockRejectedValue(error);
    renderComponent();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        error.message,
        expect.any(Object),
      );
      expect(mockToastDismiss).toHaveBeenCalledWith("loadingToast");
    });
  });
});
