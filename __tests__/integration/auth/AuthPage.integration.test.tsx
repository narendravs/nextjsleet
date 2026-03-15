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

  it('should open the login modal when the "Sign In" button in the navbar is clicked', () => {
    render(
      <RecoilRoot>
        <AuthPage />
        <ToastContainer />
      </RecoilRoot>,
    );

    // 1. The page should render the Navbar
    const signInButton = screen.getByRole("button", { name: /sign in/i });
    expect(signInButton).toBeInTheDocument();

    // 2. The modal should not be visible initially
    // We check for text that is unique to the Login component.
    expect(screen.queryByText("Sign in to LeetClone")).not.toBeInTheDocument();

    // 3. User clicks the "Sign In" button
    fireEvent.click(signInButton);

    // 4. Assert that the AuthModal with the Login component is now visible
    // The modal and its content should now be in the DOM.
    expect(screen.getByText("Sign in to LeetClone")).toBeInTheDocument();
    expect(screen.getByLabelText(/your email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your password/i)).toBeInTheDocument();
  });
});
