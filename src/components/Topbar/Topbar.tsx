"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";
import { useSetRecoilState } from "recoil";
import { authModalState } from "@/atoms/authModalAtom";
import Logout from "@/components/Buttons/Logout";
import { Timer } from "../Timer/Timer";

// Lazy Load the Navigation logic - This is the Lighthouse fix!
const ProblemNav = dynamic(() => import("./ProblemNavigation"), {
  ssr: false,
  loading: () => <div className="flex-1" />, // Maintain layout spacing
});

type TopbarProps = {
  problemPage?: boolean;
};

const Topbar = ({ problemPage }: TopbarProps) => {
  const [user] = useAuthState(auth);
  const setAuthModalState = useSetRecoilState(authModalState);

  return (
    <nav className="relative flex h-[50px] w-full shrink-0 items-center px-5 bg-dark-layer-1 text-dark-gray-7">
      <div
        className={`flex w-full items-center justify-between ${!problemPage ? "max-w-[1200px] mx-auto" : ""}`}
      >
        {/* LOGO SECTION */}
        <Link href="/" className="flex items-center justify-start flex-1">
          <div className="relative h-[22px] w-[100px]">
            <Image
              src="/logo-full.png"
              alt="Logo"
              width={100}
              height={22}
              priority
              className="object-contain"
            />
          </div>
        </Link>

        {/* NAVIGATION SECTION - Only loaded if needed */}
        {problemPage && <ProblemNav />}

        {/* USER SECTION */}
        <div className="space-x-4 p-2 flex items-center">
          {!user && (
            <Link
              href="/auth"
              onClick={() =>
                setAuthModalState((prev) => ({
                  ...prev,
                  isOpen: true,
                  type: "login",
                }))
              }
            >
              <button className="bg-dark-fill-3 py-1 px-2 cursor-pointer rounded hover:bg-dark-fill-2 transition duration-300">
                Sign In
              </button>
            </Link>
          )}

          {user && problemPage && <Timer />}

          {user && (
            <div className="cursor-pointer group relative">
              <Image
                src="/avatar.png"
                alt="Avatar"
                width={30}
                height={30}
                className="rounded-full"
              />
              <div className="absolute top-10 left-2/4 -translate-x-2/4 mx-auto bg-dark-layer-1 text-brand-orange p-2 rounded shadow-lg z-40 group-hover:scale-100 scale-0 transition-all duration-300">
                <p className="text-sm">{user.email}</p>
              </div>
            </div>
          )}
          {user && <Logout />}
        </div>
      </div>
    </nav>
  );
};

export default Topbar;
