import { render, screen, fireEvent } from "@testing-library/react";
import { RecoilRoot, useRecoilValue } from "recoil";
import Navbar from "@/components/Navbar/Navbar";
import { authModalState } from "@/atoms/authModalAtom";

// A small helper component to inspect Recoil state changes
const RecoilStateInspector = () => {
  const state = useRecoilValue(authModalState);
  return (
    <div data-testid="modal-state">{state.isOpen ? "open" : "closed"}</div>
  );
};

describe("Navbar Unit Test", () => {
  it("opens the auth modal when 'Sign In' is clicked", () => {
    render(
      <RecoilRoot>
        <Navbar />
        <RecoilStateInspector />
      </RecoilRoot>,
    );

    const signInBtn = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(signInBtn);

    const stateDisplay = screen.getByTestId("modal-state");
    expect(stateDisplay.textContent).toBe("open");
  });
});
