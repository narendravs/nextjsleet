import { render, screen, fireEvent } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import Topbar from "@/components/Topbar/Topbar";
import { useAuthState } from "react-firebase-hooks/auth";

// Mock dependencies
jest.mock("react-firebase-hooks/auth");
jest.mock("@/components/Buttons/Logout", () => () => (
  <div data-testid="logout-button">Logout</div>
));

jest.mock("next/dynamic", () => ({
  __esModule: true,
  default: (loader: any) => {
    // This forces the dynamic component to render immediately
    const Component = require("@/components/Topbar/ProblemNavigation").default;
    return Component;
  },
}));

// 1. If ProblemNavigation is a DEFAULT export:
// import ProblemNavigation from "./ProblemNavigation";
jest.mock("@/components/Topbar/ProblemNavigation", () => ({
  __esModule: true,
  // This covers default imports: import ProblemNavigation from '...'
  default: function MockNav() {
    return <div data-testid="problem-nav">Problem Navigation</div>;
  },
  // This covers named imports: import { ProblemNavigation } from '...'
  ProblemNavigation: function MockNav() {
    return <div data-testid="problem-nav">Problem Navigation</div>;
  },
}));

// 2. If Timer is a NAMED export:
// import { Timer } from "../Timer/Timer";
jest.mock("@/components/Timer/Timer", () => ({
  __esModule: true,
  Timer: () => <div data-testid="timer">Timer</div>,
}));

const mockUseAuthState = useAuthState as jest.Mock;

describe("Topbar Unit Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("User is not authenticated", () => {
    beforeEach(() => {
      mockUseAuthState.mockReturnValue([null, false, null]);
    });

    it("renders Sign In button and does not render user-specific items", () => {
      render(
        <RecoilRoot>
          <Topbar />
        </RecoilRoot>,
      );

      expect(
        screen.getByRole("button", { name: "Sign In" }),
      ).toBeInTheDocument();
      expect(screen.queryByTestId("logout-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("timer")).not.toBeInTheDocument();
      expect(screen.queryByAltText("Avatar")).not.toBeInTheDocument();
    });
  });

  describe("User is authenticated", () => {
    const mockUser = { email: "test@example.com", uid: "123" };

    beforeEach(() => {
      mockUseAuthState.mockReturnValue([mockUser, false, null]);
    });

    it("renders user avatar and logout button on a non-problem page", () => {
      render(
        <RecoilRoot>
          <Topbar />
        </RecoilRoot>,
      );

      expect(screen.getByAltText("Avatar")).toBeInTheDocument();
      expect(screen.getByTestId("logout-button")).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Sign In" }),
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("timer")).not.toBeInTheDocument();
      expect(screen.queryByTestId("problem-nav")).not.toBeInTheDocument();
    });

    it("renders Timer and ProblemNavigation on a problem page", () => {
      render(
        <RecoilRoot>
          <Topbar problemPage />
        </RecoilRoot>,
      );

      expect(screen.getByAltText("Avatar")).toBeInTheDocument();
      expect(screen.getByTestId("logout-button")).toBeInTheDocument();
      expect(screen.getByTestId("timer")).toBeInTheDocument();
      expect(screen.getByTestId("problem-nav")).toBeInTheDocument();
    });
  });
});
