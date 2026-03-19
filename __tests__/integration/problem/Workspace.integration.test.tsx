import { render, screen } from "@testing-library/react";
import Workspace from "@/components/Workspace/Workspace";
import { problems } from "@/utils/problems";

// 1. Mock the dynamic components (next/dynamic)
jest.mock("react-split", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="split-wrapper">{children}</div>
  ),
}));

jest.mock("react-confetti", () => ({
  __esModule: true,
  default: () => <div data-testid="confetti-effect" />,
}));

// 2. Mock internal hooks
jest.mock("@/hooks/useWindowSize", () => ({
  __esModule: true,
  default: () => ({ width: 1024, height: 768 }),
}));

// 3. Mock Child Components to verify prop drilling
jest.mock("@/components/Workspace/ProblemDescription", () => ({
  __esModule: true,
  default: ({ problem, _solved }: any) => (
    <div data-testid="problem-description">
      {problem.title} - Solved: {_solved.toString()}
    </div>
  ),
}));

jest.mock("@/components/Workspace/Playground", () => ({
  __esModule: true,
  default: ({ problem }: any) => (
    <div data-testid="playground-section">{problem.id} Editor</div>
  ),
}));

describe("Workspace Integration", () => {
  const mockId = "two-sum";
  const expectedProblem = problems[mockId];

  it("should render both Description and Playground with correct problem data", async () => {
    render(<Workspace problemId={mockId} />);

    // Verify the Split wrapper exists
    const splitWrapper = await screen.findByTestId("split-wrapper");
    expect(splitWrapper).toBeInTheDocument();

    // Verify ProblemDescription received the correct title from the problems object
    expect(screen.getByTestId("problem-description")).toHaveTextContent(
      expectedProblem.title,
    );

    // Verify Playground received the correct ID
    expect(screen.getByTestId("playground-section")).toHaveTextContent(mockId);
  });

  it("should correctly initialize with solved status as false", () => {
    render(<Workspace problemId={mockId} />);

    // Check if the 'solved' prop passed to ProblemDescription is false
    expect(screen.getByTestId("problem-description")).toHaveTextContent(
      "Solved: false",
    );
  });

  it("should not show confetti by default", () => {
    render(<Workspace problemId={mockId} />);

    // Confetti should only appear when success state is true
    expect(screen.queryByTestId("confetti-effect")).not.toBeInTheDocument();
  });
});
