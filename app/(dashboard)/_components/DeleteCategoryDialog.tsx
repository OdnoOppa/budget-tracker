"use client";

// @prisma/client-ээс `Category` төрөл импортолж байна.  
import { Category } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import { DeleteCategory } from "../_actions/categories"; // Категори устгах функцийг импортолж байна.
import { toast } from "sonner"; // Хэрэглэгчид мэдэгдэл харуулахад ашиглаж байна.

// UI компонентийг ашиглаж устгах үйлдлийн dialog үүсгэж байна.
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// @author Odontuya (Зохиогчийн нэрийг тодорхой заасан)

// Төрөл тодорхойлох хэсэг
import { TransactionType } from "@/lib/types";

// **Props** интерфэйс: 
// trigger -> Dialog-ийг нээх ReactNode элемент
// category -> Устгах гэж буй категори объект
interface Props {
  trigger: ReactNode;
  category: Category;
}

function DeleteCategoryDialog({ category, trigger }: Props) {
  // Категорийн нэр болон төрлийг ашиглан өвөрмөц ID үүсгэж байна.
  const categoryIdentifier = `${category.name}-${category.type}`;
  const queryClient = useQueryClient(); // Query кэшийг шинэчлэхэд ашиглагдана.

  // Категори устгах `mutation` тохиргоо
  const deleteMutation = useMutation({
    mutationFn: DeleteCategory, // Устгах функцыг ашиглана.
    onSuccess: async () => {
      // Устгал амжилттай болсон үед амжилтын мэдэгдэл харуулна.
      toast.success("Category deleted successfully", {
        id: categoryIdentifier,
      });

      // `categories` кэшийг шинэчилж дахин fetch хийлгэж байна.
      await queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
    onError: () => {
      // Алдаа гарсан үед мэдэгдэл харуулна.
      toast.error("Something went wrong", {
        id: categoryIdentifier,
      });
    },
  });

  return (
    // **AlertDialog** компонент: Хэрэглэгчийг баталгаажуулахын тулд харуулна.
    <AlertDialog>
      {/* Trigger нь хэрэглэгчийн нээх товч байна */}
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          {/* Dialog-ийн гарчиг */}
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          {/* Анхааруулга тайлбар */}
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            category.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Цуцлах үйлдэл */}
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {/* Үргэлжлүүлэх буюу устгах үйлдэл */}
          <AlertDialogAction
            onClick={() => {
              // Устгах үйлдлийг эхлүүлэх үед "Deleting..." мэдэгдэл харуулна.
              toast.loading("Deleting category...", {
                id: categoryIdentifier,
              });

              // `deleteMutation`-г ажиллуулж категори устгах үйлдэл эхлүүлнэ.
              deleteMutation.mutate({
                name: category.name,
                type: category.type as TransactionType, // `TransactionType`-д хөрвүүлнэ.
              });
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteCategoryDialog; // Компонентыг экспортолж байна.
