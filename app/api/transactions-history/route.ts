import { GetFormatterForCurrency } from "@/lib/helper";
import prisma from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { redirect } from "next/navigation";
import { currentUser, User } from "@clerk/nextjs/server";

//  @author Erdenesuren

// Энэ серверийн код нь хэрэглэгчийн гүйлгээний түүхийг авах зорилготой. Хэрэглэгч нэвтэрсэн эсэхийг шалгаж, 
// түүний тохиргоонд үндэслэн гүйлгээний мэдээллийг авах процессийг удирддаг.

export async function GET(request: Request) {
  // Хэрэглэгчийн мэдээллийг авах (Clerk ашиглан)
  const user: User | null = await currentUser(); // Засвар: зөв өөрчлөлт ба төрөл

  if (!user) {
    // Хэрэв хэрэглэгч нэвтрээгүй бол sign-in хуудс руу чиглүүлэх
    redirect("/sign-in");
  }

  // URL-ийн search параметрүүдийг авах
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // Query параметрүүдийг OverviewQuerySchema ашиглан шалгах
  const queryParams = OverviewQuerySchema.safeParse({
    from,
    to,
  });

  if (!queryParams.success) {
    // Хэрэв шалгалт амжилтгүй бол алдааны мессежийг буцаах
    return new Response(queryParams.error.message, { // Засвар: 'Response' бага үсгээр ашиглах
      status: 400,
    });
  }

  // Шалгалт дамжсан тохиолдолд гүйлгээний түүхийг авах
  const transactions = await getTransactionsHistory(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  );

  // Гүйлгээний түүхийг JSON хэлбэрээр буцаах
  return new Response(JSON.stringify(transactions), { // Засвар: JSON.stringify ашиглах
    status: 200,
  });
}

// Гүйлгээний түүхийг авах төрөл
export type GetTransactionsHistoryResponseType = Awaited<
  ReturnType<typeof getTransactionsHistory>
>;

// Гүйлгээний түүхийг авах тусдаа функц
async function getTransactionsHistory(userId: string, from: Date, to: Date) {
  // Хэрэглэгчийн тохиргоог авах
  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId,
    },
  });

  if (!userSettings) {
    // Хэрэв хэрэглэгчийн тохиргоо олдохгүй бол алдаа гаргах
    throw new Error("user settings not found");
  }

  // Хэрэглэгчийн валютын тохиргоонд үндэслэн форматлагч авах
  const formatter = GetFormatterForCurrency(userSettings.currency);

  // Гүйлгээний түүхийг олж авах
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: from, // Эхлэх огноо
        lte: to,   // Төгсгөл огноо
      },
    },
    orderBy: {
      date: "desc", // Огноогоор бууралттайгаар байрлуулах
    },
  });

  // Гүйлгээний мэдээллийг format-тайгаар буцаах
  return transactions.map((transaction) => ({
    ...transaction,
    formattedAmount: formatter.format(transaction.amount), // Засвар: 'formattedAmount' тэмдэглэгээний алдаа зассан
  }));
}
