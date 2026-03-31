import { render, screen } from "@testing-library/react";
import ProblemPage, { generateMetadata } from "@/app/problems/[pid]/page";

// 1. Mock the client component
jest.mock("@/components/ProblemClient/ProblemClient", () => {
  return function DummyProblemClient({ problemId }: { problemId: string }) {
    return <div data-testid="problem-client">{problemId}</div>;
  };
});

describe("ProblemPage (Server Component)", () => {
  describe("generateMetadata", () => {
    it("should generate correct metadata for a valid problem", async () => {
      const metadata = await generateMetadata({ params: { pid: "two-sum" } });

      // FIX: Added the "1. " prefix to match your actual implementation
      expect(metadata.title).toBe("1. Two Sum | LeetCode Clone");
      expect(metadata.description).toBe("Solve the 1. Two Sum problem.");
    });

    it("should generate 'Not Found' metadata for an invalid problem", async () => {
      const metadata = await generateMetadata({
        params: { pid: "invalid-problem" },
      });
      expect(metadata.title).toBe("Problem Not Found");
    });
  });

  describe("Page Component", () => {
    it("should render the ProblemClient for a valid problem ID", async () => {
      // Resolve the Server Component
      const PageComponent = await ProblemPage({ params: { pid: "two-sum" } });
      render(PageComponent);

      // FIX: Use findByTestId to wait for the "Loading..." state to finish
      const clientComponent = await screen.findByTestId("problem-client");

      expect(clientComponent).toBeInTheDocument();
      expect(clientComponent).toHaveTextContent("two-sum");
    });

    it("should render a 'not found' message for an invalid problem ID", async () => {
      const PageComponent = await ProblemPage({
        params: { pid: "invalid-problem" },
      });
      render(PageComponent);

      expect(
        screen.getByRole("heading", { name: /problem not found/i }),
      ).toBeInTheDocument();
      expect(screen.queryByTestId("problem-client")).not.toBeInTheDocument();
    });
  });
});
