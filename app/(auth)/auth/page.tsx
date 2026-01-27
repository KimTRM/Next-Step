/**
 * Auth Page - NextStep Platform
 * Redirects to Clerk sign-in/sign-up
 */

"use client";

import { SignIn } from "@clerk/nextjs";
import { useIsMobile } from "@/shared/components/ui/use-mobile";
import { Lock, Mail, Facebook, MailOpen, Apple } from "lucide-react";
import { motion } from "framer-motion";

function AuthPage() {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <LoginPage />
      {!isMobile ? <SignInDirection /> : null}
    </div>
  );
}

function LoginPage() {
  const isMobile = useIsMobile();

  return (
    <motion.div
      className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8"
      initial={{ x: "25vw", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "tween", duration: 0.8, ease: "easeInOut" }}
    >
      <motion.div
        className="w-full max-w-md px-8"
        initial={{ y: "-7vh", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 90, damping: 40 }}
      >
        <h1 className="[font-family:'Antonio-Bold',Helvetica] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-green-600 mb-8 text-center">
          Log In to NextStep
        </h1>
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Username"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <a className="mt-4 text-green-500 underline" href="">
            Forgot your Password?
          </a>
          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold mt-4 py-2 rounded-lg transition duration-200">
            Log In
          </button>
          {isMobile && <SignInButton />}
        </div>
      </motion.div>
      <motion.div
        className="text-center items-center justify-center flex flex-col mt-6"
        initial={{ x: "-7vw", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 90, damping: 40 }}
      >
        <br />
        <p>Or log in using</p>
        <div className="text-center items-center justify-center flex gap-4 mt-2">
          <button className="bg-transparent hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200">
            <Facebook />
          </button>
          <button className="bg-transparent hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200">
            <MailOpen />
          </button>
          <button className="bg-transparent hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200">
            <Apple />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SignInDirection() {
  return (
    <motion.div
      className="relative w-full h-screen bg-gradient-to-b from-green-500 to-green-700 flex flex-col items-center justify-center gap-4 px-4 py-8 sm:px-6 lg:px-8 overflow-hidden"
      initial={{ width: "100vw" }}
      animate={{ width: "50vw" }}
      transition={{
        type: "tween",
        duration: 0.8,
        ease: "easeInOut",
      }}
    >
      <div className="relative z-10 flex flex-col items-center">
        <div className="">
          <img
            className="w-16 sm:w-20 lg:w-24 h-auto mb-4 "
            src="/logo-white.png"
            alt="logo white"
          />
          <h1 className="[font-family:'Antonio-Bold',Helvetica] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 text-center">
            Hello User!
          </h1>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-white text-lg sm:text-xl lg:text-2xl mb-8 text-center max-w-md">
            Enter your personal details and start your journey with us!
          </p>
          <button className="px-6 sm:px-8 py-2 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-green-600 transition duration-200">
            Sign Up
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function SignInButton() {
  return (
    <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition duration-200">
      Sign In
    </button>
  );
}

export default AuthPage;
