// app/dashboard/_components/CreateTransactionDialog

"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TransactionType } from "@/lib/types";

import { ReactNode, useState } from "react";
import React, { useCallback } from "react";
import { Form, useForm } from "react-hook-form";
import { CreateTransactionSchema, CreateTransactionSchemaType } from "../../../schema/transaction";
import { zodResolver } from "@hookform/resolvers/zod"
import CategoryPicker from "./CategoryPicker";
import { DateToUTCDate } from "../../../lib/helper";
import { useQueryClient } from "@tanstack/react-query";
import { DialogClose, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { CreateTransaction } from "../_actions/transactions";
import { useMutation } from "@tanstack/react-query";
import { FormProvider } from "react-hook-form";


interface Props{
    trigger: ReactNode;
    type: TransactionType;
}
function CreateTransactionDialog({trigger, type}: Props){
    const form = useForm<CreateTransactionSchemaType>({
        resolver: zodResolver(CreateTransactionSchema),
        defaultValues: {
            amount: 0,
            type,
            date: new Date(),
        }
    });

    const [open,setOpen] = useState(false);
    // const handleCategoryChange =  useCallback(
    //     (value: string) => {
    //         form.setValue("category", value);
    //     },
    //     [form]
    // );

    const handleCategoryChange = useCallback((value: string) => {
        form.setValue("category", value);
    }, [form]);
    

    // const handleCategoryChange = useCallback((value: string) => {
    //     console.log("Selected category:", value); // Debug log
    //     form.setValue("category", value);
    //   }, [form]);
      

    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: CreateTransaction,
        onSuccess: () => {
            toast.success("Transaction created successfully ✌️", {
                id: "create-transaction",
            });
            form.reset({
                type,
                description: "",
                amount: 0,
                date: new Date(),
                category: undefined,
            });
    
            queryClient.invalidateQueries({
                queryKey: ["overview"],
            });
    
            setOpen((prev) => !prev);
        },
    });
    

//     const onSubmit =useCallback(
//         (values: CreateTransactionSchemaType) => {
//         toast.loading("Creating transaction...", 
//             { id: "create-transaction" });

            
//             mutate({
//                 ...values,
//                 date: DateToUTCDate(values.date),
//             })
//     },
//     [mutate]
// );


const onSubmit = useCallback(
    (values: CreateTransactionSchemaType) => {
        toast.loading("Creating transaction...", { id: "create-transaction" });

        mutate({
            ...values,
            date: DateToUTCDate(values.date),
        });
    },
    [mutate]
);


    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Create a new{" "} 
                    <span 
                        className={cn(
                        "m-1",
                        type === "income" ? "text-emerald-500":
                        "text-red-500"
                    )}
                    >
                        {type}
                    </span>
                    transaction
                    </DialogTitle>
            </DialogHeader>
            
            <FormProvider {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="description"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    {/* <Input defaultValue={""} {...field} /> */}
                                    <Input {...field} value={field.value || ""} />
                                </FormControl>
                                <FormDescription>
                                    Transaction description (optional)
                                </FormDescription>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="amount"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    {/* <Input defaultValue={0} type="number"
                                    {...field} /> */}

                                        <Input 
                                                type="number" 
                                                {...field} 
                                                value={field.value ?? 0} // Ensure a default value (e.g., 0)
                                                onChange={(e) => field.onChange(e.target.value)} 
                                            />


                                </FormControl>
                                <FormDescription>
                                    Transaction amount (required)
                                </FormDescription>
                            </FormItem>
                        )}
                    />
                    
                    <div className="flex item-center
                    justify-between gap-2">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <FormControl>
                                        <CategoryPicker type={type} onChange={handleCategoryChange} />
                                    </FormControl>
                                    <FormDescription>
                                        Select a category for this transaction
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Transaction date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[200px] pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="al-auto h-4 w-4
                                                opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={(value) => {
                                                    if (!value) return;
                                                    field.onChange(value);
                                                }}
                                            
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>
                                        Select a date for this transaction
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </form>
            </FormProvider>
            
            <DialogFooter>
                <DialogClose asChild>
                    <Button
                        type="button"
                        variant={"secondary"}
                        onClick={() => {
                            form.reset();
                        }}
                    >
                    Cancel
                    </Button>
                </DialogClose>
                <Button onClick={form.handleSubmit(onSubmit)} disabled=
                    {isPending}>
                    {!isPending && "Create"}
                    {isPending && <Loader2 className="animate-spin" />}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

export default CreateTransactionDialog;
