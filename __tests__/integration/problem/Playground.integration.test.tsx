import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Playground from "@/components/Workspace/Playground";
import { problems } from "@/utils/problems";
import { useAuthState } from "react-firebase-hooks/auth";
import { updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
// 1. Mocking External Modules
jest.mock("react-firebase-hooks/auth");
jest.mock("firebase/firestore");
jest.mock("next/navigation", () => ({
  usePathname: () => "/problems/two-sum",
}));
jest.mock("react-toastify");

// Mock CodeMirror to avoid rendering complexity
jest.mock("@uiw/react-codemirror", () => {
  return function MockCodeMirror({ value, onChange }: any) {
    return (
      <textarea
        data-testid="codemirror-mock"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };
});

describe("Playground Integration", () => {
  const mockProblem = problems["two-sum"];
  const setSuccess = jest.fn();
  const setSolved = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: Logged in user
    (useAuthState as jest.Mock).mockReturnValue([{ uid: "user-123" }, false]);
    // Mock localStorage
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
  });

  it("renders the starter code and first test case by default", () => {
    render(
      <Playground
        problem={mockProblem}
        setSuccess={setSuccess}
        setSolved={setSolved}
      />,
    );

    const editor = screen.getByTestId("codemirror-mock");
    expect(editor).toHaveValue(mockProblem.starterCode);

    // Check if first test case input is visible
    expect(
      screen.getByText(mockProblem.examples[0].inputText),
    ).toBeInTheDocument();
  });

  it("switches test cases when clicking on Case buttons", () => {
    render(
      <Playground
        problem={mockProblem}
        setSuccess={setSuccess}
        setSolved={setSolved}
      />,
    );

    // Click on Case 2 (assuming Two Sum has multiple examples)
    const case2Btn = screen.getByText(/Case 2/i);
    fireEvent.click(case2Btn);

    expect(
      screen.getByText(mockProblem.examples[1].inputText),
    ).toBeInTheDocument();
  });

  it("shows error toast if user tries to submit without logging in", async () => {
    // Mock no user
    (useAuthState as jest.Mock).mockReturnValue([null, false]);

    render(
      <Playground
        problem={mockProblem}
        setSuccess={setSuccess}
        setSolved={setSolved}
      />,
    );

    const submitBtn = screen.getByText(/Submit/i);
    fireEvent.click(submitBtn);

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("login to submit"),
      expect.any(Object),
    );
  });

  it("successfully runs the code and updates Firebase on success", async () => {
    render(
      <Playground
        problem={mockProblem}
        setSuccess={setSuccess}
        setSolved={setSolved}
      />,
    );

    const editor = screen.getByTestId("codemirror-mock");

    // Provide a real working solution for Two Sum
    const validSolution = `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
      const complement = target - nums[i];
      if (map.has(complement)) return [map.get(complement), i];
      map.set(nums[i], i);
    }
  };`;

    fireEvent.change(editor, { target: { value: validSolution } });

    const submitBtn = screen.getByText(/Submit/i);
    fireEvent.click(submitBtn);

    // Use a slightly higher timeout for the async operations
    await waitFor(
      () => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining("Congrats"),
          expect.any(Object),
        );
        expect(setSuccess).toHaveBeenCalledWith(true);
        expect(setSolved).toHaveBeenCalledWith(true);
      },
      { timeout: 4000 },
    );
  });

  it("saves code to localStorage on change (debounced)", async () => {
    jest.useFakeTimers();
    render(
      <Playground
        problem={mockProblem}
        setSuccess={setSuccess}
        setSolved={setSolved}
      />,
    );

    const editor = screen.getByTestId("codemirror-mock");
    fireEvent.change(editor, { target: { value: "new code change" } });

    // Fast-forward time for debounce
    jest.advanceTimersByTime(1000);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      expect.stringContaining("code-two-sum"),
      JSON.stringify("new code change"),
    );
    jest.useRealTimers();
  });
});
