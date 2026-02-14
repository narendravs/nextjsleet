"use client";
import Topbar from "@/components/Topbar/Topbar";
import Workspace from "@/components/Workspace/Workspace";
import useHasMounted from "@/hooks/useHasMounted";
import { problems } from "@/utils/problems";

const ProblemPage = ({ params }: { params: { pid: string } }) => {
  const hasMounted = useHasMounted();
  if (!hasMounted) return null;
  const { pid } = params;

  const data = getStaticProp();

  function getStaticProp() {
    const problem = problems[pid];
    return problem;
  }

  return (
    <div>
      <Topbar problemPage />
      <Workspace problem={data} />
    </div>
  );
};

export default ProblemPage;
