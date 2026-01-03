import React from 'react'

interface TableColumn {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
}

interface TableProps {
  columns: TableColumn[]
  data: any[]
  striped?: boolean
  className?: string
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  striped = true,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="text-center bg-primary">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="min-w-[160px] border-l border-transparent py-4 px-3 text-lg font-medium text-white lg:py-7 lg:px-4"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => {
                  const isEven = colIndex % 2 === 0
                  const cellClass = striped
                    ? isEven
                      ? 'text-dark border-b border-l border-[#E8E8E8] bg-[#F3F6FF] dark:bg-dark-3 dark:border-dark dark:text-dark-7 py-5 px-2 text-center text-base font-medium'
                      : 'text-dark border-b border-[#E8E8E8] bg-white dark:border-dark dark:bg-dark-2 dark:text-dark-7 py-5 px-2 text-center text-base font-medium'
                    : 'text-dark border-b border-[#E8E8E8] bg-white dark:border-dark dark:bg-dark-2 dark:text-dark-7 py-5 px-2 text-center text-base font-medium'

                  const value = row[column.key]
                  const content = column.render
                    ? column.render(value, row)
                    : value

                  return (
                    <td key={column.key} className={cellClass}>
                      {content}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="py-10 text-center text-body-color dark:text-dark-6">
            No data available
          </div>
        )}
      </div>
    </div>
  )
}

export default Table

// Helper component for table actions/buttons
export const TableButton: React.FC<{
  href?: string
  onClick?: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
}> = ({ href, onClick, children, variant = 'primary' }) => {
  const variantClasses = {
    primary:
      'border-primary text-primary hover:bg-primary hover:text-white',
    secondary:
      'border-gray-3 text-body-color hover:bg-gray-3 dark:border-dark-3 dark:text-dark-6',
    danger: 'border-red text-red hover:bg-red hover:text-white',
  }

  const baseClass = `inline-block px-6 py-2.5 border rounded-md font-medium transition ${variantClasses[variant]}`

  if (href) {
    return (
      <a href={href} className={baseClass}>
        {children}
      </a>
    )
  }

  return (
    <button onClick={onClick} className={baseClass}>
      {children}
    </button>
  )
}
