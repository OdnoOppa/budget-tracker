"use client";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"; // Dropdown menu trigger
import { MixerHorizontalIcon } from "@radix-ui/react-icons"; // Icon for the dropdown button
import { Table } from "@tanstack/react-table"; // Table for managing columns
import { Button } from "@/components/ui/button"; // Button UI component

import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"; // Radix UI dropdown components

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>; // Table instance as a prop
}

//  @author Erdenesuren

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      {/* Dropdown menu trigger (button) */}
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      {/* Dropdown menu content */}
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* List columns that can be toggled */}
        {table
          .getAllColumns() // Get all columns
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide() // Filter columns that can be hidden
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id} // Key for each column
                className="capitalize" // Capitalize column names
                checked={column.getIsVisible()} // Is the column visible?
                onCheckedChange={(value) => column.toggleVisibility(!!value)} // Toggle column visibility
              >
                {column.id} {/* Display column name */}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
