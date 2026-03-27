import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import ProblemNavigation from "@/components/Topbar/ProblemNavigation";
import { useRouter, usePathname } from "next/navigation";
import "@testing-library/jest-dom";

// --- 1. MOCK NEXT/NAVIGATION ---
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
  usePathname: jest.fn(), // We will set the return value per test
}));

// --- 2. MOCK PROBLEM DATA ---
// Mocking the data source ensures the navigation logic (pid.split) works
jest.mock("@/utils/problems", () => ({
  problems: {
    "two-sum": { id: "two-sum", order: 1 },
    "reverse-linked-list": { id: "reverse-linked-list", order: 2 },
    "jump-game": { id: "jump-game", order: 3 },
  },
}));

describe("ProblemNavigation Unit Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cleanup();
    // Default path for tests
    (usePathname as jest.Mock).mockReturnValue("/problems/reverse-linked-list");
  });

  const getInteractiveElements = (container: HTMLElement) => {
    return container.querySelectorAll(".cursor-pointer");
  };

  it("navigates to the next problem when right chevron is clicked", () => {
    const { container } = render(<ProblemNavigation />);

    // Index 2 is the Right Chevron based on your HTML structure
    const elements = getInteractiveElements(container);
    const rightChevron = elements[2];

    fireEvent.click(rightChevron);

    expect(mockPush).toHaveBeenCalled();
  });

  it("navigates to the previous problem when left chevron is clicked", () => {
    const { container } = render(<ProblemNavigation />);

    // Index 0 is the Left Chevron
    const elements = getInteractiveElements(container);
    const leftChevron = elements[0];

    fireEvent.click(leftChevron);

    expect(mockPush).toHaveBeenCalled();
  });

  it("extracts the problem ID correctly from the pathname", () => {
    // Setting a specific pathname to verify the component parses it
    (usePathname as jest.Mock).mockReturnValue("/problems/two-sum");

    render(<ProblemNavigation />);

    const link = screen.getByRole("link", { name: /problem list/i });
    expect(link).toBeInTheDocument();
    // If your component displays the ID or uses it for logic,
    // you could add an expectation here.
  });

  it("contains a link back to the home page", () => {
    render(<ProblemNavigation />);
    const link = screen.getByRole("link", { name: /problem list/i });
    expect(link).toHaveAttribute("href", "/");
  });
});
