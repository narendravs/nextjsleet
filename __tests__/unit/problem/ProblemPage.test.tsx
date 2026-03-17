import { render, screen } from "@testing-library/react";
import ProblemPage, { generateMetadata } from "@/app/problems/[pid]/page";
import { problems } from "@/utils/problems";

// Mock the client component that is dynamically imported
jest.mock("@/components/ProblemClient/ProblemClient", () => {
  return function DummyProblemClient({ problemId }: { problemId: string }) {
    return <div data-testid="problem-client">{problemId}</div>;
  };
});

describe("ProblemPage (Server Component)", () => {
  describe("generateMetadata", () => {
    it("should generate correct metadata for a valid problem", async () => {
      const metadata = await generateMetadata({ params: { pid: "two-sum" } });
      expect(metadata.title).toBe("Two Sum | LeetCode Clone");
      expect(metadata.description).toBe("Solve the Two Sum problem.");
    });

    it("should generate 'Not Found' metadata for an invalid problem", async () => {
      const metadata = await generateMetadata({
        params: { pid: "invalid-problem" },
      });
      expect(metadata.title).toBe("Problem Not Found");
    });
  });

  describe("Page Component", () => {
    // To test async Server Components, we need to resolve the promise they return
    it("should render the ProblemClient for a valid problem ID", async () => {
      const PageComponent = await ProblemPage({ params: { pid: "two-sum" } });
      render(PageComponent);

      const clientComponent = screen.getByTestId("problem-client");
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
