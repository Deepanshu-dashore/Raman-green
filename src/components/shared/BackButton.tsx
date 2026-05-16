"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ back }: { back?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (back) router.push(back);
        else router.back();
      }}
      className="flex items-center cursor-pointer justify-center gap-2 px-1 py-1 md:px-3 md:pr-4 md:py-2 text-sm md:text-[14px] font-bold text-gray-900 bg-gray-200 rounded-lg transition-all duration-300 ease-in-out hover:bg-gray-300 focus:outline-none shadow-none relative overflow-hidden group"
    >
      <span className="flex items-center justify-center md:w-4 md:h-4 w-5.5 h-5.5">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-gray-900">
          <path fill="currentColor" d="M13.83 19a1 1 0 0 1-.78-.37l-4.83-6a1 1 0 0 1 0-1.27l5-6a1 1 0 0 1 1.54 1.28L10.29 12l4.32 5.36a1 1 0 0 1-.78 1.64" />
        </svg>
      </span>
      <span className="md:inline-block hidden relative z-10">Back</span>
      <span className="absolute inset-0 w-full h-full rounded-lg bg-gray-900 opacity-10 transition-all duration-300 ease-in-out scale-0 group-hover:scale-100" />
    </button>
  );
}
