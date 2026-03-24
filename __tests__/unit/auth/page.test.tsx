import { render, screen, waitFor } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import AuthPage from "@/app/auth/page"; // Ensure path is correct
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { authModalState, AuthModalState } from "@/atoms/authModalAtom";

// --- 1. Mocks ---

// Mock Firebase Auth Hook
jest.mock("react-firebase-hooks/auth");

// Mock Next.js Router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock Navbar - We mock this to isolate AuthPage logic from Navbar logic
jest.mock("@/components/Navbar/Navbar", () => {
  return function MockNavbar() {
    return <div data-testid="navbar">Navbar Mock</div>;
  };
});

// Mock AuthModal - Crucial because it's dynamically imported in the component
jest.mock("@/components/Modals/AuthModal", () => {
  return function MockAuthModal() {
    return <div data-testid="auth-modal">Auth Modal Mock</div>;
  };
});

describe("AuthPage - Complete Unit Test Suite", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  // --- Group 1: UI Rendering ---

  it("renders basic layout: Navbar and Hero Image", () => {
    // Mock user as logged out
    (useAuthState as jest.Mock).mockReturnValue([null, false]);

    render(
      <RecoilRoot>
        <AuthPage />
      </RecoilRoot>,
    );

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByAltText("Hero img")).toBeInTheDocument();
  });

  // --- Group 2: Authentication Side-Effects ---

  it("redirects authenticated users back to the home page", async () => {
    // Mock user as logged in
    (useAuthState as jest.Mock).mockReturnValue([
      { uid: "test-user-123" },
      false,
    ]);

    render(
      <RecoilRoot>
        <AuthPage />
      </RecoilRoot>,
    );

    // useEffect is async, so we wait for the router call
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("does not redirect if the user is not logged in", async () => {
    (useAuthState as jest.Mock).mockReturnValue([null, false]);

    render(
      <RecoilRoot>
        <AuthPage />
      </RecoilRoot>,
    );

    // Check that push was never called
    expect(mockPush).not.toHaveBeenCalled();
  });

  // --- Group 3: Recoil State Interaction ---

  it("renders AuthModal when authModal.isOpen is true", async () => {
    (useAuthState as jest.Mock).mockReturnValue([null, false]);
    // FIX: Explicitly cast the state object to AuthModalState
    const openState: AuthModalState = { isOpen: true, type: "login" };
    render(
      <RecoilRoot
        initializeState={(snapshot) => snapshot.set(authModalState, openState)}
      >
        <AuthPage />
      </RecoilRoot>,
    );

    // FIX: Use findBy instead of getBy to handle the dynamic import delay
    const modal = await screen.findByTestId("auth-modal");
    expect(modal).toBeInTheDocument();
  });

  it("hides AuthModal when authModal.isOpen is false", () => {
    (useAuthState as jest.Mock).mockReturnValue([null, false]);
    const openState: AuthModalState = { isOpen: false, type: "login" };
    render(
      <RecoilRoot
        initializeState={(snapshot) => snapshot.set(authModalState, openState)}
      >
        <AuthPage />
      </RecoilRoot>,
    );

    // queryBy is used instead of getBy when we expect an element to be ABSENT
    expect(screen.queryByTestId("auth-modal")).not.toBeInTheDocument();
  });
});
