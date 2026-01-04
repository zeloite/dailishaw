"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  logo?: {
    light: string;
    dark: string;
    alt?: string;
  };
  navItems?: NavItem[];
  showAuth?: boolean;
  className?: string;
}

const defaultNavItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Payment", href: "/payment" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

export default function Navbar({
  logo,
  navItems = defaultNavItems,
  showAuth = true,
  className = "",
}: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={`flex w-full items-center bg-white dark:bg-gray-900 ${className}`}
    >
      <div className="container mx-auto">
        <div className="relative flex items-center justify-between px-4">
          {/* Logo */}
          <div className="w-60 max-w-full">
            <Link href="/" className="block w-full py-5">
              {logo ? (
                <>
                  <img
                    src={logo.light}
                    alt={logo.alt || "logo"}
                    className="dark:hidden"
                  />
                  <img
                    src={logo.dark}
                    alt={logo.alt || "logo"}
                    className="hidden dark:block"
                  />
                </>
              ) : (
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Dailishaw
                </span>
              )}
            </Link>
          </div>

          {/* Menu Content */}
          <div className="flex w-full items-center justify-between">
            <div className="relative">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setOpen(!open)}
                id="navbarToggler"
                aria-label="Toggle navigation"
                className={`${
                  open && "navbarTogglerActive"
                } absolute right-4 top-1/2 block -translate-y-1/2 rounded-lg px-3 py-[6px] ring-orange-500 focus:ring-2 lg:hidden`}
              >
                <span className="relative my-[6px] block h-[2px] w-[30px] bg-gray-700 dark:bg-white"></span>
                <span className="relative my-[6px] block h-[2px] w-[30px] bg-gray-700 dark:bg-white"></span>
                <span className="relative my-[6px] block h-[2px] w-[30px] bg-gray-700 dark:bg-white"></span>
              </button>

              {/* Navigation Menu */}
              <nav
                id="navbarCollapse"
                className={`absolute right-4 top-full z-50 w-full max-w-[250px] rounded-lg bg-white px-6 py-5 shadow-lg dark:bg-gray-800 lg:static lg:block lg:w-full lg:max-w-full lg:shadow-none lg:dark:bg-transparent ${
                  !open && "hidden"
                }`}
              >
                <ul className="block lg:flex lg:space-x-12">
                  {navItems.map((item) => (
                    <ListItem key={item.href} navLink={item.href}>
                      {item.label}
                    </ListItem>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Auth Buttons */}
            {showAuth && (
              <div className="hidden justify-end pr-16 sm:flex lg:pr-0">
                <Link
                  href="/login"
                  className="px-7 py-3 text-base font-medium text-gray-900 hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-orange-600 px-7 py-3 text-base font-medium text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

interface ListItemProps {
  children: React.ReactNode;
  navLink: string;
}

function ListItem({ children, navLink }: ListItemProps) {
  return (
    <li>
      <Link
        href={navLink}
        className="flex py-2 text-base font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white lg:inline-flex"
      >
        {children}
      </Link>
    </li>
  );
}
