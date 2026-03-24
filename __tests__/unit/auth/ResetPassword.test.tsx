import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import ResetPassword from "@/components/Modals/ResetPassword";
import { toast } from "react-toastify";
import { useSendPasswordResetEmail } from "react-firebase-hooks/auth";

// --- 1. Mocks ---
jest.mock("react-firebase-hooks/auth");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("ResetPassword Component Unit Tests", () => {
  const mockSendEmail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation
    (useSendPasswordResetEmail as jest.Mock).mockReturnValue([
      mockSendEmail,
      false, // sending
      null, // error
    ]);
  });

  it("updates email input value on change", () => {
    render(
      <RecoilRoot>
        <ResetPassword />
      </RecoilRoot>,
    );

    const emailInput = screen.getByPlaceholderText(
      "name@company.com",
    ) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect(emailInput.value).toBe("test@example.com");
  });

  it("calls sendPasswordResetEmail and shows success toast on success", async () => {
    mockSendEmail.mockResolvedValue(true);

    render(
      <RecoilRoot>
        <ResetPassword />
      </RecoilRoot>,
    );

    const emailInput = screen.getByPlaceholderText("name@company.com");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const submitBtn = screen.getByRole("button", { name: /reset password/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSendEmail).toHaveBeenCalledWith("test@example.com");
      expect(toast.success).toHaveBeenCalledWith(
        "Password reset email sent",
        expect.any(Object),
      );
    });
  });

  it("shows error toast when firebase error occurs", async () => {
    // Simulate an error coming from the hook
    const mockError = { message: "User not found" };
    (useSendPasswordResetEmail as jest.Mock).mockReturnValue([
      mockSendEmail,
      false,
      mockError,
    ]);

    render(
      <RecoilRoot>
        <ResetPassword />
      </RecoilRoot>,
    );

    // The useEffect in your component triggers toast.error when the error object exists
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "User not found",
        expect.any(Object),
      );
    });
  });
});
