"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f0] px-4 text-center">
      <div className="max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-[#1a237e] mb-3">Something went wrong</h1>
        <p className="text-sm text-gray-600 mb-6">An unexpected problem occurred while loading the FloodSense AI command station.</p>
        <div className="space-y-3 text-left text-xs text-gray-500 bg-slate-50 rounded-xl border border-slate-200 p-4">
          <p><strong>Error:</strong> {error.message}</p>
        </div>
        <button onClick={reset} className="mt-6 inline-flex items-center justify-center rounded-full bg-[#1a237e] px-5 py-2 text-sm font-semibold text-white hover:bg-[#283593] transition">
          Retry
        </button>
      </div>
    </main>
  );
}
