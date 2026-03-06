"use client";

import Topbar from "@/components/Topbar/Topbar";
import Workspace from "@/components/Workspace/Workspace";

type ProblemClientProps = {
  problemId: string;
};

const ProblemClient = ({ problemId }: ProblemClientProps) => {
  return (
    <div>
      <Topbar problemPage />
      <Workspace problemId={problemId} />
    </div>
  );
};

export default ProblemClient;
