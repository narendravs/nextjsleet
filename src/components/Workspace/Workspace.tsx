"use client ";
import React, { useState } from "react";
import { Problem } from "@/utils/types/problem";
import useWindowSize from "@/hooks/useWindowSize";
import ProblemDescription from "./ProblemDescription";
import Playground from "./Playground";
import { problems } from "@/utils/problems";
import dynamic from "next/dynamic";

// 1. Heavy components loaded only on the client to save TBT
const Split = dynamic(() => import("react-split"), { ssr: false });
const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

type WorkspaceProps = {
  problemId: string;
};
const Workspace = ({ problemId }: WorkspaceProps) => {
  const { width, height } = useWindowSize();
  const [success, setSuccess] = useState(false);
  const [solved, setSolved] = useState(false);
  const problem: Problem = problems[problemId];
  return (
    <Split className="split" minSize={0}>
      <ProblemDescription problem={problem} _solved={solved} />
      <div className="bg-dark-layer-1">
        <Playground
          problem={problem}
          setSuccess={setSuccess}
          setSolved={setSolved}
        />
        {success && (
          <Confetti
            gravity={0.3}
            tweenDuration={4000}
            width={width - 1}
            height={height - 1}
            style={{ pointerEvents: "none" }}
          />
        )}
      </div>
    </Split>
  );
};
export default Workspace;
