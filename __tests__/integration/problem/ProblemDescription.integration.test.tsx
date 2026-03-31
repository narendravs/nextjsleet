import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { RecoilRoot } from "recoil"; // Added for safety
import ProblemDescription from "@/components/Workspace/ProblemDescription";
import { useAuthState } from "react-firebase-hooks/auth";
import { getDocs, getDoc, runTransaction } from "firebase/firestore";

// Mock Firebase Hooks and Firestore
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
    render(
      <RecoilRoot>
        <ProblemDescription problem={mockProblem} _solved={false} />
      </RecoilRoot>,
    );

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
    render(
      <RecoilRoot>
        <ProblemDescription problem={mockProblem} _solved={false} />
      </RecoilRoot>,
    );

    const difficultyBadge = await screen.findByText("Easy");
    expect(difficultyBadge).toHaveClass("bg-olive");
  });

  it("checks if user has liked the problem using getDoc", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ ...mockUserData, likedProblems: ["two-sum"] }),
    });

    render(
      <RecoilRoot>
        <ProblemDescription problem={mockProblem} _solved={false} />
      </RecoilRoot>,
    );

    // Verify the Like button has the active color
    await waitFor(() => {
      // Using label "Unlike" because if it's already liked, the tooltip/label usually flips
      const unlikeButton = screen.getByLabelText(/unlike/i);
      const icon = unlikeButton.querySelector("svg");
      expect(icon).toHaveClass("text-dark-blue-s");
    });
  });

  it("executes a transaction when the Like button is clicked", async () => {
    (runTransaction as jest.Mock).mockResolvedValue(null);

    render(
      <RecoilRoot>
        <ProblemDescription problem={mockProblem} _solved={false} />
      </RecoilRoot>,
    );

    // 1. Wait for the loading to finish
    await screen.findByText(/easy|medium|hard/i);

    // 2. Target the Like button specifically.
    // We use a Regex with ^ and $ to ensure we match ONLY "Like" or "Unlike",
    // and not "Dislike".
    const likeButton = await screen.findByRole("button", {
      name: /^(Like|Unlike)$/,
    });

    // 3. Click it
    fireEvent.click(likeButton);

    // 4. Verify transaction
    await waitFor(
      () => {
        expect(runTransaction).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });
});
