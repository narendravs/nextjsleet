"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BsCheckCircle } from "react-icons/bs";
import { AiFillYoutube } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import { useGetSolvedProblems } from "@/hooks/useProblemsTable";
import { DBProblem } from "@/utils/types/problem";
import dynamic from "next/dynamic";
import { YouTubeProps } from "react-youtube";

const YouTube = dynamic(
  () => import("react-youtube").then((mod) => (mod as any).default || mod),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] w-full bg-dark-layer-1 animate-pulse rounded-md flex items-center justify-center">
        <span className="text-white-500">Loading Video Player...</span>
      </div>
    ),
  },
) as React.FC<YouTubeProps>;

type ProblemsTableProps = {
  problems: DBProblem[];
};

const ProblemsTable: React.FC<ProblemsTableProps> = ({ problems }) => {
  const [youtubePlayer, setYoutubePlayer] = useState({
    isOpen: false,
    videoId: "",
  });
  const [hasMounted, setHasMounted] = useState(false); // Fix for Hydration
  const solvedProblems = useGetSolvedProblems();

  const closeModal = () => setYoutubePlayer({ isOpen: false, videoId: "" });

  useEffect(() => {
    setHasMounted(true); // Component has mounted on client
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube.com") return;
      // Handle YouTube messages
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <>
      <tbody className="text-white">
        {problems.map((problem, idx) => {
          const difficulyColor =
            problem.difficulty === "Easy"
              ? "text-dark-green-s"
              : problem.difficulty === "Medium"
                ? "text-dark-yellow"
                : "text-dark-pink";

          return (
            <tr
              className={`${idx % 2 === 1 ? "bg-dark-layer-1" : ""}`}
              key={problem.id}
            >
              <th className="px-2 py-4 font-medium whitespace-nowrap text-dark-green-s">
                {/* Prevent hydration mismatch by only showing icons after mount */}
                {hasMounted && solvedProblems.includes(problem.id) && (
                  <>
                    <BsCheckCircle
                      fontSize={"18"}
                      width="18"
                      aria-hidden="true"
                    />
                    <span className="sr-only">Solved</span>
                  </>
                )}
              </th>
              <td className="px-6 py-4">
                {problem.link ? (
                  <Link
                    href={problem.link}
                    className="hover:text-blue-600"
                    target="_blank"
                  >
                    {problem.title}
                  </Link>
                ) : (
                  <Link
                    className="hover:text-blue-600"
                    href={`/problems/${problem.id}`}
                  >
                    {problem.title}
                  </Link>
                )}
              </td>
              <td className={`px-6 py-4 ${difficulyColor}`}>
                {problem.difficulty}
              </td>
              <td className="px-6 py-4">{problem.category}</td>
              <td className="px-6 py-4">
                {problem.videoId ? (
                  <AiFillYoutube
                    role="button"
                    aria-label={`Watch solution for ${problem.title}`}
                    fontSize={"28"}
                    className="cursor-pointer hover:text-red-600"
                    onClick={() =>
                      setYoutubePlayer({
                        isOpen: true,
                        videoId: problem.videoId as string,
                      })
                    }
                  />
                ) : (
                  <p className="text-gray-400">Coming soon</p>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>

      {/* RENDER MODAL VIA PORTAL TO PREVENT <div> INSIDE <table> ERROR */}
      {hasMounted &&
        youtubePlayer.isOpen &&
        createPortal(
          <div className="fixed top-0 left-0 h-screen w-screen flex items-center justify-center z-50">
            <div
              className="bg-black z-10 opacity-70 top-0 left-0 w-full h-full absolute"
              onClick={closeModal}
            ></div>
            <div className="w-full z-50 h-full px-6 relative max-w-4xl flex items-center justify-center">
              <div className="w-full relative">
                <IoClose
                  fontSize={"35"}
                  role="button"
                  aria-label="Close video player"
                  className="cursor-pointer absolute -top-16 right-0 text-white"
                  onClick={closeModal}
                />
                <YouTube
                  videoId={youtubePlayer.videoId}
                  onReady={(event) => {
                    // Fix postMessage origin mismatch by setting origin on the player
                    event.target.setOption("origin", window.location.origin);
                  }}
                  opts={{
                    width: "100%",
                    height: "500px",
                    playerVars: {
                      autoplay: 1,
                      // Fix for postMessage origin mismatch warning
                      // Explicitly tell YouTube the parent window origin
                      origin:
                        typeof window !== "undefined"
                          ? window.location.origin
                          : "",
                      // Explicitly set the iframe host to ensure proper communication
                      host: "https://www.youtube.com",
                    },
                  }}
                />
              </div>
            </div>
          </div>,
          document.body, // This pushes the div to the end of <body>
        )}
    </>
  );
};

export default ProblemsTable;
