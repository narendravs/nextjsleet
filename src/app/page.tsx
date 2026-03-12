import React from "react";
import Topbar from "@/components/Topbar/Topbar";
import ProblemsTable from "@/components/ProblemsTable/ProblemsTable";
import { firestore } from "@/firebase/firebase";
import { DBProblem } from "@/utils/types/problem";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

/**
 * Fetches the list of problems from Firestore, ordered by their 'order' field.
 * This function is designed to be run on the server.
 * @returns A promise that resolves to an array of problems.
 */
async function getProblems() {
  if (!firestore) return [];
  try {
    const q = query(collection(firestore, "problems"), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);
    const problems: DBProblem[] = [];
    querySnapshot.forEach((doc) => {
      problems.push({ id: doc.id, ...doc.data() } as DBProblem);
    });
    return problems;
  } catch (error) {
    console.error("Error fetching problems:", error);
    return [];
  }
}

export default async function Home() {
  const problems = await getProblems();

  return (
    <main className="bg-dark-layer-2 min-h-screen">
      <Topbar />
      <h1 className="text-2xl text-center text-gray-700 dark:text-gray-400 font-medium uppercase mt-10 mb-5">
        &ldquo; QUALITY OVER QUANTITY &rdquo;
      </h1>
      <div className="relative overflow-x-auto mx-auto px-6 pb-10">
        <table className="text-sm text-left text-gray-500 dark:text-gray-400 sm:w-7/12 w-full mx-auto max-w-[1200px]">
          <thead className="text-xs text-gray-700 uppercase dark:text-gray-400 border-b ">
            <tr>
              <th scope="col" className="px-1 py-3 w-0 font-medium">
                Status
              </th>
              <th scope="col" className="px-6 py-3 w-0 font-medium">
                Title
              </th>
              <th scope="col" className="px-6 py-3 w-0 font-medium">
                Difficulty
              </th>
              <th scope="col" className="px-6 py-3 w-0 font-medium">
                Category
              </th>
              <th scope="col" className="px-6 py-3 w-0 font-medium">
                Solution
              </th>
            </tr>
          </thead>
          <ProblemsTable problems={problems} />
        </table>
      </div>
    </main>
  );
}
