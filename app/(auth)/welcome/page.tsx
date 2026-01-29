"use client";

import Link from "next/link";

export default function Welcome() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-b from-green-700 to-green-500">
      <LeftSide />
      <RightSide />
    </div>
  );
}

function LeftSide() {
  return (
    <div className="relative w-full lg:w-1/2 flex flex-col items-center justify-center gap-4 px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">
      <div className="items-center justify-center padding-2 width-3/5">
        <h1 className="[font-family:'Antonio-Bold',Helvetica] text-9xl sm:text-8xl lg:text-15xl xl:text-18xl font-bold text-white mb-4 text-left">
          Join Us!
        </h1>
        <p className="text-white text-lg sm:text-xl lg:text-2xl xl:text-3xl text-left">
          To keep connected with us, please <br /> log in your account.
        </p>
      </div>
      <div className="mt-4 w-full max-w-md col-2 gap-20 flex items-center justify-center">
        <Link href="/auth">
          <button className="w-30 bg-white text-green-700 font-bold py-3 px-6 rounded-lg hover:bg-green-100 transition duration-300">
            Log In
          </button>
        </Link>
        <Link href="/sign-up">
          <button className="w-30 bg-white text-green-700 font-bold py-3 px-6 rounded-lg hover:bg-green-100 transition duration-300">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
}

function RightSide() {
  return (
    <div className="relative w-1/2 h-screen flex flex-col items-center justify-center gap-4 px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">
      <img
        className="w-100 sm:w-100 lg:w-100 h-auto mb-4 "
        src="/square-logo-white.png"
        alt="square logo white"
      />
    </div>
  );
}
