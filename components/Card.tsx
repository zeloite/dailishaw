import React from 'react'
import Image from 'next/image'

interface CardProps {
  image?: string
  title: string
  description: string
  buttonText?: string
  titleHref?: string
  buttonHref?: string
  onClick?: () => void
  className?: string
}

const Card: React.FC<CardProps> = ({
  image,
  title,
  description,
  buttonText,
  titleHref,
  buttonHref,
  onClick,
  className = '',
}) => {
  return (
    <div
      className={`overflow-hidden rounded-lg bg-white shadow-1 duration-300 hover:shadow-3 dark:bg-dark-2 dark:shadow-card dark:hover:shadow-3 ${className}`}
      onClick={onClick}
    >
      {image && (
        <div className="relative w-full h-48">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-8 text-center sm:p-9 md:p-7 xl:p-9">
        <h3>
          {titleHref ? (
            <a
              href={titleHref}
              className="mb-4 block text-xl font-semibold text-dark hover:text-primary dark:text-white sm:text-[22px] md:text-xl lg:text-[22px] xl:text-xl 2xl:text-[22px]"
            >
              {title}
            </a>
          ) : (
            <span className="mb-4 block text-xl font-semibold text-dark dark:text-white sm:text-[22px] md:text-xl lg:text-[22px] xl:text-xl 2xl:text-[22px]">
              {title}
            </span>
          )}
        </h3>
        <p className="mb-7 text-base leading-relaxed text-body-color dark:text-dark-6">
          {description}
        </p>

        {buttonText && (
          <a
            href={buttonHref || '#'}
            className="inline-block rounded-full border border-gray-3 px-7 py-2 text-base font-medium text-body-color transition hover:border-primary hover:bg-primary hover:text-white dark:border-dark-3 dark:text-dark-6"
          >
            {buttonText}
          </a>
        )}
      </div>
    </div>
  )
}

export default Card
