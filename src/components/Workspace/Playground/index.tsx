"use client";
import React, { useState, useEffect, memo } from "react";
import PreferenceNav from "./PreferenceNav/PreferenceNav";
import Split from "react-split";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import EditorFooter from "./EditorFooter";
import { Problem } from "@/utils/types/problem";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/firebase/firebase";
import { toast } from "react-toastify";
import { problems } from "@/utils/problems";
import { usePathname } from "next/navigation";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import useLocalStorage from "@/hooks/useLocalStorage";

type PlaygroundProps = {
  problem: Problem;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setSolved: React.Dispatch<React.SetStateAction<boolean>>;
};

export interface ISettings {
  fontSize: string;
  settingsModalIsOpen: boolean;
  dropdownIsOpen: boolean;
}
const Playground = ({ problem, setSuccess, setSolved }: PlaygroundProps) => {
  const [activeTestCaseId, setActiveTestCaseId] = useState<number>(0);
  const [fontSize] = useLocalStorage("lcc-fontSize", "16px");
  const [settings, setSettings] = useState({
    fontSize,
    settingsModalIsOpen: false,
    dropdownIsOpen: false,
  });

  const [userCode, setUserCode] = useState<string>(problem.starterCode);
  const [user] = useAuthState(auth);
  const pathname = usePathname();
  const pid = pathname.split("/").pop();

  // Load initial code
  useEffect(() => {
    const savedCode = localStorage.getItem(`code-${pid}`);
    if (user) {
      setUserCode(savedCode ? JSON.parse(savedCode) : problem.starterCode);
    } else {
      setUserCode(problem.starterCode);
    }
  }, [pid, user, problem.starterCode]);

  // Performance Fix: Debounce localStorage save (1 second)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (user && pid) {
        localStorage.setItem(`code-${pid}`, JSON.stringify(userCode));
      }
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [userCode, pid, user]);

  const handleSubmit = async () => {
    if (!user) {
      return toast.error("Please login to submit your code", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
    }
    try {
      // Extract only the function part to avoid any weird prefixing issues
      const userCodeToRun = userCode.slice(
        userCode.indexOf(problem.starterFunctionName),
      );
      const cb = new Function(`return ${userCodeToRun}`)();

      // FIX: Type Guard for the handlerFunction
      const handler = problems[problem.id as string].handlerFunction;

      if (typeof handler === "function") {
        const success = handler(cb);
        if (success) {
          toast.success("Congrats! All tests passed!", {
            position: "top-center",
            autoClose: 3000,
            theme: "dark",
          });
          setSuccess(true);
          setTimeout(() => setSuccess(false), 4000);

          const userRef = doc(firestore, "users", user.uid);
          await updateDoc(userRef, {
            solvedProblems: arrayUnion(pid),
          });
          setSolved(true);
        }
      } else {
        throw new Error("Problem handler is not a valid function.");
      }
    } catch (error: any) {
      console.error(error.message);
      if (error.message.startsWith("AssertionError")) {
        toast.error("Oops! One or more test cases failed", { theme: "dark" });
      } else {
        toast.error(error.message, { theme: "dark" });
      }
    }
  };

  return (
    <div className="flex flex-col bg-dark-layer-1 relative overflow-x-hidden">
      <PreferenceNav settings={settings} setSettings={setSettings} />

      <Split
        className="h-[calc(100vh-94px)]"
        direction="vertical"
        sizes={[60, 40]}
        minSize={60}
      >
        <div className="w-full overflow-auto bg-[#1e1e1e]">
          <CodeMirror
            value={userCode}
            theme={vscodeDark}
            extensions={[javascript()]}
            onChange={(val) => setUserCode(val)}
            style={{ fontSize: settings.fontSize }}
          />
        </div>

        <div className="w-full px-5 overflow-auto pb-10">
          <div className="flex h-10 items-center space-x-6">
            <div className="relative flex h-full flex-col justify-center">
              <div className="text-sm font-medium text-white">Testcases</div>
              <hr className="absolute bottom-0 h-0.5 w-full rounded-full border-none bg-white" />
            </div>
          </div>

          <div className="flex mt-4">
            {problem.examples.map((example, index) => (
              <button
                key={example.id}
                onClick={() => setActiveTestCaseId(index)}
                className={`mr-2 rounded-lg px-4 py-1 text-sm font-medium transition-all focus:outline-none 
								${activeTestCaseId === index ? "text-white bg-dark-fill-2" : "text-gray-500 bg-dark-fill-3 hover:bg-dark-fill-2"}`}
              >
                Case {index + 1}
              </button>
            ))}
          </div>

          <div className="font-semibold my-4">
            <p className="text-sm font-medium mt-4 text-white">Input:</p>
            <div className="w-full rounded-lg px-3 py-[10px] bg-dark-fill-3 text-white mt-2 font-mono text-xs">
              {problem.examples[activeTestCaseId].inputText}
            </div>
            <p className="text-sm font-medium mt-4 text-white">Output:</p>
            <div className="w-full rounded-lg px-3 py-[10px] bg-dark-fill-3 text-white mt-2 font-mono text-xs">
              {problem.examples[activeTestCaseId].outputText}
            </div>
          </div>
        </div>
      </Split>
      <EditorFooter handleSubmit={handleSubmit} />
    </div>
  );
};

export default memo(Playground);
