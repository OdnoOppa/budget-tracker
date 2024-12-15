import { GetFormatterForCurrency } from "@/lib/helper";
import prisma from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { redirect } from "next/navigation";
import { currentUser, User } from "@clerk/nextjs/server";


export async function GET(request: Request) {
  const user: User | null = await currentUser(); // Fix: Correct assignment and type

  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const queryParams = OverviewQuerySchema.safeParse({
    from,
    to,
  });

  if (!queryParams.success) {
    return new Response(queryParams.error.message, { // Fix: Use lowercase 'Response'
      status: 400,
    });
  }

  const transactions = await getTransactionsHistory(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  );

  return new Response(JSON.stringify(transactions), { // Fix: Stringify response
    status: 200,
  });
}

export type GetTransactionsHistoryResponseType = Awaited<
  ReturnType<typeof getTransactionsHistory>
>;

async function getTransactionsHistory(userId: string, from: Date, to: Date) {
  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId,
    },
  });
  
  if (!userSettings) {
    throw new Error("user settings not found");
  }

  const formatter = GetFormatterForCurrency(userSettings.currency);
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  return transactions.map((transaction) => ({
    ...transaction,
    formattedAmount: formatter.format(transaction.amount), // Fix: corrected typo in 'formattedAmount'
  }));
}
