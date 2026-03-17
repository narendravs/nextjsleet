"use client";
import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { BsList } from "react-icons/bs";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { problems } from "@/utils/problems";
import { Problem } from "@/utils/types/problem";

const ProblemNavigation = () => {
  const router = useRouter();
  const path = usePathname();
  const pid = path.split("/").pop();

  const handleProblemChange = (isForward: boolean) => {
    // 1. SAFETY CHECK: If pid is null or doesn't exist in our mock data, stop.
    if (!pid || !problems[pid]) {
      console.error("Problem not found in local mapping:", pid);
      return;
    }

    const { order } = problems[pid] as Problem;
    const direction = isForward ? 1 : -1;
    const nextProblemOrder = order + direction;

    const nextProblemKey = Object.keys(problems).find(
      (key) => problems[key].order === nextProblemOrder,
    );

    if (!nextProblemKey) {
      const edgeKey = isForward
        ? Object.keys(problems).find((k) => problems[k].order === 1)
        : Object.keys(problems).find(
            (k) => problems[k].order === Object.keys(problems).length,
          );
      router.push(`/problems/${edgeKey}`);
    } else {
      router.push(`/problems/${nextProblemKey}`);
    }
  };

  return (
    <div className="flex items-center justify-start gap-4 flex-1">
      <div
        className="flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer"
        onClick={() => handleProblemChange(false)}
      >
        <FaChevronLeft />
      </div>
      <Link
        href="/"
        className="flex items-center gap-2 font-medium max-w-[170px] text-dark-gray-8 cursor-pointer"
      >
        <BsList />
        <p>Problem List</p>
      </Link>
      <div
        className="flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer"
        onClick={() => handleProblemChange(true)}
      >
        <FaChevronRight />
      </div>
    </div>
  );
};

export default ProblemNavigation;
