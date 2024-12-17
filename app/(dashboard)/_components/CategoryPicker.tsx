"use client";

import React, { useCallback, useEffect } from "react";
import { TransactionType } from "../../../lib/types";
import CreateCategoryDialog from "./CreateCategoryDialog";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@prisma/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
    Command, CommandEmpty, CommandGroup, CommandInput,
    CommandItem, CommandList
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// @author Odontuya

interface Props {
    type: TransactionType; // Орлого эсвэл зарлагын төрөл
    onChange: (value: string) => void; // Категори сонгогдоход дууддаг функц
}

function CategoryPicker({ type, onChange }: Props) {
    const [open, setOpen] = React.useState(false); // Popover нээлттэй эсэхийг удирдана
    const [value, setValue] = React.useState(""); // Сонгосон категори нэрийг хадгална

    // Сонгосон утга өөрчлөгдөхөд `onChange` дуудна
    useEffect(() => {
        if (value) return; // Хэрэв утга хоосон биш бол зогсоно
        onChange(value);
    }, [onChange, value]);

    // Категорийн жагсаалтыг авчирна
    const categoriesQuery = useQuery({
        queryKey: ["categories", type], // Query санах ойн түлхүүр
        queryFn: () =>
            fetch(`/api/categories?type=${type}`).then((res) => res.json()), // API дуудлага
    });

    // Сонгогдсон категори олох
    const selectedCategory = categoriesQuery.data?.find(
        (category: Category) => category.name === value
    );

    // Шинэ категори үүсгэсний дараах callback
    const successCallback = useCallback(
        (category: Category) => {
            setValue(category.name); // Утгыг шинэчилнэ
            setOpen((prev) => !prev); // Popover-ийг хаана
        },
        [setValue, setOpen]
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            {/* Trigger товч */}
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {/* Сонгогдсон категори эсвэл default */}
                    {selectedCategory ? (
                        <CategoryRow category={selectedCategory} />
                    ) : (
                        "Select category"
                    )}
                    <ChevronsUpDown className="m1-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            {/* Popover доторх агуулга */}
            <PopoverContent className="w-[200px] p-0">
                <Command
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                >
                    {/* Хайх талбар */}
                    <CommandInput placeholder="Search category..." />

                    {/* Категори үүсгэх диалог */}
                    <CreateCategoryDialog
                        type={type}
                        onSuccessCallback={successCallback}
                    />

                    {/* Хоосон үед */}
                    <CommandEmpty>
                        <p>Category not found</p>
                        <p className="text-xs text-muted-foreground">
                            Tip: Create a new category
                        </p>
                    </CommandEmpty>

                    {/* Категорийн жагсаалт */}
                    <CommandGroup>
                        <CommandList>
                            {categoriesQuery.data &&
                                categoriesQuery.data.map((category: Category) => (
                                    <CommandItem
                                        key={category.name}
                                        onSelect={() => {
                                            setValue(category.name); // Утгыг сонгоно
                                            setOpen((prev) => !prev); // Popover-ийг хаана
                                        }}
                                    >
                                        <CategoryRow category={category} />
                                        <Check
                                            className={cn(
                                                "mr-2 w-4 h-4 opacity-0",
                                                value === category.name && "opacity-100" // Сонгогдсон категори
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                        </CommandList>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export default CategoryPicker;

// Категори мэдээллийг харуулах жижиг компонент
function CategoryRow({ category }: { category: Category }) {
    return (
        <div className="flex items-center gap-2">
            <span role="img">{category.icon}</span> {/* Икон */}
            <span>{category.name}</span> {/* Нэр */}
        </div>
    );
}
