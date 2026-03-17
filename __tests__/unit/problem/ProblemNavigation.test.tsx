import { render, screen, fireEvent } from "@testing-library/react";
import ProblemNavigation from "@/components/Topbar/ProblemNavigation";
import { useRouter, usePathname } from "next/navigation";

// Mock the router hooks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const mockUsePathname = usePathname as jest.Mock;

describe("ProblemNavigation Unit Test", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
  });

  it("navigates to the next problem when right chevron is clicked", () => {
    // Current problem is 'two-sum', which has order: 1
    mockUsePathname.mockReturnValue("/problems/two-sum");
    render(<ProblemNavigation />);

    const rightChevron = screen.getAllByRole("button")[1];
    fireEvent.click(rightChevron);

    // Next problem is 'reverse-linked-list', which has order: 2
    expect(mockPush).toHaveBeenCalledWith("/problems/reverse-linked-list");
  });

  it("navigates to the previous problem when left chevron is clicked", () => {
    // Current problem is 'reverse-linked-list', which has order: 2
    mockUsePathname.mockReturnValue("/problems/reverse-linked-list");
    render(<ProblemNavigation />);

    const leftChevron = screen.getAllByRole("button")[0];
    fireEvent.click(leftChevron);

    // Previous problem is 'two-sum', which has order: 1
    expect(mockPush).toHaveBeenCalledWith("/problems/two-sum");
  });

  it("wraps to the first problem from the last one", () => {
    // Assuming 'best-time-to-buy-and-sell-stock' is the last problem
    mockUsePathname.mockReturnValue(
      "/problems/best-time-to-buy-and-sell-stock",
    );
    render(<ProblemNavigation />);

    const rightChevron = screen.getAllByRole("button")[1];
    fireEvent.click(rightChevron);

    // Should wrap to the first problem, 'two-sum'
    expect(mockPush).toHaveBeenCalledWith("/problems/two-sum");
  });
});
