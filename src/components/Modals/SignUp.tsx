"use client";
import React, { useState } from "react";
import { useSetRecoilState } from "recoil";
import { authModalState } from "@/atoms/authModalAtom";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/firebase/firebase";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { doc, setDoc } from "firebase/firestore";

type signUpProps = {};
const SignUp = ({}: signUpProps) => {
  const setAuthModalState = useSetRecoilState(authModalState);
  const [inputs, setInputs] = useState({
    email: "",
    displayName: "",
    password: "",
  });
  const router = useRouter();

  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClick = () => {
    setAuthModalState((prev) => ({ ...prev, type: "login" }));
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log(inputs);

    if (!inputs.email || !inputs.displayName || !inputs.password)
      return alert("Please fill all fields");
    try {
      toast.loading("Creating your account", {
        position: "top-center",
        toastId: "loadingToast",
      });
      const newUser = await createUserWithEmailAndPassword(
        inputs.email,
        inputs.password
      );

      // console.log(newUser?.user.uid);
      // console.log(newUser?.user.email);
      alert(newUser?.user.uid);
      alert(newUser?.user.email);

      if (!newUser) return;
      const userData = {
        uid: newUser.user.uid,
        email: newUser.user.email,
        displayName: inputs.displayName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        likedProblems: [],
        dislikedProblems: [],
        solvedProblems: [],
        starredProblems: [],
      };
      console.log(userData);
      await setDoc(doc(firestore, "users", newUser.user.uid), userData);
      router.push("/");
    } catch (error: any) {
      console.log("error while request", error);
      toast.error(error.message, { position: "top-center" });
    } finally {
      toast.dismiss("loadingToast");
    }
  };

  return (
    <form className="space-y-6 px-6 pb-4" onSubmit={handleRegister}>
      <h1 className="text-xl font-medium text-white">Register to LeetClone</h1>
      <div>
        <label
          htmlFor="email"
          className="text-sm font-medium text-gray-300 block mb-2"
        >
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          onChange={handleChangeInput}
          placeholder="name@company.com"
          className="border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 bg-gray-500 border-gray-500 placeholder-gray-400 text-white"
        />
      </div>
      <div>
        <label
          htmlFor="displayName"
          className="text-sm font-medium text-gray-300 block mb-2 "
        >
          Display Name
        </label>
        <input
          type="text"
          name="displayName"
          id="displayName"
          onChange={handleChangeInput}
          placeholder="John Doe"
          className="border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 bg-gray-500 border-gray-500 placeholder-gray-400 text-white"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="text-sm font-medium text-gray-300 block mb-2"
        >
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          onChange={handleChangeInput}
          placeholder="*****"
          className="border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 bg-gray-500 border-gray-500 placeholder-gray-400 text-white"
        />
      </div>
      <button
        type="submit"
        className=" w-full text-center text-sm font-medium px-5 text-white border-orange-500 justify-center bg-orange-500 rounded-lg p-2.5 hover:bg-brand-orange-s  focus:ring-blue-500"
      >
        {loading ? "Registering..." : "Register"}
      </button>
      <div className="text-sm font-medium text-gray-300">
        Already have an account?
        <a
          href="#"
          className="text-blue-700 hover:underline"
          onClick={handleClick}
        >
          Log In
        </a>
      </div>
    </form>
  );
};

export default SignUp;
