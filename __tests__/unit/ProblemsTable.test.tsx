import { render, screen, fireEvent } from "@testing-library/react";
import ProblemsTable from "../../src/components/ProblemsTable/ProblemsTable";
import {
  useGetProblems,
  useGetSolvedProblems,
} from "../../src/hooks/useProblemsTable";
import "@testing-library/jest-dom";
import { DBProblem } from "../../src/utils/types/problem";

// --- Mocks ---

// Mock the custom hooks module. This is the key to making this a unit test.
// We are isolating the ProblemsTable component from its data-fetching logic.
jest.mock("../../src/hooks/useProblemsTable");

// Mock Next.js Link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock react-youtube
jest.mock("react-youtube", () => ({
  __esModule: true,
  default: ({ videoId }: { videoId: string }) => (
    <div data-testid="youtube-player">{videoId}</div>
  ),
}));

// Cast mocks for TypeScript to give us type safety
const useGetProblemsMock = useGetProblems as jest.Mock;
const useGetSolvedProblemsMock = useGetSolvedProblems as jest.Mock;

describe("ProblemsTable Component (Unit Test)", () => {
  const mockSetLoadingProblems = jest.fn();

  // Define mock data that the component will receive from the mocked hooks
  const mockProblems: DBProblem[] = [
    {
      id: "1",
      title: "Two Sum",
      difficulty: "Easy",
      category: "Array",
      order: 1,
      videoId: "vid1",
      likes: 0,
      dislikes: 0,
      link: "",
    },
    {
      id: "2",
      title: "Reverse Linked List",
      difficulty: "Medium",
      category: "LinkedList",
      order: 2,
      videoId: "", // No video
      likes: 0,
      dislikes: 0,
      link: "",
    },
    {
      id: "3",
      title: "Hard Problem",
      difficulty: "Hard",
      category: "DP",
      order: 3,
      videoId: "vid3",
      likes: 0,
      dislikes: 0,
      link: "",
    },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it("renders problems with correct data, styles, and solved status", () => {
    // 1. Arrange: Provide data directly from the mocked hooks
    useGetProblemsMock.mockReturnValue(mockProblems);
    useGetSolvedProblemsMock.mockReturnValue(["1"]); // "Two Sum" is marked as solved

    // 2. Act: Render the component
    render(
      <table>
        <ProblemsTable setLoadingProblems={mockSetLoadingProblems} />
      </table>,
    );

    // 3. Assert: Check if the component rendered the provided data correctly
    expect(screen.getByText("Two Sum")).toBeInTheDocument();
    expect(screen.getByText("Reverse Linked List")).toBeInTheDocument();

    // Assert solved status (checkmark for "Two Sum")
    const rows = screen.getAllByRole("row");
    expect(rows[0].querySelector("th svg")).toBeInTheDocument(); // First row has checkmark
    expect(rows[1].querySelector("th svg")).not.toBeInTheDocument(); // Second row does not

    // Assert difficulty colors
    expect(screen.getByText("Easy")).toHaveClass("text-dark-green-s");
    expect(screen.getByText("Medium")).toHaveClass("text-dark-yellow");
    expect(screen.getByText("Hard")).toHaveClass("text-dark-pink");

    // Assert "Coming soon" for problem with no videoId
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("opens and closes the YouTube modal on click", () => {
    // 1. Arrange
    useGetProblemsMock.mockReturnValue(mockProblems);
    useGetSolvedProblemsMock.mockReturnValue([]);

    // 2. Act
    render(
      <table>
        <ProblemsTable setLoadingProblems={mockSetLoadingProblems} />
      </table>,
    );

    // Assert modal is initially closed
    expect(screen.queryByTestId("youtube-player")).not.toBeInTheDocument();

    // Find the YouTube icon in the first row
    const rows = screen.getAllByRole("row");
    const youtubeIcon = rows[0].querySelector("td:last-child svg");
    expect(youtubeIcon).toBeInTheDocument();

    // 3. Act: Click the icon to open the modal
    fireEvent.click(youtubeIcon!);

    // 4. Assert: Modal is open and shows the correct video
    const player = screen.getByTestId("youtube-player");
    expect(player).toBeInTheDocument();
    expect(player).toHaveTextContent("vid1");

    // 5. Act: Click the close button
    // The close icon is the first SVG inside the player's parent element
    const closeIcon = screen
      .getByTestId("youtube-player")
      .parentElement!.querySelector("svg");
    expect(closeIcon).toBeInTheDocument();
    fireEvent.click(closeIcon!);

    // 6. Assert: Modal is closed
    expect(screen.queryByTestId("youtube-player")).not.toBeInTheDocument();
  });
});
