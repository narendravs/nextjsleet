import { render, screen, fireEvent } from "@testing-library/react";
import { RecoilRoot, useRecoilValue } from "recoil";
import Navbar from "@/components/Navbar/Navbar";
import { authModalState } from "@/atoms/authModalAtom";

// A helper component to observe Recoil state changes
const TestObserver = () => {
  const { isOpen } = useRecoilValue(authModalState);
  return <div data-testid="modal-state">{isOpen.toString()}</div>;
};

describe("Navbar Unit Test", () => {
  it("should render logo and sign-in button", () => {
    render(
      <RecoilRoot>
        <Navbar />
      </RecoilRoot>,
    );
    expect(screen.getByAltText("LeetClone")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("should open the auth modal when sign-in button is clicked", () => {
    render(
      <RecoilRoot>
        <Navbar />
        <TestObserver />
      </RecoilRoot>,
    );

    // Initially, modal is closed
    expect(screen.getByTestId("modal-state")).toHaveTextContent("false");

    const signInButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(signInButton);

    // After click, modal should be open
    expect(screen.getByTestId("modal-state")).toHaveTextContent("true");
  });
});
