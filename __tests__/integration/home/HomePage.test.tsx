import {
  render,
  screen,
  fireEvent,
  waitFor,
  renderHook,
} from "@testing-library/react";
import ProblemsTable from "@/components/ProblemsTable/ProblemsTable";
import { useGetSolvedProblems } from "@/hooks/useProblemsTable";
import { useAuthState } from "react-firebase-hooks/auth";
import { getDoc } from "firebase/firestore";
import "@testing-library/jest-dom";

// 1. MOCK ALL EXTERNAL DEPENDENCIES
jest.mock("react-firebase-hooks/auth", () => ({
  useAuthState: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock("@/firebase/firebase", () => ({
  auth: {},
  firestore: {},
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

jest.mock("react-youtube", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-youtube-player" />,
}));

// 2. DATA CONSTANTS
const mockUser = { uid: "user_123" };
const mockProblems = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Array",
    order: 1,
    videoId: "8-lsX3-05B4",
    likes: 0,
    dislikes: 0,
    link: "",
  },
];

// 3. HOOK UNIT TESTS
describe("useGetSolvedProblems Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("should return empty array when no user is logged in", () => {
    (useAuthState as jest.Mock).mockReturnValue([null, false]);
    const { result } = renderHook(() => useGetSolvedProblems());
    expect(result.current).toEqual([]);
  });

  it("should sync localStorage and Firestore data", async () => {
    (useAuthState as jest.Mock).mockReturnValue([mockUser, false]);
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ solvedProblems: ["two-sum"] }),
    });

    const { result } = renderHook(() => useGetSolvedProblems());

    await waitFor(() => {
      expect(result.current).toContain("two-sum");
      expect(localStorage.getItem(`solvedProblems-${mockUser.uid}`)).toContain(
        "two-sum",
      );
    });
  });
});

// 4. COMPONENT INTEGRATION TESTS
describe("ProblemsTable & UI Functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders problem list and shows checkmarks when hook returns solved data", async () => {
    // 1. Mock the hook used inside the component
    // We treat the hook as an internal part of the component logic
    (useAuthState as jest.Mock).mockReturnValue([mockUser, false]);
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ solvedProblems: ["two-sum"] }),
    });

    render(
      <table>
        <ProblemsTable problems={mockProblems} />
      </table>,
    );

    // Verify Title
    expect(screen.getByText("Two Sum")).toBeInTheDocument();

    // Verify checkmark appears after mount and hook fetch
    await waitFor(() => {
      expect(screen.getByText("Solved")).toBeInTheDocument();
    });
  });

  it("opens modal on YouTube icon click and closes on Escape", async () => {
    (useAuthState as jest.Mock).mockReturnValue([null, false]);

    render(
      <table>
        <ProblemsTable problems={mockProblems} />
      </table>,
    );

    // Open Modal
    const youtubeIcon = screen.getByLabelText(/Watch solution for Two Sum/i);
    fireEvent.click(youtubeIcon);

    // Use findByTestId to wait for the dynamic component to swap from 'loading' to the mock
    const player = await screen.findByTestId(
      "mock-youtube-player",
      {},
      { timeout: 3000 },
    );
    expect(player).toBeInTheDocument();

    // Close Modal via Escape
    fireEvent.keyDown(window, { key: "Escape", code: "Escape" });
    await waitFor(() => {
      expect(
        screen.queryByTestId("mock-youtube-player"),
      ).not.toBeInTheDocument();
    });
  });
});
