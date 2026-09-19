"use client";

import { useSelection } from "@/app/(Compounts)/Context/SelectionContext";

export default function Navbar() {
  const { clearSelection, saveSelectedFires } = useSelection();

  return (
    <nav className="fixed w-[50vw] min-w-[380px] max-w-[1440px] shadow h-16 flex items-center justify-between p-4 mx-0 mt-2 top-0 left-1/2 -translate-x-1/2 rounded-full ring-white/50 ring-2 backdrop-blur-md bg-slate-900/60 text-white z-50">
      <span className="text-xl font-bold">WildfireMap</span>

      <div className="flex gap-3">
        <button
          onClick={clearSelection}
          className="px-4 py-2 rounded-full bg-white text-black font-medium hover:bg-zinc-200 transition cursor-pointer"
        >
          Delete Selelcted
        </button>

        <button
          onClick={saveSelectedFires}
          className="px-4 py-2 rounded-full bg-black text-white font-medium border border-white/30 hover:bg-zinc-900 transition cursor-pointer"
        >
          Save Selected
        </button>
      </div>
    </nav>
  );
}
