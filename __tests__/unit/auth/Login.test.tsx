import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import Login from "@/components/Modals/Login";
import { toast } from "react-toastify";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";

// 1. Correct Mocking at the top level
jest.mock("react-firebase-hooks/auth");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe("Login Component Unit Tests", () => {
  const mockSignIn = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSignInWithEmailAndPassword as jest.Mock).mockReturnValue([
      mockSignIn,
      null,
      false,
      null,
    ]);
  });

  it("should show error toast if fields are submitted empty", async () => {
    render(
      <RecoilRoot>
        <Login />
      </RecoilRoot>,
    );

    // Target the specific button and click it
    const loginButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(loginButton);

    // Alternative: Fire submit directly on the form
    // const form = screen.getByRole("form"); // if you add role="form" to your <form> tag

    expect(toast.error).toHaveBeenCalledWith(
      "Please fill all fields",
      expect.objectContaining({ position: "top-center" }),
    );
  });

  it("should disable button and show loading text when logging in", () => {
    // Override mock for this specific test case
    (useSignInWithEmailAndPassword as jest.Mock).mockReturnValue([
      mockSignIn,
      null,
      true, // loading state
      null,
    ]);

    render(
      <RecoilRoot>
        <Login />
      </RecoilRoot>,
    );

    // FIX: Use { name } to disambiguate the buttons
    const button = screen.getByRole("button", { name: /logging in\.\.\./i });

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Logging in...");
  });
});
