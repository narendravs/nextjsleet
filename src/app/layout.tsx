"use client";
import "../styles/globals.css";
import Navbar from "@/components/Navbar/Navbar";
import { RecoilRoot } from "recoil";
import Head from "next/head";
import { ToastContainer } from "react-toastify";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RecoilRoot>
      <html lang="en">
        <Head>
          <title>LeetClone</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="description"
            content="Web application that contains leetcode problems and video solutions"
          />
        </Head>
        <body>
          {/* <Navbar /> */}
          <ToastContainer />
          {children}
        </body>
      </html>
    </RecoilRoot>
  );
}
