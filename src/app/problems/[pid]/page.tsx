import { problems } from "@/utils/problems";
import { Metadata } from "next";
import dynamic from "next/dynamic";

// Dynamically import ProblemClient with SSR disabled to prevent Firebase initialization errors
const ProblemClient = dynamic(
  () => import("@/components/ProblemClient/ProblemClient"),
  {
    ssr: false,
    loading: () => (
      <div
        className="bg-dark-layer-1 h-screen flex items-center justify-center text-white"
        role="status"
        aria-live="polite"
      >
        Loading problem…
      </div>
    ),
  },
);

type Props = {
  params: Promise<{ pid: string }>; // 1. Update type to a Promise
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pid } = await params;
  const problem = problems[pid];

  if (!problem) {
    return { title: "Problem Not Found" };
  }

  return {
    title: `${problem.title} | LeetCode Clone`,
    description: `Solve the ${problem.title} problem.`,
  };
}

const ProblemPage = async ({ params }: Props) => {
  const { pid } = await params;

  const problem = problems[pid];

  if (!problem) {
    return (
      <div className="bg-dark-layer-1 h-screen flex items-center justify-center text-white">
        <h1 className="text-2xl font-bold">Problem not found</h1>
      </div>
    );
  }

  // Pass the data down to the Client Component
  return <ProblemClient problemId={pid} />;
};

export default ProblemPage;
