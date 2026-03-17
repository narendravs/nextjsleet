"use client";
import { authModalState } from "@/atoms/authModalAtom";
import Navbar from "@/components/Navbar/Navbar";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";
import { useRecoilValue } from "recoil";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "react-toastify/dist/ReactToastify.css";
import dynamic from "next/dynamic";

type AuthPageProps = {};

const AuthModal = dynamic(() => import("@/components/Modals/AuthModal"));

const AuthPage: React.FC<AuthPageProps> = () => {
  const authModal = useRecoilValue(authModalState);
  const [user] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  return (
    <div className="bg-gradient-to-b from-gray-600 to-black h-screen relative">
      <div className="max-w-7xl mx-auto">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-5rem)] pointer-events-none select-none">
          <Image
            src="/hero.png"
            alt="Hero img"
            width={700}
            height={700}
            priority // Fixes the LCP warning
            style={{ width: "auto", height: "auto" }} // Fixes the Aspect Ratio warning
          />
        </div>
        {authModal.isOpen && <AuthModal />}
      </div>
    </div>
  );
};
export default AuthPage;
