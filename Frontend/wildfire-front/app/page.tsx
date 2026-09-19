"use client";

import dynamic from "next/dynamic";

const WildfireMap = dynamic(() => import("./(Compounts)/Map/main_Map"), {
  ssr: false,
});

export default function Page() {
  return <WildfireMap />;
}
