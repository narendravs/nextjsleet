import { render, screen } from "@testing-library/react";
import ProblemClient from "@/components/ProblemClient/ProblemClient";

// 1. Mock the Child Components to ensure isolation (Pure Unit Test)
jest.mock("@/components/Topbar/Topbar", () => {
  return function DummyTopbar({ problemPage }: { problemPage?: boolean }) {
    return (
      <div data-testid="mock-topbar">
        {problemPage ? "Topbar: Problem Mode" : "Topbar: Standard Mode"}
      </div>
    );
  };
});

jest.mock("@/components/Workspace/Workspace", () => {
  return function DummyWorkspace({ problemId }: { problemId: string }) {
    return <div data-testid="mock-workspace">Workspace ID: {problemId}</div>;
  };
});

describe("ProblemClient (Unit)", () => {
  const MOCK_ID = "dynamic-programming-1";

  it("renders the Topbar with the problemPage prop enabled", () => {
    render(<ProblemClient problemId={MOCK_ID} />);

    const topbar = screen.getByTestId("mock-topbar");
    expect(topbar).toBeInTheDocument();
    expect(topbar).toHaveTextContent("Topbar: Problem Mode");
  });

  it("renders the Workspace and passes the correct problemId", () => {
    render(<ProblemClient problemId={MOCK_ID} />);

    const workspace = screen.getByTestId("mock-workspace");
    expect(workspace).toBeInTheDocument();
    expect(workspace).toHaveTextContent(`Workspace ID: ${MOCK_ID}`);
  });

  it("maintains the correct layout structure", () => {
    const { container } = render(<ProblemClient problemId={MOCK_ID} />);

    // Verify Topbar comes before Workspace in the DOM
    const topbar = screen.getByTestId("mock-topbar");
    const workspace = screen.getByTestId("mock-workspace");

    expect(container.firstChild?.childNodes[0]).toBe(topbar);
    expect(container.firstChild?.childNodes[1]).toBe(workspace);
  });
});
