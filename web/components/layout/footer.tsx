import React from "react";
import Link from "next/link";
import { FaTwitter, FaDiscord, FaGithub } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="w-full bg-black py-10 border-t border-neutral-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-white text-xl font-bold mb-4 font-play">Meme Launchpad</h3>
            <p className="text-neutral-400 text-sm">
              The premier platform for launching meme tokens on Solana with automated bonding curves.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><Link href="/explore" className="hover:text-white transition-colors">Explore</Link></li>
              <li><Link href="/create" className="hover:text-white transition-colors">Create Token</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">How it Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Community</h4>
            <div className="flex space-x-4">
              <Link href="#" className="text-neutral-400 hover:text-white transition-colors text-xl">
                <FaTwitter />
              </Link>
              <Link href="#" className="text-neutral-400 hover:text-white transition-colors text-xl">
                 <FaDiscord />
              </Link>
              <Link href="#" className="text-neutral-400 hover:text-white transition-colors text-xl">
                <FaGithub />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-neutral-500">
          <div className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Meme Launchpad. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link href="#" className="hover:text-white transition-colors">Documentation</Link>
            <Link href="#" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
