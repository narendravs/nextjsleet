import { render, screen } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import AuthPage from "@/app/auth/page";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";

// No need to import { jest } from "@jest/globals" in most setups

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("react-firebase-hooks/auth", () => ({
  useAuthState: jest.fn(),
}));

// Mock the Navbar to keep this a "Unit" test (isolating AuthPage)
jest.mock("@/components/Navbar/Navbar", () => () => (
  <div data-testid="navbar" />
));
// Mock the AuthModal so it doesn't trigger dynamic imports
jest.mock("@/components/Modals/AuthModal", () => () => (
  <div data-testid="auth-modal" />
));

describe("AuthPage Unit Test", () => {
  it("redirects to home if user is authenticated", () => {
    const pushMock = jest.fn();

    // Type casting to jest.Mock allows access to .mockReturnValue
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    // Simulate an authenticated user
    (useAuthState as jest.Mock).mockReturnValue([{ uid: "123" }, false]);

    render(
      <RecoilRoot>
        <AuthPage />
      </RecoilRoot>,
    );

    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("renders the hero image and navbar when user is NOT authenticated", () => {
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    // Simulate no user, not loading
    (useAuthState as jest.Mock).mockReturnValue([null, false]);

    render(
      <RecoilRoot>
        <AuthPage />
      </RecoilRoot>,
    );

    // Verify the UI elements of the unit exist
    const heroImg = screen.getByAltText("Hero img");
    expect(heroImg).toBeInTheDocument();
  });
});
