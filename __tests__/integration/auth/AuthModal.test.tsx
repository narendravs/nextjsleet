import { render, screen, fireEvent } from "@testing-library/react";
import { RecoilRoot, useRecoilValue } from "recoil";
import AuthModal from "@/components/Modals/AuthModal";
import { useCloseModal } from "@/components/Modals/AuthModal";
import { authModalState, AuthModalState } from "@/atoms/authModalAtom";

// Mocks for child components
jest.mock("@/components/Modals/Login", () => ({
  __esModule: true,
  default: () => <div data-testid="login-form">Login Form</div>,
}));

jest.mock("@/components/Modals/SignUp", () => ({
  __esModule: true,
  default: () => <div data-testid="signup-form">Signup Form</div>,
}));

jest.mock("@/components/Modals/ResetPassword", () => ({
  __esModule: true,
  default: () => (
    <div data-testid="reset-password-form">Reset Password Form</div>
  ),
}));

// Test component to observe and trigger modal close
const TestComponent = () => {
  const authModal = useRecoilValue(authModalState);
  const closeModal = useCloseModal();

  return (
    <div>
      <div data-testid="modal-state-open">{authModal.isOpen.toString()}</div>
      <div data-testid="modal-state-type">{authModal.type}</div>
      <button onClick={closeModal}>Close Modal Manually</button>
      {authModal.isOpen && <AuthModal />}
    </div>
  );
};

describe("AuthModal and useCloseModal", () => {
  const renderWithRecoil = (initialState: AuthModalState) => {
    return render(
      <RecoilRoot
        initializeState={({ set }) => set(authModalState, initialState)}
      >
        <TestComponent />
      </RecoilRoot>,
    );
  };

  it('should render Login component when type is "login"', async () => {
    renderWithRecoil({ isOpen: true, type: "login" });
    // findByTestId waits for the element to appear
    const loginForm = await screen.findByTestId("login-form");
    expect(loginForm).toBeInTheDocument();
  });

  it('should render Signup component when type is "register"', async () => {
    renderWithRecoil({ isOpen: true, type: "register" });
    const signupForm = await screen.findByTestId("signup-form");
    expect(signupForm).toBeInTheDocument();
  });

  it('should render ResetPassword component when type is "forgotPassword"', async () => {
    renderWithRecoil({ isOpen: true, type: "forgotPassword" });
    const resetForm = await screen.findByTestId("reset-password-form");
    expect(resetForm).toBeInTheDocument();
  });

  it("should close the modal on clicking the close button", () => {
    renderWithRecoil({ isOpen: true, type: "login" });
    expect(screen.getByTestId("modal-state-open")).toHaveTextContent("true");

    const closeButton = screen.getByRole("button", { name: "" }); // The close button has no name
    fireEvent.click(closeButton);

    expect(screen.getByTestId("modal-state-open")).toHaveTextContent("false");
    expect(screen.getByTestId("modal-state-type")).toHaveTextContent("login");
  });

  it("should close the modal on clicking the overlay", () => {
    const { container } = renderWithRecoil({ isOpen: true, type: "login" });
    expect(screen.getByTestId("modal-state-open")).toHaveTextContent("true");

    const overlay = container.querySelector(".bg-opacity-60");
    expect(overlay).toBeInTheDocument();

    fireEvent.click(overlay!);

    expect(screen.getByTestId("modal-state-open")).toHaveTextContent("false");
    expect(screen.getByTestId("modal-state-type")).toHaveTextContent("login");
  });

  it("should close the modal on pressing the Escape key", () => {
    renderWithRecoil({ isOpen: true, type: "login" });
    expect(screen.getByTestId("modal-state-open")).toHaveTextContent("true");

    fireEvent.keyDown(window, { key: "Escape", code: "Escape" });

    expect(screen.getByTestId("modal-state-open")).toHaveTextContent("false");
    expect(screen.getByTestId("modal-state-type")).toHaveTextContent("login");
  });
});
