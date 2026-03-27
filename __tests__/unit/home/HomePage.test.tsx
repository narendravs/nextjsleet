import { render, screen } from "@testing-library/react";
import Home from "@/app/page"; // Adjust path based on your folder structure
import { getDocs } from "firebase/firestore";
import "@testing-library/jest-dom";

// --- 1. Mocks ---

// Mock Firebase SDK - This keeps the test "Pure" by avoiding real DB calls
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(),
}));

// Mock Firebase config
jest.mock("@/firebase/firebase", () => ({
  firestore: {},
}));

// Mock Child Components - Isolates Home logic from Topbar/Table logic
jest.mock("@/components/Topbar/Topbar", () => {
  return function MockTopbar() {
    return <div data-testid="topbar">Topbar Mock</div>;
  };
});

jest.mock("@/components/ProblemsTable/ProblemsTable", () => {
  return function MockProblemsTable({ problems }: { problems: any[] }) {
    return (
      <tbody data-testid="problems-table">
        {problems.map((p) => (
          <tr key={p.id}>
            <td>{p.title}</td>
          </tr>
        ))}
      </tbody>
    );
  };
});

describe("Home Page - Pure Unit Test Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Prevent console errors from cluttering the test output
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // --- Test Case 1: Successful Data Flow ---
  it("fetches problems and passes them to the ProblemsTable", async () => {
    const mockData = [
      { id: "p1", title: "Two Sum", order: 1 },
      { id: "p2", title: "Jump Game", order: 2 },
    ];

    // Simulate Firestore returning these two problems
    (getDocs as jest.Mock).mockResolvedValue({
      forEach: (callback: Function) => {
        mockData.forEach((item) => callback({ id: item.id, data: () => item }));
      },
    });

    // Handle the async Server Component
    const ResolvedHome = await Home();
    render(ResolvedHome);

    // Verify Main Layout
    expect(screen.getByText(/QUALITY OVER QUANTITY/i)).toBeInTheDocument();
    expect(screen.getByTestId("topbar")).toBeInTheDocument();

    // Verify Data reached the table
    expect(screen.getByText("Two Sum")).toBeInTheDocument();
    expect(screen.getByText("Jump Game")).toBeInTheDocument();
  });

  // --- Test Case 2: Error Handling ---
  it("handles Firestore failures gracefully by returning an empty list", async () => {
    (getDocs as jest.Mock).mockRejectedValue(new Error("Network Error"));

    const ResolvedHome = await Home();
    render(ResolvedHome);

    // Table should still render but be empty
    const tableBody = screen.getByTestId("problems-table");
    expect(tableBody.children.length).toBe(0);

    // Ensure the developer is notified via console
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching problems:",
      expect.any(Error),
    );
  });

  // --- Test Case 3: Static Table Headers ---
  it("renders the static table headers correctly", async () => {
    (getDocs as jest.Mock).mockResolvedValue({ forEach: () => {} });

    const ResolvedHome = await Home();
    render(ResolvedHome);

    const headers = ["Status", "Title", "Difficulty", "Category", "Solution"];
    headers.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });
});
