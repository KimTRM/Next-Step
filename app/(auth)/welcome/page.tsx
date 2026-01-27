"use client";

function welcome() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-b from-green-500 to-green-700">
      <div className="relative w-full lg:w-1/2 flex flex-col items-center justify-center gap-4 px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">
        <div className="items-center justify-center padding-2">
          <h1 className="text-5xl sm:text-6xl lg:text-10xl xl:text-12xl font-bold text-white mb-4 text-center">
            JOIN US!
          </h1>
        </div>
      </div>
      <div></div>
    </div>
  );
}
