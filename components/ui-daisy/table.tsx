"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Base table styles that all variants inherit
const tableBase = "table transition-all duration-200"

const tableVariants = cva(tableBase, {
  variants: {
    variant: {
      default: "table",
      compact: "table table-compact",
      zebra: "table table-zebra",
      pin: "table table-pin-rows",
      // Glass morphism variants  
      glass: "table bg-base-100/60 backdrop-blur-sm",
      "glass-zebra": "table table-zebra bg-base-100/60 backdrop-blur-sm",
      // Professional variants
      bordered: "table border border-base-300",
      hoverable: "table hover:table-zebra",
    },
    size: {
      xs: "table-xs",
      sm: "table-sm", 
      default: "",
      md: "table-md",
      lg: "table-lg",
    },
    layout: {
      auto: "table-auto",
      fixed: "table-fixed",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    layout: "fixed",
  },
})

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> &
    VariantProps<typeof tableVariants> & {
      responsive?: boolean
    }
>(({ className, variant, size, layout, responsive = true, ...props }, ref) => {
  const tableClasses = cn(
    tableVariants({ variant, size, layout }),
    "w-full caption-bottom text-sm",
    className
  )

  const table = (
    <table ref={ref} className={tableClasses} {...props} />
  )

  if (responsive) {
    return (
      <div className="relative w-full overflow-auto">
        {table}
      </div>
    )
  }

  return table
})
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead 
    ref={ref} 
    className={cn("[&_tr]:border-b", className)} 
    {...props} 
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-base-200/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    hoverable?: boolean
    active?: boolean
  }
>(({ className, hoverable, active, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors",
      hoverable && "hover:bg-base-200/50 data-[state=selected]:bg-base-200",
      active && "bg-base-200/30",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & {
    sortable?: boolean
    sorted?: "asc" | "desc" | false
  }
>(({ className, sortable, sorted, children, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-base-content/70 [&:has([role=checkbox])]:pr-0",
      sortable && "cursor-pointer select-none hover:text-base-content",
      className
    )}
    {...props}
  >
    <div className="flex items-center space-x-2">
      <span>{children}</span>
      {sortable && (
        <div className="flex flex-col">
          <div className={cn(
            "w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-transparent",
            sorted === "asc" ? "border-b-base-content" : "border-b-base-content/30"
          )} />
          <div className={cn(
            "w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-transparent -mt-px",
            sorted === "desc" ? "border-t-base-content" : "border-t-base-content/30"
          )} />
        </div>
      )}
    </div>
  </th>
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    truncate?: boolean
  }
>(({ className, truncate, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-4 align-middle [&:has([role=checkbox])]:pr-0",
      truncate && "max-w-0 truncate",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-base-content/70", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

// Enhanced table with built-in features
const DataTable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    data?: any[]
    columns?: Array<{
      key: string
      label: string
      sortable?: boolean
      render?: (value: any, row: any) => React.ReactNode
    }>
    loading?: boolean
    emptyMessage?: string
    onSort?: (key: string, direction: "asc" | "desc") => void
    sortBy?: string
    sortDirection?: "asc" | "desc"
  }
>(({ 
  className, 
  data = [], 
  columns = [], 
  loading = false,
  emptyMessage = "No data available",
  onSort,
  sortBy,
  sortDirection,
  ...props 
}, ref) => {
  const handleSort = (key: string) => {
    if (!onSort) return
    
    const direction = sortBy === key && sortDirection === "asc" ? "desc" : "asc"
    onSort(key, direction)
  }

  return (
    <div ref={ref} className={cn("space-y-4", className)} {...props}>
      <Table variant="bordered" responsive>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                sortable={column.sortable}
                sorted={sortBy === column.key ? sortDirection : false}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-base-content/70">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={index} hoverable>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
})
DataTable.displayName = "DataTable"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  DataTable,
  tableVariants,
}