import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ProblemDescription from "@/components/Workspace/ProblemDescription";
import { useAuthState } from "react-firebase-hooks/auth";
import { getDocs, getDoc, runTransaction } from "firebase/firestore";

// 1. Mock Firebase Hooks and Firestore
jest.mock("react-firebase-hooks/auth");
jest.mock("firebase/firestore");

const mockProblem = {
  id: "two-sum",
  title: "Two Sum",
  problemStatement: "<div>Two Sum Statement</div>",
  examples: [],
  constraints: "<div>Constraints</div>",
  order: 1,
  starterCode: "code",
  handlerFunction: () => true,
  starterFunctionName: "twoSum",
};

const mockDBProblem = {
  id: "two-sum",
  difficulty: "Easy",
  likes: 10,
  dislikes: 2,
};

const mockUserData = {
  likedProblems: ["jump-game"],
  dislikedProblems: [],
  starredProblems: [],
  solvedProblems: [],
};

describe("ProblemDescription Firebase Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Simulate logged in user
    (useAuthState as jest.Mock).mockReturnValue([{ uid: "user-123" }, false]);

    // Mock getDocs for useGetCurrentProblem
    (getDocs as jest.Mock).mockResolvedValue({
      forEach: (callback: any) =>
        callback({ id: "two-sum", data: () => mockDBProblem }),
    });

    // Mock getDoc for useGetUsersDataOnProblem
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => mockUserData,
    });
  });

  it("fetches and displays problem data from Firestore (getDocs)", async () => {
    render(<ProblemDescription problem={mockProblem} _solved={false} />);

    const difficultyBadge = await screen.findByText(
      "Easy",
      {},
      { timeout: 3000 },
    );

    expect(difficultyBadge).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument(); // Likes count
    expect(screen.getByText("2")).toBeInTheDocument(); // Dislikes count
  });

  it("applies the correct CSS class based on fetched difficulty", async () => {
    render(<ProblemDescription problem={mockProblem} _solved={false} />);

    const difficultyBadge = await screen.findByText("Easy");
    expect(difficultyBadge).toHaveClass("bg-olive");
  });

  it("checks if user has liked the problem using getDoc", async () => {
    // Modify mock for this specific test: user already liked two-sum
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ ...mockUserData, likedProblems: ["two-sum"] }),
    });

    render(<ProblemDescription problem={mockProblem} _solved={false} />);

    // Verify the Like button has the active color (dark-blue-s)
    await waitFor(() => {
      const likeIcon = screen.getByLabelText("Unlike").querySelector("svg");
      expect(likeIcon).toHaveClass("text-dark-blue-s");
    });
  });

  it("executes a transaction when the Like button is clicked", async () => {
    (runTransaction as jest.Mock).mockResolvedValue(null);

    render(<ProblemDescription problem={mockProblem} _solved={false} />);

    // Wait for initial load
    const likeButton = await screen.findByLabelText("Like");

    fireEvent.click(likeButton);

    // Verify runTransaction was called
    expect(runTransaction).toHaveBeenCalled();
  });
});
