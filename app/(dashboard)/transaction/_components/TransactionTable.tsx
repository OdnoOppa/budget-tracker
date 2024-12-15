"use client";

import React, { useMemo, useState } from "react";
import { GetTransactionsHistoryResponseType } from "../../../api/transactions-history/route";
interface Props{
    from:Date;
    to: Date;
}
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ColumnDef,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
  } from "@tanstack/react-table";


import DeleteTransactionDialog from "./DeleteTransactionDialog";
import { DateToUTCDate } from "@/lib/helper";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DownloadIcon, MoreHorizontal, TrashIcon } from "lucide-react";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import {

  ColumnFiltersState,
  VisibilityState,
  
} from "@tanstack/react-table"
import {

  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/datatable/ColumnHeader";
import { cn } from "@/lib/utils";
import { DataTableViewOptions } from "@/components/datatable/ColumnToggle";
import { DataTableFacetedFilter } from "@/components/datatable/FacetedFilters";



interface Props{
    from: Date;
    to: Date;
}

const emptyData: any[] = [];
type TransactionsHistoryRow = GetTransactionsHistoryResponseType[0];

export const columns: ColumnDef<TransactionsHistoryRow>[] = [
    {
        accessorKey: "category",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Category" />
        ),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
        cell: ({ row }) => (
            <div className="flex gap-2 capitalize">
                {row.original.categoryIcon}
                <div className="capitalize">{row.original.category}</div>
            </div>
        ),
    },
    {
        accessorKey: "description",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => (
            <div className="capitalize">{row.original.description}</div>
        ),
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
            const date = new Date(row.original.date);
            const formattedDate = date.toLocaleDateString("default", {
                timeZone: "UTC",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
            return <div className="text-muted-foreground">{formattedDate}</div>
        },
    },
    {
        accessorKey: "type",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Type" />
        ),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
        cell: ({ row }) => (
            <div 
                className={cn(
                    "capitalize rounded-lg text-center p-2",
                    row.original.type === "income" &&
                    "bg-emereald-400/10 text-emereald-500",
                    row.original.type === "expense" && "bg-red-400/10 text-red-500"
                )}
            >
                {row.original.description}
            </div>
        ),
    },
    {
        accessorKey: "amount",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Amount" />
        ),
        cell: ({ row }) => (
            <p className="text-md rounded-lg bg-gray-400/5 p-2 text-center
            font-medium">
                {row.original.formattedAmount}
            </p>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => <RowActions transaction={row.original} />
    },
];

const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
});

function TransactionTable({from, to }: Props) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>
    ([]);

    const history = useQuery<GetTransactionsHistoryResponseType>({
        queryKey: ["transactions", "history", from, to],
        queryFn: () =>
            fetch(
                `/api/transactions-history?from=${DateToUTCDate(
                    from
                )}&to=${DateToUTCDate(to)}`
        ).then((res) => res.json()),
     });


     const table = useReactTable({
        data: history.data || emptyData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            sorting,
            columnFilters,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
     });

     const categoriesOptions = useMemo(() => {
        const categoriesMap = new Map();
        history.data?.forEach((transaction) => {
            categoriesMap.set(transaction.category, {
                value: transaction.category,
                label: `${transaction.categoryIcon} ${transaction.category}`,
            });
        });
        const uniqueCategories = new Set (categoriesMap.values());
        return Array.from(uniqueCategories);
    }, [history.data]);

    return(
        <div className="w-full">
            <div className="flex flex-wrap items-end justify-between gap-2 
            py-4">
                <div className="flex gap-2">
                    {table.getColumn("category") && (
                        <DataTableFacetedFilter
                            title="Category"
                            column={table.getColumn("category")}
                            options={categoriesOptions}
                        />
                    )}
                    {table.getColumn("type") && (
                        <DataTableFacetedFilter
                            title="Type"
                            column={table.getColumn("type")}
                            options={[
                                { label: "Income", value: "income"},
                                { label: "Expense", value: "expence"},
                            ]}
                        />
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                <Button
                    variant={"outline"}
                    size={"sm"}
                    className="ml-auto h-8 1g:flex"
                    onClick={() => {
                        const data = table.getFilteredRowModel().rows.map(row =>
                        ({
                            category: row.original.category,
                            categoryIcon: row.original.categoryIcon,
                            description: row.original.description,
                            type: row.original.type,
                            amount: row.original.amount,
                            formattedAmount: row.original.formattedAmount,
                            date: row.original.date,
                        }));
                  
                    }}
                    >
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                    <DataTableViewOptions table={table} />
                </div>
            </div>
                
            <SkeletonWrapper isLoading = {history.isFetching}>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                :flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                        </TableRow>
                        ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.
                                            getContext())}
                                        </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24
                                text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </SkeletonWrapper>
            <div className="flex itens-center justify-end space-x-2 ру-4">
                <Button
                    variant = "outline"
                    size = "sm"
                    onClick = {() => table.previousPage()}
                    disabled = {!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant = "outline"
                    size = "sm"
                    onClick = {() => table.nextPage()}
                    disabled = {!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}

export default TransactionTable;

function RowActions ({ transaction } : { transaction:
    TransactionsHistoryRow }) {
        const [showDeleteDialog, setShowDeleteDialog] = useState(false);
        
        return(
        <>
            <DeleteTransactionDialog open={showDeleteDialog} setOpen =
            {setShowDeleteDialog} transactionId={transaction.id} />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} className="h-8 w-8 p-0 ">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="flex items-center gap-2"
                            onSelect={() => {
                                setShowDeleteDialog ((prev) => !prev);
                            }}
                        >
                            <TrashIcon className="h-4 w-4 text-muted-foreground" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>
        );
}

function mkConfig(arg0: { fieldSeparator: string; decimalSeparator: string; useKeysAsHeaders: boolean; }) {
    throw new Error("Function not implemented.");
}

