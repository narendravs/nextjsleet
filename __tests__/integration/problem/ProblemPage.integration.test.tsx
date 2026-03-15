import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import ProblemPage from "@/app/problems/[pid]/page";
import { useAuthState } from "react-firebase-hooks/auth";
import { getDoc, updateDoc } from "firebase/firestore";
import { problems } from "@/utils/problems";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePathname } from "next/navigation";

// --- MOCK EXTERNAL DEPENDENCIES ---
jest.mock("react-firebase-hooks/auth");
jest.mock("firebase/firestore", () => ({
  ...jest.requireActual("firebase/firestore"),
  getDoc: jest.fn(),
  doc: jest.fn((_, ...path) => `mock/doc/path/${path.join("/")}`),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn((val) => `arrayUnion(${val})`),
}));
jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  usePathname: jest.fn(),
}));

// Mock dynamic UI components that are not essential for this test
jest.mock("react-split", () => {
  return function DummySplit({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  };
});
jest.mock("react-confetti", () => () => null);

const mockUseAuthState = useAuthState as jest.Mock;
const mockGetDoc = getDoc as jest.Mock;
const mockUpdateDoc = updateDoc as jest.Mock;
const mockUsePathname = usePathname as jest.Mock;

describe("Problem Page Integration Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock a logged-in user
    mockUseAuthState.mockReturnValue([
      { uid: "test-user-123", email: "test@example.com" },
      false,
      null,
    ]);
    // Mock the current path
    mockUsePathname.mockReturnValue("/problems/two-sum");
    // Mock firestore `getDoc` for user data hooks
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

  it("should render the full problem page and allow solving the problem", async () => {
    // Temporarily mock the handler to always succeed for the test
    const originalHandler = problems["two-sum"].handlerFunction;
    problems["two-sum"].handlerFunction = jest.fn().mockReturnValue(true);

    // Render the server component by resolving its promise
    const PageComponent = await ProblemPage({ params: { pid: "two-sum" } });
    render(
      <RecoilRoot>
        <ToastContainer />
        {PageComponent}
      </RecoilRoot>,
    );

    // 1. Check for essential components from different parts of the tree
    await waitFor(() => {
      expect(screen.getByText("Two Sum")).toBeInTheDocument();
    });
    expect(screen.getByText("Easy")).toBeInTheDocument();
    const submitButton = screen.getByRole("button", { name: "Submit" });
    expect(submitButton).toBeInTheDocument();

    // 2. Initially, the problem is not solved (no checkmark)
    expect(
      screen.queryByText(
        (content, el) =>
          el?.parentElement?.classList.contains("text-green-s") ?? false,
      ),
    ).not.toBeInTheDocument();

    // 3. Simulate user submitting correct code
    fireEvent.click(submitButton);

    // 4. Assert success state
    expect(
      await screen.findByText("Congrats! All tests passed!"),
    ).toBeInTheDocument();
    expect(mockUpdateDoc).toHaveBeenCalledWith(expect.any(String), {
      solvedProblems: "arrayUnion(two-sum)",
    });

    // 5. Assert that the UI updated to show "solved"
    await waitFor(() => {
      expect(
        screen.getByText(
          (content, el) =>
            el?.parentElement?.classList.contains("text-green-s") ?? false,
        ),
      ).toBeInTheDocument();
    });

    // Restore original handler
    problems["two-sum"].handlerFunction = originalHandler;
  });
});
