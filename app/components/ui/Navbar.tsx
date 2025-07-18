"use client";
import React, { JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/app/lib/utils";
import Link from "next/link";

interface NavItem {
  name: string;
  link: string;
  icon?: JSX.Element;
}

export const Navbar = ({
  navItems,
  className,
}: {
  navItems: NavItem[];
  className?: string;
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "flex max-w-fit  fixed top-10 inset-x-0 mx-auto border border-white/[0.2] rounded-full bg-black shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] pr-2 pl-8 py-2  items-center justify-center space-x-4",
          className
        )}
      >
        {navItems.map((navItem, idx) => (
          <Link
            key={`link=${idx}`}
            href={navItem.link}
            className={cn(
              "relative items-center flex space-x-1 text-neutral-50 hover:text-neutral-300"
            )}
          >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="text-sm !cursor-pointer">{navItem.name}</span>
          </Link>
        ))}
        <Link href="#home">
          <button className="border text-sm font-medium relative border-white/[0.2] text-white px-4 py-2 rounded-full">
            <span>Home</span>
            <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-orange-500 to-transparent  h-px" />
          </button>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
};
