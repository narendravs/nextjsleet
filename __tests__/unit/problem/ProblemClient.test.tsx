import { render, screen } from "@testing-library/react";
import ProblemClient from "@/components/ProblemClient/ProblemClient";

// Mock child components
jest.mock("@/components/Topbar/Topbar", () => {
  return function DummyTopbar({ problemPage }: { problemPage?: boolean }) {
    return <div data-testid="topbar">{problemPage ? "Problem Page" : ""}</div>;
  };
});
jest.mock("@/components/Workspace/Workspace", () => {
  return function DummyWorkspace({ problemId }: { problemId: string }) {
    return <div data-testid="workspace">{problemId}</div>;
  };
});

describe("ProblemClient Unit Test", () => {
  it("renders Topbar and Workspace with correct props", () => {
    render(<ProblemClient problemId="two-sum" />);

    expect(screen.getByTestId("topbar")).toHaveTextContent("Problem Page");
    expect(screen.getByTestId("workspace")).toHaveTextContent("two-sum");
  });
});
