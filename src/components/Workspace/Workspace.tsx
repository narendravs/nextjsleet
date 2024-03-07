"use client ";
import React, { useState } from "react";
import { Problem } from "@/utils/types/problem";
import useWindowSize from "@/hooks/useWindowSize";
import ProblemDescription from "./ProblemDescription";
import Playground from "./Playground";
import Split from "react-split";
import Confetti from "react-confetti";

type WorkspaceProps = {
  problem: Problem;
};
const Workspace = ({ problem }: WorkspaceProps) => {
  const { width, height } = useWindowSize();
  const [success, setSuccess] = useState(false);
  const [solved, setSolved] = useState(false);

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
          />
        )}
      </div>
    </Split>
  );
};
export default Workspace;
