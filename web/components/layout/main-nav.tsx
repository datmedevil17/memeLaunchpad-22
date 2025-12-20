"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

export function MainNav() {
  const navItems = [
    {
      name: "Explore",
      link: "/explore",
    },
    {
      name: "Create",
      link: "/create",
    },
    {
      name: "Dashboard",
      link: "/dashboard",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="relative w-full">
      <Navbar className="top-4 fixed">
        {/* Desktop Navigation */}
        <NavBody>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-black dark:text-white font-bold text-xl font-play">
               Meme Launchpad
            </Link>
          </div>
          <NavItems items={navItems} className="hidden md:flex" />
          <div className="flex items-center gap-4">
            <WalletMultiButton style={{ backgroundColor: 'transparent', color: 'inherit', border: '1px solid #333', borderRadius: '8px', height: '40px', fontSize: '14px', fontWeight: 'bold' }} />
            <NavbarButton variant="primary" as={Link} href="/create" className="group-data-[visible=true]:hidden">Launch Token</NavbarButton>
          </div>
        </NavBody>
 
        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <Link href="/" className="flex items-center gap-2 text-black dark:text-white font-bold text-xl font-play">
               Meme.Launchpad
            </Link>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>
 
          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <Link
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "relative text-neutral-600 dark:text-neutral-300 block py-2",
                  pathname === item.link && "text-black dark:text-white font-bold"
                )}
              >
                <span className="block">{item.name}</span>
              </Link>
            ))}
            <div className="flex w-full flex-col gap-4 mt-4">
              <div className="w-full flex justify-center">
                <WalletMultiButton style={{ width: '100%', justifyContent: 'center' }} />
              </div>
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
                as={Link}
                href="/create"
              >
                Launch Token
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
