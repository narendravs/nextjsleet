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
  const [inputs, setInputs] = useState({ email: "", password: "" });
  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputs.email || !inputs.password) {
      toast.error("Please fill all fields", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }
    try {
      const newUser = await signInWithEmailAndPassword(
        inputs.email,
        inputs.password,
      );
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
    <form className="space-y-6 px-6 pb-4" onSubmit={handleLogin}>
      <h3 className="text-xl font-medium text-white">Sign in to LeetClone</h3>

      {/* Email Field */}
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
          autoComplete="email"
          className="border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
          placeholder="name@company.com"
          required
          value={inputs.email}
          onChange={handleInputChange}
        />
      </div>

      {/* Password Field */}
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
          autoComplete="current-password"
          className="border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
          placeholder="*******"
          required
          value={inputs.password}
          onChange={handleInputChange}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full text-white focus:ring-4 focus:ring-blue-300 rounded-lg text-sm font-medium text-center px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-s disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Logging in..." : "Log In"}
      </button>

      {/* Forgot Password Link - Styled as a button for accessibility */}
      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm text-brand-orange hover:underline focus:outline-none focus:ring-2 focus:ring-brand-orange rounded"
          onClick={() => handleClick("forgotPassword")}
        >
          Forgot Password?
        </button>
      </div>

      {/* Register Link */}
      <div className="text-sm font-medium text-gray-300">
        Not registered?{" "}
        <button
          type="button"
          className="text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          onClick={() => handleClick("register")}
        >
          Create account
        </button>
      </div>
    </form>
  );
};

export default Login;
