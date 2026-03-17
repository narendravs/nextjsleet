"use client";
import { RecoilRoot } from "recoil";
import { ToastContainer } from "react-toastify";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RecoilRoot>
      <ToastContainer />
      {children}
    </RecoilRoot>
  );
}
