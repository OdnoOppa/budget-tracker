"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function DeleteTransaction(id: string) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const transaction = await prisma.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!transaction) {
    throw new Error("Bad request: Transaction not found");
  }

  await prisma.$transaction([
    // Delete transaction from the database
    prisma.transaction.delete({
      where: {
        id,
        userId: user.id,
      },
    }),
    // Update monthly history
    prisma.monthHistory.update({
      where: {
        day_month_year_userId: {
          userId: user.id,
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
          day: transaction.date.getUTCDate(), // Ensure to match all required fields
        },
      },
      data: {
        ...(transaction.type === "expense" && {
          expense: {
            decrement: transaction.amount,
          },
        }),
        ...(transaction.type === "income" && {
          income: {
            decrement: transaction.amount,
          },
        }),
      },
    }),
  ]);
}
