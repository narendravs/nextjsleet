import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Workspace from "@/components/Workspace/Workspace";
import { problems } from "@/utils/problems";
import { ToastContainer } from "react-toastify";
import { useAuthState } from "react-firebase-hooks/auth";
import { updateDoc, getDoc } from "firebase/firestore";

// Mock dependencies
jest.mock("react-firebase-hooks/auth");
jest.mock("firebase/firestore", () => ({
  ...jest.requireActual("firebase/firestore"),
  updateDoc: jest.fn(),
  getDoc: jest.fn(),
  doc: jest.fn((_, ...path) => `mock/doc/path/${path.join("/")}`),
  arrayUnion: jest.fn((val) => `arrayUnion(${val})`),
}));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => "/problems/two-sum"),
}));
jest.mock("react-confetti", () => () => <div data-testid="confetti" />);

const mockUseAuthState = useAuthState as jest.Mock;
const mockUpdateDoc = updateDoc as jest.Mock;
const mockGetDoc = getDoc as jest.Mock;

describe("Workspace Integration Test", () => {
  const problem = problems["two-sum"];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthState.mockReturnValue([{ uid: "test-user" }, false, null]);
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        solvedProblems: [],
        likedProblems: [],
        dislikedProblems: [],
        starredProblems: [],
      }),
    });
    mockUpdateDoc.mockResolvedValue(undefined);
  });

  it("should show confetti and solved checkmark on successful submission", async () => {
    // Temporarily mock the handler to always succeed for the test
    const originalHandler = problem.handlerFunction;
    problem.handlerFunction = jest.fn().mockReturnValue(true);

    render(
      <>
        <Workspace problemId="two-sum" />
        <ToastContainer />
      </>,
    );

    // Initially, confetti and solved checkmark are not there
    expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        (c, el) =>
          el?.parentElement?.classList.contains("text-green-s") ?? false,
      ),
    ).not.toBeInTheDocument();

    // Find and click the submit button in the Playground's footer
    const submitButton = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitButton);

    // Assertions
    await waitFor(() => {
      expect(screen.getByTestId("confetti")).toBeInTheDocument();
    });
    expect(
      await screen.findByText("Congrats! All tests passed!"),
    ).toBeInTheDocument();
    expect(mockUpdateDoc).toHaveBeenCalledWith(expect.any(String), {
      solvedProblems: "arrayUnion(two-sum)",
    });

    // The checkmark should now be visible in the ProblemDescription
    await waitFor(() => {
      expect(
        screen.getByText(
          (c, el) =>
            el?.parentElement?.classList.contains("text-green-s") ?? false,
        ),
      ).toBeInTheDocument();
    });

    problem.handlerFunction = originalHandler;
  });

  it("should show an error toast on failed submission", async () => {
    const originalHandler = problem.handlerFunction;
    problem.handlerFunction = jest.fn(() => {
      const assert = require("assert");
      assert.deepStrictEqual({ a: 1 }, { a: 2 });
    }) as unknown as typeof problem.handlerFunction;

    render(
      <>
        <Workspace problemId="two-sum" />
        <ToastContainer />
      </>,
    );

    const submitButton = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitButton);

    expect(
      await screen.findByText("Oops! One or more test cases failed"),
    ).toBeInTheDocument();
    expect(mockUpdateDoc).not.toHaveBeenCalled();
    expect(
      screen.queryByText(
        (c, el) =>
          el?.parentElement?.classList.contains("text-green-s") ?? false,
      ),
    ).not.toBeInTheDocument();

    problem.handlerFunction = originalHandler;
  });
});
