import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RecoilRoot, useRecoilValue } from "recoil";
import ResetPassword from "@/components/Modals/ResetPassword";
import { useSendPasswordResetEmail } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";
import { authModalState } from "@/atoms/authModalAtom";

// Mocks
jest.mock("react-firebase-hooks/auth");
jest.mock("react-toastify");

describe("ResetPassword component", () => {
  const mockSendPasswordResetEmail = jest.fn();
  const mockUseSendPasswordResetEmail = useSendPasswordResetEmail as jest.Mock;
  const mockToastSuccess = toast.success as jest.Mock;

  const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

  beforeEach(() => {
    mockUseSendPasswordResetEmail.mockReturnValue([
      mockSendPasswordResetEmail,
      false,
      null,
    ]); // [send, sending, error]
    jest.clearAllMocks();
    alertSpy.mockClear();
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  const renderComponent = () =>
    render(
      <RecoilRoot>
        <ResetPassword />
      </RecoilRoot>,
    );

  it("renders email input and a reset button", () => {
    renderComponent();
    expect(screen.getByLabelText(/your email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset password/i }),
    ).toBeInTheDocument();
  });

  it("calls sendPasswordResetEmail on form submit", async () => {
    mockSendPasswordResetEmail.mockResolvedValue(true);
    renderComponent();

    fireEvent.change(screen.getByLabelText(/your email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
        "test@example.com",
      );
    });
  });

  it("shows success toast and closes modal on success", async () => {
    mockSendPasswordResetEmail.mockResolvedValue(true);

    const TestObserver = () => {
      const { isOpen } = useRecoilValue(authModalState);
      return <div data-testid="modal-state">{isOpen.toString()}</div>;
    };

    render(
      <RecoilRoot
        initializeState={({ set }) =>
          set(authModalState, { isOpen: true, type: "forgotPassword" as const })
        }
      >
        <ResetPassword />
        <TestObserver />
      </RecoilRoot>,
    );

    fireEvent.change(screen.getByLabelText(/your email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        "Password reset email sent",
        expect.any(Object),
      );
      expect(screen.getByTestId("modal-state")).toHaveTextContent("false");
    });
  });

  it("shows an alert if firebase hook returns an error", () => {
    const error = { message: "User not found" };
    mockUseSendPasswordResetEmail.mockReturnValue([
      mockSendPasswordResetEmail,
      false,
      error,
    ]);
    renderComponent();
    expect(alertSpy).toHaveBeenCalledWith(error.message);
  });
});
