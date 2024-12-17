
"use server";

import prisma from "@/lib/prisma";
import {
    CreateTransactionSchema,
    CreateTransactionSchemaType,
} from "@/schema/transaction";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// @author Эрдэнэсүрэн

// Гүйлгээ үүсгэх функц
export async function CreateTransaction(form: CreateTransactionSchemaType) {
    // Оролтын өгөгдлийг схем ашиглан баталгаажуулна
    const parsedBody = CreateTransactionSchema.safeParse(form);
    if (!parsedBody.success) {
        throw new Error(parsedBody.error.message); // Алдаа гарвал шалгалтын алдааны мэдээг харуулна
    }

    // Хэрэглэгчийг шалгана; нэвтрээгүй бол нэвтрэх хуудас руу чиглүүлнэ
    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
    }

    // Баталгаажсан өгөгдлөөс шаардлагатай талбаруудыг авна
    const { amount, category, date, description, type } = parsedBody.data;

    // Категори өгөгдлийн санд байгаа эсэхийг шалгана
    const categoryRow = await prisma.category.findFirst({
        where: {
            userId: user.id, // Хэрэглэгчийн ID-тай таарч байх ёстой
            name: {
                equals: category.toLowerCase(), // Категорийн нэрийг жижиг үсгээр харьцуулна
            },
        },
    });

    // Хэрэв категори олдохгүй бол алдаа үүсгэнэ
    if (!categoryRow) {
        throw new Error(`Category "${category}" not found for user "${user.id}".`);
    }

    // Гүйлгээ болон түүхийн мэдээллийг нэгэн зэрэг хадгалах
    await prisma.$transaction([
        // Гүйлгээ үүсгэх
        prisma.transaction.create({
            data: {
                userId: user.id,         // Хэрэглэгчийн ID
                amount,                 // Дүн (мөнгөн дүн)
                date,                   // Огноо
                description: description || "", // Тайлбар
                type,                   // Төрөл (зарлага эсвэл орлого)
                category: categoryRow.name,    // Категорийн нэр
                categoryIcon: categoryRow.icon, // Категорийн дүрс
            },
        }),

        // Өдрийн түүхийг шинэчлэх эсвэл үүсгэх
        prisma.monthHistory.upsert({
            where: {
                day_month_year_userId: {
                    userId: user.id,
                    day: date.getUTCDate(),
                    month: date.getUTCMonth(),
                    year: date.getUTCFullYear(),
                },
            },
            create: {
                userId: user.id,
                day: date.getUTCDate(),
                month: date.getUTCMonth(),
                year: date.getUTCFullYear(),
                expense: type === "expense" ? amount : 0, // Хэрэв зарлага бол expense-д нэмэгдүүлнэ
                income: type === "income" ? amount : 0,  // Хэрэв орлого бол income-д нэмэгдүүлнэ
            },
            update: {
                expense: {
                    increment: type === "expense" ? amount : 0, // Зарлагыг нэмэгдүүлэх
                },
                income: {
                    increment: type === "income" ? amount : 0,  // Орлогыг нэмэгдүүлэх
                },
            },
        }),

        // Сарын түүхийг шинэчлэх эсвэл үүсгэх
        prisma.yearHistory.upsert({
            where: {
                month_year_userId: {
                    userId: user.id,
                    month: date.getUTCMonth(),
                    year: date.getUTCFullYear(),
                },
            },
            create: {
                userId: user.id,
                month: date.getUTCMonth(),
                year: date.getUTCFullYear(),
                expense: type === "expense" ? amount : 0, // Зарлагыг нэмнэ
                income: type === "income" ? amount : 0,  // Орлогыг нэмнэ
            },
            update: {
                expense: {
                    increment: type === "expense" ? amount : 0, // Зарлагыг нэмэгдүүлэх
                },
                income: {
                    increment: type === "income" ? amount : 0, // Орлогыг нэмэгдүүлэх
                },
            },
        }),
    ]);

    // Амжилттай болсон хариуг буцаана
    return { success: true, message: "Transaction created successfully." };
}
