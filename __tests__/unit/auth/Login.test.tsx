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
    // 1. Find the button using the text that IS actually there
    const loginButton = screen.getByRole("button", { name: /log in/i });

    // 2. Access the form directly from the button to bypass "required" validation
    const form = loginButton.closest("form");
    fireEvent.submit(form!);

    // 3. Wait for the toast to be called with your specific config
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Please fill all fields",
        expect.objectContaining({
          position: "top-center",
          theme: "dark",
        }),
      );
    });
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
