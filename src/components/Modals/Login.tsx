"use client";
import React, { useEffect, useState } from "react";
import { auth } from "@/firebase/firebase";
import { authModalState } from "@/atoms/authModalAtom";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useSetRecoilState } from "recoil";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type LoginProps = {};
const Login = ({}: LoginProps) => {
  const setAuthModalState = useSetRecoilState(authModalState);
  //const [inputs, setInputs] = useState({ email: "", password: "" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth);
  const router = useRouter();
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) return alert("Please fill all fields");
    try {
      const newUser = await signInWithEmailAndPassword(email, password);
      if (!newUser) return;
      router.push("/");
    } catch (error: any) {
      toast.error(error.message, {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
    }
  };
  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setInputs((prev) => ({ ...prev, [e.target.name]: [e.target.value] }));
  // };
  const handleClick = (type: "login" | "register" | "forgotPassword") => {
    setAuthModalState((prev) => ({ ...prev, type }));
  };
  useEffect(() => {
    if (error)
      toast.error(error.message, {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
  }, [error]);
  return (
    <form className="space-y-6 px-6" onSubmit={handleLogin}>
      <h3 className="text-xl font-medium text-white">Sign in to LeetClone</h3>
      <div>
        <label
          htmlFor="email"
          className="text-sm font-medium block mb-2 text-gray-300"
        >
          Your Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          className="border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 bg-gray-500 border-gray-500 placeholder-gray-400 text-white"
          placeholder="name@company.com"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="text-sm font-medium block mb-2 text-gray-300"
        >
          Your Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          className="border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-800 focus:border-blue-500 w-full p-2.5 bg-gray-500 border-gray-500 placeholder-gray-400 text-white"
          placeholder="*******"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
      </div>
      <button
        type="submit"
        className="w-full text-white focus:ring-blue-300 rounded-lg text-sm font-medium text-center px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-s"
      >
        {loading ? "Loading..." : "Log In"}
      </button>
      <button
        type="submit"
        className="flex w-full justify-end"
        onClick={() => handleClick("forgotPassword")}
      >
        <a
          href="#"
          className="text-sm block text-brand-orange hover:underline w-full text-right"
        >
          Forgot Password?
        </a>
      </button>
      <div className="text-sm font-medium text-gray-300">
        <a
          href="#"
          className="text-blue-700 hover:underline"
          onClick={() => handleClick("register")}
        >
          Create account
        </a>
      </div>
    </form>
  );
};

export default Login;
