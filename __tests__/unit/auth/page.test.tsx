"use client";
import { render, screen, waitFor } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import AuthPage from "@/app/auth/page";
import { authModalState } from "@/atoms/authModalAtom";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";

// Mocks
jest.mock("react-firebase-hooks/auth");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/components/Navbar/Navbar", () => () => (
  <div data-testid="navbar">Navbar</div>
));
jest.mock("@/components/Modals/AuthModal", () => () => (
  <div data-testid="auth-modal">AuthModal</div>
));

describe("AuthPage Unit Test", () => {
  const mockUseAuthState = useAuthState as jest.Mock;
  const mockUseRouter = useRouter as jest.Mock;
  const mockPush = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
  });

  it("should show loading spinner while checking auth state", () => {
    mockUseAuthState.mockReturnValue([null, true, null]); // [user, loading, error]
    render(
      <RecoilRoot>
        <AuthPage />
      </RecoilRoot>,
    );
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("should redirect to home page if user is authenticated", async () => {
    const user = { uid: "123", email: "test@test.com" };
    mockUseAuthState.mockReturnValue([user, false, null]); // user exists, not loading
    render(
      <RecoilRoot>
        <AuthPage />
      </RecoilRoot>,
    );
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("should render Navbar and hero image when not loading and no user", () => {
    mockUseAuthState.mockReturnValue([null, false, null]); // no user, not loading
    render(
      <RecoilRoot
        initializeState={({ set }) =>
          set(authModalState, { isOpen: false, type: "login" as const })
        }
      >
        <AuthPage />
      </RecoilRoot>,
    );
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByAltText("Hero img")).toBeInTheDocument();
    expect(screen.queryByTestId("auth-modal")).not.toBeInTheDocument();
  });

  it("should render AuthModal when authModal.isOpen is true", () => {
    mockUseAuthState.mockReturnValue([null, false, null]);
    render(
      <RecoilRoot
        initializeState={({ set }) =>
          set(authModalState, { isOpen: true, type: "login" as const })
        }
      >
        <AuthPage />
      </RecoilRoot>,
    );
    expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
  });
});
