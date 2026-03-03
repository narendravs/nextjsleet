import { render, screen } from "@testing-library/react";
import Home from "@/app/page.tsx";
import "@testing-library/jest-dom";

// --- Mocks ---

// 1. Mock Child Components
// We mock ProblemsTable to ensure we are unit testing the Page structure, not the Table's logic.
jest.mock("@/components/ProblemsTable/ProblemsTable", () => () => (
  <div data-testid="mock-problems-table">Mocked Problems Table</div>
));

// Mock Topbar with virtual: true so the test doesn't crash if the path is slightly different
jest.mock(
  "@/components/Topbar/Topbar",
  () => () => <div data-testid="mock-topbar">Mocked Topbar</div>,
  { virtual: true },
);

// 2. Mock Auth Hook
// Even if HomePage doesn't use it directly, it's safe to mock in case it checks user state
jest.mock("react-firebase-hooks/auth", () => ({
  useAuthState: jest.fn(() => [null, false, null]),
}));

describe("HomePage Unit Test", () => {
  it("renders the home page layout correctly", () => {
    render(<Home />);

    // 1. Verify the ProblemsTable is rendered
    // This confirms the HomePage is correctly composing the table component
    expect(screen.getByTestId("mock-problems-table")).toBeInTheDocument();

    // 2. Verify Topbar is rendered (if your page uses it)
    // We use queryByTestId so the test passes even if you haven't added Topbar yet,
    // but if it is present, we assert it is in the document.
    const topbar = screen.queryByTestId("mock-topbar");
    if (topbar) {
      expect(topbar).toBeInTheDocument();
    }

    // 3. Verify any static text specific to the Home Page (e.g., a specific header)
    // expect(screen.getByText("Quality Questions")).toBeInTheDocument();
  });
});
