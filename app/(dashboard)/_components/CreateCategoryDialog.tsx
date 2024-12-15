
//createCategoryDialog.tsx
import React, { useState, useCallback, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CreateCategorySchema } from "@/schema/categories";
import { TransactionType } from "@/lib/types";
import { Category } from "@prisma/client";
import { CreateCategory } from "../_actions/categories";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Picker from "@emoji-mart/react";
import { useTheme } from "next-themes";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Loader2, PlusSquare, CircleOff } from "lucide-react";
import { z } from "zod";
import data from "@emoji-mart/data";






type CreateCategorySchemaType = z.infer<typeof CreateCategorySchema>;

interface Props {
    type: "income" | "expense";
    onSuccessCallback: (category: Category) => void;
    trigger?: ReactNode;
}

function CreateCategoryDialog({ type, onSuccessCallback, trigger }: Props) {
    const [open, setOpen] = useState(false);
    const form = useForm<CreateCategorySchemaType>({
        resolver: zodResolver(CreateCategorySchema),
        defaultValues: {
            type,
        },
    });

    const queryClient = useQueryClient();
    const theme = useTheme();

    const { mutate, isPending } = useMutation<
    { createdAt: Date; name: string; userId: string; icon: string; type: string } | undefined, // mutation result type
    Error, // error type
    { name: string; icon: string; type: "expense" | "income" } // variables type
>({
    mutationFn: CreateCategory,
    onSuccess: async (data) => {
        if (data) {
            form.reset({
                name: "",
                icon: "",
                type,
            });

            toast.success(`Category ${data.name} created successfully ✌️`, {
                id: "create-category",
            });

            onSuccessCallback(data);

            await queryClient.invalidateQueries({
                queryKey: ["categories"],
            });

            setOpen((prev) => !prev);
        }
    },
    onError: () => {
        toast.error("Something went wrong", {
            id: "create-category",
        });
    },
});

    const onSubmit = useCallback(
        (values: CreateCategorySchemaType) => {
            toast.loading("Creating category...", {
                id: "create-category",
            });
            mutate(values);
        },
        [mutate]
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              { trigger ? trigger : <Button variant="ghost" className="flex items-center justify-start border-separate rounded-none border-b px-3 py-3 text-muted-foreground">
                    <PlusSquare className="mr-2 h-4 w-4" />
                    Create new
                </Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Create{" "}
                        <span className={`m-1 ${type === "income" ? "text-emerald-500" : "text-red-500"}`}>
                            {type}
                        </span>{" "}
                        category
                    </DialogTitle>
                    <DialogDescription>
                        Categories are used to group your transactions
                    </DialogDescription>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Category" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            This is how your category will appear in the app
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="icon"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Icon</FormLabel>
                                        <FormControl>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="h-[100px] w-full">
                                                        {form.watch("icon") ? (
                                                            <div className="flex flex-col items-center gap-2">
                                                                <span className="text-5xl" role="img">
                                                                    {field.value}
                                                                </span>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Click to change
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-2">
                                                                <CircleOff className="h-[48px] w-[48px]" />
                                                                <p className="text-xs text-muted-foreground">
                                                                    Click to select
                                                                </p>
                                                            </div>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full">
                                                    <Picker
                                                        data={data} // Ensure `data` is defined or passed
                                                        theme={theme.resolvedTheme}
                                                        onEmojiSelect={(emoji: { native: string }) => {
                                                            field.onChange(emoji.native);
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </FormControl>
                                        <FormDescription>
                                            This is how your category will appear in the app.
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    form.reset();
                                }}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
                            {!isPending ? "Create" : <Loader2 className="animate-spin" />}
                        </Button>
                    </DialogFooter>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}

export default CreateCategoryDialog;
