import { cn } from "@/lib/utils";
import { Spotlight } from "@/components/ui/spotlight";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
import { Footer } from "@/components/layout/footer";
import React from "react";
import Image from "next/image";

const content = [
  {
    title: "Meme Token Creation",
    description:
      "Create new meme tokens instantly with custom name, symbol, and initial supply using Solana's Token-2022 standard. Every token is launched with a bonding curve for fair price discovery.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] flex items-center justify-center text-white text-2xl font-bold">
        Token Creation
      </div>
    ),
  },
  {
    title: "Bonding Curve Pricing",
    description:
      "Automated pricing and liquidity management. As people buy, the price goes up. As they sell, it goes down. A fair and transparent mechanism for all.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--pink-500),var(--indigo-500))] flex items-center justify-center text-white text-2xl font-bold">
        Bonding Curve
      </div>
    ),
  },
  {
    title: "Instant Trading",
    description:
      "Buy and sell tokens immediately. The smart contract handles price calculation, token minting/burning, and SOL transfers in a single atomic transaction.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] flex items-center justify-center text-white text-2xl font-bold">
        Instant Trading
      </div>
    ),
  },
  {
    title: "DEX Launch",
    description:
      "Once liquidity thresholds are met, the token is automatically launched to a DEX like Raydium, locking liquidity and enabling wider market access.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] flex items-center justify-center text-white text-2xl font-bold">
        DEX Launch
      </div>
    ),
  },
];

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-black font-play">
      {/* Hero Section */}
      <div className="relative flex h-screen w-full overflow-hidden flex-col items-center justify-center">
        <div
          className={cn(
            "absolute inset-0 pointer-events-none",
            "[background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
            "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
          )}
        />
        
        {/* Radial gradient container */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

        <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-60"
          fill="white"
        />

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/50 px-3 py-1 text-sm font-medium text-neutral-800 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Powered by Token-2022
          </div>
          <h1 className="bg-opacity-50 bg-gradient-to-b from-neutral-500 to-neutral-900 dark:from-neutral-50 dark:to-neutral-400 bg-clip-text text-5xl font-bold text-transparent md:text-8xl">
            Meme Launchpad
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-normal text-neutral-600 dark:text-neutral-300">
            Launch meme tokens instantly with automated bonding curve pricing, lock liquidity, and distribute fees seamlessly. The fairest, most secure way to create and trade community tokens on Solana.
          </p>
        </div>
      </div>
      
      {/* Sticky Scroll Section */}
      <div className="relative z-20 py-10 bg-white dark:bg-black">
         <StickyScroll content={content} />
      </div>

      {/* Container Scroll Animation Section */}
      <div className="flex flex-col overflow-hidden bg-white dark:bg-black">
        <ContainerScroll
          titleComponent={
            <>
              <h1 className="text-4xl font-semibold text-black dark:text-white">
                Launch your token to the moon <br />
                <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                  Advanced Dashboard
                </span>
              </h1>
            </>
          }
        >
          <Image
            src={`/dashboard.png`}
            alt="hero"
            height={720}
            width={1400}
            className="mx-auto rounded-2xl object-cover h-full object-left-top"
            draggable={false}
          />
        </ContainerScroll>
      </div>
      
      {/* Pointer Highlight Section */}
      <div className="bg-white dark:bg-black pb-24 px-4 -mt-40 md:-mt-40 relative z-30">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:gap-12 md:grid-cols-3">
            <div className="rounded-xl p-8 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <div className="h-48 w-full rounded-lg bg-gradient-to-r from-blue-200 to-sky-200 mb-6" />
                <div className="mx-auto max-w-lg text-lg font-bold tracking-tight md:text-xl text-black dark:text-white leading-relaxed">
                <PointerHighlight
                    rectangleClassName="bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 leading-loose"
                    pointerClassName="text-yellow-500 h-4 w-4"
                    containerClassName="inline-block mr-1"
                >
                    <span className="relative z-10">Fair Launch</span>
                </PointerHighlight>
                for every token created on the platform.
                </div>
                <p className="mt-6 text-base text-neutral-500 dark:text-neutral-400 leading-relaxed">
                No pre-sales, no insider allocations. Everyone starts on equal footing with the bonding curve.
                </p>
            </div>
            <div className="rounded-xl p-8 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <div className="h-48 w-full rounded-lg bg-gradient-to-r from-blue-200 to-purple-200 mb-6" />
                <div className="mx-auto max-w-lg text-lg font-bold tracking-tight md:text-xl text-black dark:text-white leading-relaxed">
                Discover our
                <PointerHighlight
                    rectangleClassName="bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 leading-loose"
                    pointerClassName="text-blue-500 h-4 w-4"
                    containerClassName="inline-block mx-1"
                >
                    <span className="relative z-10">secure</span>
                </PointerHighlight>
                 smart contracts audited for safety.
                </div>
                <p className="mt-6 text-base text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Our Anchor-based contracts ensure transparency and security for all transactions.
                </p>
            </div>

            <div className="rounded-xl p-8 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <div className="h-48 w-full rounded-lg bg-gradient-to-r from-green-200 to-yellow-200 mb-6" />
                <div className="mx-auto max-w-lg text-lg font-bold tracking-tight md:text-xl text-black dark:text-white leading-relaxed">
                Experience the future with our
                <PointerHighlight
                    rectangleClassName="bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 leading-loose"
                    pointerClassName="text-green-500 h-4 w-4"
                    containerClassName="inline-block ml-1"
                >
                    <span className="relative z-10">auto-listings</span>
                </PointerHighlight>
                .
                </div>
                <p className="mt-6 text-base text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Seamless transition to Raydium once liquidity targets are met, ensuring instant market depth.
                </p>
            </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
