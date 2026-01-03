'use client'

import React, { useEffect, useRef } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  showActions?: boolean
  cancelText?: string
  confirmText?: string
  onConfirm?: () => void
  size?: 'sm' | 'md' | 'lg'
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  showActions = true,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  onConfirm,
  size = 'md',
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (!modalRef.current) return
      if (!isOpen || modalRef.current.contains(event.target as Node)) return
      onClose()
    }
    document.addEventListener('mousedown', clickHandler)
    return () => document.removeEventListener('mousedown', clickHandler)
  }, [isOpen, onClose])

  // Close if the esc key is pressed
  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (!isOpen || event.key !== 'Escape') return
      onClose()
    }
    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  }, [isOpen, onClose])

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-[570px]',
    lg: 'max-w-[800px]',
  }

  if (!isOpen) return null

  return (
    <div className="fixed left-0 top-0 z-50 flex h-full min-h-screen w-full items-center justify-center bg-dark/90 px-4 py-5">
      <div
        ref={modalRef}
        className={`w-full ${sizeClasses[size]} rounded-[20px] bg-white px-8 py-12 text-center dark:bg-dark-2 md:px-[70px] md:py-[60px]`}
      >
        <h3 className="pb-[18px] text-xl font-semibold text-dark dark:text-white sm:text-2xl">
          {title}
        </h3>
        <span className="mx-auto mb-6 inline-block h-1 w-[90px] rounded bg-primary"></span>

        {description && (
          <p className="mb-10 text-base leading-relaxed text-body-color dark:text-dark-6">
            {description}
          </p>
        )}

        {children && <div className="mb-10">{children}</div>}

        {showActions && (
          <div className="-mx-3 flex flex-wrap">
            <div className="w-1/2 px-3">
              <button
                onClick={onClose}
                className="block w-full rounded-md border border-stroke p-3 text-center text-base font-medium text-dark transition hover:border-red hover:bg-red hover:text-white dark:text-white dark:border-dark-3"
              >
                {cancelText}
              </button>
            </div>
            <div className="w-1/2 px-3">
              <button
                onClick={() => {
                  onConfirm?.()
                  onClose()
                }}
                className="block w-full rounded-md border border-primary bg-primary p-3 text-center text-base font-medium text-white transition hover:bg-opacity-90"
              >
                {confirmText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
