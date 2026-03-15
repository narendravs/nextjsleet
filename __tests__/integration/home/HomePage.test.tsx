import { render, screen, waitFor } from "@testing-library/react";
import ProblemsTable from "@/components/ProblemsTable/ProblemsTable";
import { useAuthState } from "react-firebase-hooks/auth";
import { getDocs, getDoc } from "firebase/firestore";
import "@testing-library/jest-dom";

// --- Mocks ---

// Mock react-firebase-hooks
jest.mock("react-firebase-hooks/auth", () => ({
  useAuthState: jest.fn(),
}));

// Mock firebase/firestore
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  orderBy: jest.fn(),
  query: jest.fn(),
  getFirestore: jest.fn(),
}));

// Mock the firebase instance
jest.mock("@/firebase/firebase", () => ({
  auth: {},
  firestore: {},
}));

// Mock Next.js Link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock react-youtube to avoid loading external scripts in test
jest.mock("react-youtube", () => {
  return {
    __esModule: true,
    default: () => <div data-testid="youtube-player">YouTube Player</div>,
  };
});

describe("HomePage Integration (ProblemsTable)", () => {
  const mockSetLoadingProblems = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches and displays a list of problems", async () => {
    // 1. Mock Auth State (User not logged in)
    (useAuthState as jest.Mock).mockReturnValue([null, false, null]);

    // 2. Mock Firestore Data for Problems
    const mockProblemsData = [
      {
        id: "two-sum",
        title: "Two Sum",
        difficulty: "Easy",
        category: "Array",
        order: 1,
        videoId: "vid1",
      },
      {
        id: "reverse-linked-list",
        title: "Reverse Linked List",
        difficulty: "Hard",
        category: "LinkedList",
        order: 2,
        videoId: "",
      },
    ];

    // Mock the snapshot returned by getDocs
    const mockSnapshot = {
      forEach: (callback: any) => {
        mockProblemsData.forEach((data) =>
          callback({ id: data.id, data: () => data }),
        );
      },
    };
    (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

    // 3. Render the component (wrapped in table/tbody because ProblemsTable renders tr elements)
    render(
      <table>
        <ProblemsTable {...({ 
            setLoadingProblems: mockSetLoadingProblems 
          } as any)} />
      </table>,
    );

    // 4. Assertions
    // Check if loading was triggered
    expect(mockSetLoadingProblems).toHaveBeenCalledWith(true);

    // Wait for data to appear
    await waitFor(() => {
      expect(screen.getByText("Two Sum")).toBeInTheDocument();
    });

    expect(screen.getByText("Reverse Linked List")).toBeInTheDocument();
    expect(screen.getByText("Easy")).toBeInTheDocument();
    expect(screen.getByText("Hard")).toBeInTheDocument();
    expect(screen.getByText("Array")).toBeInTheDocument();

    // Check if loading was finished
    expect(mockSetLoadingProblems).toHaveBeenCalledWith(false);
  });

  it("shows checkmark for solved problems when user is logged in", async () => {
    // 1. Mock Auth State (User logged in)
    const mockUser = { uid: "user123" };
    (useAuthState as jest.Mock).mockReturnValue([mockUser, false, null]);

    // 2. Mock Firestore Data (Problems)
    const mockProblemsData = [
      {
        id: "two-sum",
        title: "Two Sum",
        difficulty: "Easy",
        category: "Array",
        order: 1,
        videoId: "",
      },
    ];
    const mockSnapshot = {
      forEach: (callback: any) => {
        mockProblemsData.forEach((data) =>
          callback({ id: data.id, data: () => data }),
        );
      },
    };
    (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

    // 3. Mock User Data (Solved Problems)
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ solvedProblems: ["two-sum"] }),
    });

    render(
      <table>
        <ProblemsTable {...({ 
            setLoadingProblems: mockSetLoadingProblems 
          } as any)}/>
      </table>,
    );

    // 4. Assertions
    await waitFor(() => {
      expect(screen.getByText("Two Sum")).toBeInTheDocument();
    });

    // Check for the checkmark icon (react-icons usually render as svg)
    // We can check if the SVG is present in the first column
    const rows = screen.getAllByRole("row");
    // Row 0 is usually header if it exists, but ProblemsTable only has tbody.
    // So Row 0 is the first problem.
    const firstRow = rows[0];
    const checkmarkCell = firstRow.querySelector("th"); // The first cell is a <th>
    expect(checkmarkCell).toContainHTML("svg");
  });
});
