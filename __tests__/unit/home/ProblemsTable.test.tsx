import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import ProblemsTable from "@/components/ProblemsTable/ProblemsTable";
import { useGetSolvedProblems } from "@/hooks/useProblemsTable";
import "@testing-library/jest-dom";
import { DBProblem } from "@/utils/types/problem";

// --- 1. MOCKS ---
jest.mock("@/hooks/useProblemsTable", () => ({
  useGetSolvedProblems: jest.fn(),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

jest.mock("react-youtube", () => ({
  __esModule: true,
  default: ({ videoId }: { videoId: string }) => (
    <div data-testid="youtube-player">{videoId}</div>
  ),
}));

const mockUseGetSolvedProblems = useGetSolvedProblems as jest.Mock;

describe("ProblemsTable Component - Pure Unit Tests", () => {
  const testProblems: DBProblem[] = [
    {
      id: "two-sum",
      title: "Two Sum",
      difficulty: "Easy",
      category: "Array",
      order: 1,
      videoId: "8hly31xKli0",
      likes: 0,
      dislikes: 0,
      link: "",
    },
    {
      id: "reverse-linked-list",
      title: "Reverse Linked List",
      difficulty: "Hard",
      category: "Linked List",
      order: 2,
      videoId: "",
      likes: 0,
      dislikes: 0,
      link: "",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  // --- Logic Test: Rendering ---
  it("renders all problem titles and categories correctly", () => {
    mockUseGetSolvedProblems.mockReturnValue([]);
    render(
      <table>
        <ProblemsTable problems={testProblems} />
      </table>,
    );

    expect(screen.getByText("Two Sum")).toBeInTheDocument();
    expect(screen.getByText("Reverse Linked List")).toBeInTheDocument();
    expect(screen.getByText("Array")).toBeInTheDocument();
    expect(screen.getByText("Linked List")).toBeInTheDocument();
  });

  // --- Logic Test: Difficulty Coloring ---
  it("applies correct CSS classes for different difficulty levels", () => {
    mockUseGetSolvedProblems.mockReturnValue([]);
    render(
      <table>
        <ProblemsTable problems={testProblems} />
      </table>,
    );

    const easyLabel = screen.getByText("Easy");
    const hardLabel = screen.getByText("Hard");

    expect(easyLabel).toHaveClass("text-dark-green-s");
    expect(hardLabel).toHaveClass("text-dark-pink");
  });

  // --- Logic Test: Solved Status ---
  it("renders a checkmark only for problems marked as solved in the hook", () => {
    // Only 'two-sum' is solved
    mockUseGetSolvedProblems.mockReturnValue(["two-sum"]);

    const { container } = render(
      <table>
        <ProblemsTable problems={testProblems} />
      </table>,
    );

    // Look for the checkmark icon in the first row
    const firstRowCheckmark = container.querySelector(".text-dark-green-s svg");
    expect(firstRowCheckmark).toBeInTheDocument();

    // The second row (Hard) should not have a checkmark icon in the status column
    const rows = screen.getAllByRole("row");
    const secondRowStatusCell = rows[1].querySelectorAll("td")[0];
    expect(secondRowStatusCell).not.toHaveTextContent("✔"); // Adjust based on your checkmark implementation
  });

  // --- Logic Test: Video Modal Trigger ---
  it("opens the YouTube player with the correct videoId on click", async () => {
    mockUseGetSolvedProblems.mockReturnValue([]);
    render(
      <table>
        <ProblemsTable problems={testProblems} />
      </table>,
    );

    // FIX: Instead of getByTestId, find the SVG by its aria-label
    const videoIcon = screen.getByLabelText("Watch solution for Two Sum");
    fireEvent.click(videoIcon);

    // Use findBy to handle any state-driven re-renders
    const player = await screen.findByTestId("youtube-player");
    expect(player).toBeInTheDocument();
    expect(player).toHaveTextContent("8hly31xKli0");
  });

  // --- Logic Test: Video Availability ---
  it("shows 'Coming soon' if videoId is missing", () => {
    mockUseGetSolvedProblems.mockReturnValue([]);
    render(
      <table>
        <ProblemsTable problems={testProblems} />
      </table>,
    );

    // Reverse Linked List has videoId: ""
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  // --- Logic Test: Closing Modal ---
  it("closes the YouTube modal when the Escape key is pressed", async () => {
    mockUseGetSolvedProblems.mockReturnValue([]);
    render(
      <table>
        <ProblemsTable problems={testProblems} />
      </table>,
    );

    // Open it
    const videoIcon = screen.getByLabelText("Watch solution for Two Sum");
    fireEvent.click(videoIcon);

    // Ensure it's open
    const player = await screen.findByTestId("youtube-player");
    expect(player).toBeInTheDocument();

    // Simulate Escape key on the global window
    fireEvent.keyDown(window, { key: "Escape", code: "Escape" });

    // Verify it is gone
    expect(screen.queryByTestId("youtube-player")).not.toBeInTheDocument();
  });
});
