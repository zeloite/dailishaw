'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href?: string
  icon?: React.ReactNode
  children?: NavItem[]
}

interface NavSection {
  title?: string
  items: NavItem[]
  showDivider?: boolean
}

interface SidebarProps {
  logo?: React.ReactNode
  sections: NavSection[]
  className?: string
  onItemClick?: (item: NavItem) => void
}

const Sidebar: React.FC<SidebarProps> = ({
  logo,
  sections,
  className = '',
  onItemClick,
}) => {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const toggleSection = (sectionTitle: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }))
  }

  const isActive = (href?: string) => {
    if (!href) return false
    return pathname === href
  }

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const active = isActive(item.href)

    if (hasChildren) {
      const isOpen = openSections[item.label] ?? true

      return (
        <li key={item.label}>
          <button
            onClick={() => toggleSection(item.label)}
            className="relative flex w-full cursor-pointer items-center justify-between gap-1 rounded-md px-2.5 py-2 text-sm font-semibold text-body-color transition hover:bg-primary hover:text-dark dark:text-dark-6 dark:hover:bg-dark-2 dark:hover:text-white md:px-2 md:py-1.5"
          >
            <span className="flex items-center gap-2">
              {item.icon && <span className="size-5 md:size-4">{item.icon}</span>}
              {item.label}
            </span>
            <svg
              className={`size-3 shrink-0 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {isOpen && (
            <ul className="mt-0.5 flex flex-col gap-0.5">
              {item.children?.map((child) => renderNavItem(child, depth + 1))}
            </ul>
          )}
        </li>
      )
    }

    const content = (
      <>
        {item.icon && (
          <span className="size-5 shrink-0 text-body-color dark:text-dark-6 md:size-4">
            {item.icon}
          </span>
        )}
        <span
          className={`flex-1 text-sm font-semibold transition ${
            active
              ? 'text-dark dark:text-white'
              : 'text-body-color hover:text-dark dark:text-dark-6 dark:hover:text-white'
          }`}
        >
          {item.label}
        </span>
      </>
    )

    const baseClasses = `flex w-full items-center gap-2 rounded-md px-2.5 py-2 transition md:px-2 md:py-1.5 ${
      active
        ? 'bg-primary text-dark dark:bg-dark-2 dark:text-white'
        : 'hover:bg-primary dark:hover:bg-dark-2'
    }`

    return (
      <li key={item.href || item.label}>
        {item.href ? (
          <Link
            href={item.href}
            className={baseClasses}
            onClick={() => onItemClick?.(item)}
          >
            {content}
          </Link>
        ) : (
          <div className={baseClasses}>{content}</div>
        )}
      </li>
    )
  }

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 hidden w-64 max-w-full flex-col border-r border-stroke bg-white dark:border-dark-3 dark:bg-dark-2 lg:flex ${className}`}
    >
      {/* Logo */}
      {logo && (
        <div className="flex items-center justify-between border-b border-stroke px-5 py-4 dark:border-dark-3">
          {logo}
        </div>
      )}

      {/* Navigation */}
      <div className="scrollbar-hide flex h-full max-h-full flex-col gap-3 overflow-y-auto px-4 py-6 lg:px-5">
        {sections.map((section, index) => (
          <div key={section.title || index}>
            {section.title && (
              <h3 className="mb-2 px-2.5 text-xs font-semibold uppercase tracking-wider text-body-color dark:text-dark-6 md:px-2">
                {section.title}
              </h3>
            )}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => renderNavItem(item))}
            </ul>
            {section.showDivider && index < sections.length - 1 && (
              <div className="my-6">
                <svg width="100%" height="2">
                  <line
                    x1="0"
                    y1="1"
                    x2="100%"
                    y2="1"
                    className="stroke-stroke dark:stroke-dark-3"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="0,6"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}

export default Sidebar
