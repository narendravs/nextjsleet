"use client";
import Topbar from "@/components/Topbar/Topbar";
import Workspace from "@/components/Workspace/Workspace";
import useHasMounted from "@/hooks/useHasMounted";
import { problems } from "@/utils/problems";
import { Problem } from "@/utils/types/problem";
import React, { useState } from "react";
//import { data } from "@/utils/problems/data";

// type ProblemPageProps = {
//   problem: Problem;
// };

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

// fetch the local data
//  SSG
// getStaticPaths => it create the dynamic routes
// export async function getStaticPaths() {
//   const paths = Object.keys(problems).map((key) => ({
//     params: { pid: key },
//   }));

//   return {
//     paths,
//     fallback: false,
//   };
// }

// // getStaticProps => it fetch the data

// export async function getStaticProps({ params }: { params: { pid: string } }) {
//   const { pid } = params;
//   const problem = problems[pid];

//   if (!problem) {
//     return {
//       notFound: true,
//     };
//   }
//   problem.handlerFunction = problem.handlerFunction.toString();
//   return {
//     props: {
//       problem,
//     },
//   };
// }

export default ProblemPage;
