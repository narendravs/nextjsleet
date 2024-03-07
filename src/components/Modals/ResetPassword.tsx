import React, { useEffect, useState } from "react";
import { useSendPasswordResetEmail } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useSetRecoilState } from "recoil";
import { authModalState } from "@/atoms/authModalAtom";

type resetPasswordProps = {};
const ResetPassword = ({}: resetPasswordProps) => {
  const [email, setEmail] = useState("");

  const setAuthModal = useSetRecoilState(authModalState);

  const [sendPasswordResetEmail, sending, error] =
    useSendPasswordResetEmail(auth);

  const router = useRouter();
  const handleRequest = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();

    const success = await sendPasswordResetEmail(email);
    console.log(success);
    if (success) {
      toast.success("Password reset email sent", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
      alert("Password reset email sent");
      setAuthModal((prev) => ({ ...prev, isOpen: false, type: "login" }));
    }
  };

  useEffect(() => {
    if (error) {
      alert(error.message);
    }
  }, [error]);

  return (
    <form
      className="space-y-6 px-6 pb-4 lg:px-8 sm:pb-6 xl:pb-8"
      onSubmit={handleRequest}
    >
      <h3 className="text-xl font-medium text-white">Reset Password</h3>
      <p className="text-sm text-white">
        Forgotten your password? Enter your e-mail address below, and we&apos;ll
        send you an e-mail allowing you to reset it.
      </p>
      <div>
        <label
          htmlFor="email"
          className="text-sm font-medium block mb-2 text-gray-300"
        >
          Your email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          className="border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-300 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-600 placeholder-gray-500 text-white "
        />
      </div>
      <button
        type="submit"
        className={`w-full text-white focus:ring-4 focus:ring-blue-300  font-medium rounded-lg text-sm px-5  py-2.5 text-center  bg-brand-orange hover:bg-brand-orange-s `}
      >
        Reset Password
      </button>
    </form>
  );
};

export default ResetPassword;
