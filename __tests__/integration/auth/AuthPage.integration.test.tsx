import { render, screen, fireEvent } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import AuthPage from "@/app/auth/page";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";

// Mock external dependencies ONLY
jest.mock("react-firebase-hooks/auth");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
// We are NOT mocking Navbar or AuthModal to test the integration

describe("AuthPage Integration Test", () => {
  const mockUseAuthState = useAuthState as jest.Mock;
  const mockUseRouter = useRouter as jest.Mock;
  const mockPush = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUseAuthState.mockReturnValue([null, false, null]); // Unauthenticated user
    jest.clearAllMocks();
  });

  it('should open the login modal when the "Sign In" button in the navbar is clicked', async () => {
    render(
      <RecoilRoot>
        <AuthPage />
        <ToastContainer />
      </RecoilRoot>,
    );

    // 1. Verify the "Sign In" button exists in the Navbar
    const signInButton = screen.getByRole("button", { name: /sign in/i });
    expect(signInButton).toBeInTheDocument();
    fireEvent.click(signInButton);

    // Find inputs using the labels you checked in the code
    const emailInput = await screen.findByLabelText(/your email/i);
    const passwordInput = screen.getByLabelText(/your password/i);
    const submitButton = screen.getByRole("button", { name: /log in/i });

    // Simulate typing
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    // 2. Perform the ACTION (This triggers the state change)
    fireEvent.click(submitButton);

    // 3. WAIT for the dynamic component to load and render
    // findByText will now wait correctly because the click has already happened
    const modalHeading = await screen.findByText("Sign in to LeetClone");
    expect(modalHeading).toBeInTheDocument();

    // 4. Assert other elements are now present
    expect(screen.getByLabelText(/your email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your password/i)).toBeInTheDocument();
  });
});
