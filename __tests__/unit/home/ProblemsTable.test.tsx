import { render, screen, fireEvent } from "@testing-library/react";
import ProblemsTable from "@/components/ProblemsTable/ProblemsTable";
import { useGetSolvedProblems } from "@/hooks/useProblemsTable";
import "@testing-library/jest-dom";
import { DBProblem } from "@/utils/types/problem";

// --- 1. MOCK DYNAMIC HOOKS ---
jest.mock("@/hooks/useProblemsTable", () => ({
  useGetSolvedProblems: jest.fn(),
}));

// --- 2. MOCK EXTERNAL LIBRARIES ---
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

describe("ProblemsTable Component (Unit Test)", () => {
  // Define a small set of test data matching the DBProblem interface
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
      difficulty: "Medium",
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
  });

  it("renders the problems passed via props", () => {
    mockUseGetSolvedProblems.mockReturnValue(["two-sum"]);

    // FIX: Pass the 'problems' prop here
    render(
      <table>
        <ProblemsTable problems={testProblems} />
      </table>,
    );

    expect(screen.getByText("Two Sum")).toBeInTheDocument();
    expect(screen.getByText("Reverse Linked List")).toBeInTheDocument();
    expect(screen.getByText("Easy")).toHaveClass("text-dark-green-s");
  });

  it("shows a checkmark for solved problems based on the hook value", () => {
    mockUseGetSolvedProblems.mockReturnValue(["two-sum"]);

    render(
      <table>
        <ProblemsTable problems={testProblems} />
      </table>,
    );

    const rows = screen.getAllByRole("row");
    // Checking the first data row for the green checkmark class
    const checkmark = rows[0].querySelector(".text-dark-green-s");
    expect(checkmark).toBeInTheDocument();
  });

  it("displays 'Coming soon' for problems without a videoId", () => {
    mockUseGetSolvedProblems.mockReturnValue([]);

    render(
      <table>
        <ProblemsTable problems={testProblems} />
      </table>,
    );

    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("opens the YouTube modal when clicking the video icon", () => {
    mockUseGetSolvedProblems.mockReturnValue([]);

    render(
      <table>
        <ProblemsTable problems={testProblems} />
      </table>,
    );

    // Find the SVG icon in the first row and click it
    const youtubeIcon = screen.getAllByRole("row")[0].querySelector("svg");
    fireEvent.click(youtubeIcon!);

    const player = screen.getByTestId("youtube-player");
    expect(player).toBeInTheDocument();
    expect(player).toHaveTextContent("8hly31xKli0");
  });
});
