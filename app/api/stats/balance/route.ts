import prisma from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

//  @author Odontuya

// Энэ сервер талын код нь хэрэглэгчийн гүйлгээний мэдээлэл (орлого, зарлага) хоорондын статистик мэдээллийг авахад ашиглагддаг.
export async function GET(request: Request) {
  // Хэрэглэгчийн мэдээллийг авах
  const user = await currentUser();

  if (!user) {
    // Хэрэв хэрэглэгч нэвтрээгүй бол sign-in хуудс руу чиглүүлэх
    return redirect("/sign-in");
  }

  // URL-аас "from" болон "to" параметрүүдийг авах
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // OverviewQuerySchema-ийг ашиглан query параметрүүдийг шалгах
  const queryParams = OverviewQuerySchema.safeParse({ from, to });

  if (!queryParams.success) {
    // Хэрэв шалгалт амжилтгүй бол алдааны мессежийг 400 статус кодтой буцаах
    return Response.json(queryParams.error.message, {
      status: 400,
    });
  }

  // Шалгалт дамжсан тохиолдолд, гүйлгээний статистикийг авах
  const stats = await getBalanceStats(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  );

  // Статистикийг хариу болгон буцаах
  return Response.json(stats);
}

// Гүйлгээний статистикийг авах тусдаа функц
export type GetBalanceStatsResponseType = Awaited<ReturnType<typeof getBalanceStats>>;

async function getBalanceStats(userId: string, from: Date, to: Date) {
  // Гүйлгээний төрөл бүрээр (орлого, зарлага) нэгж хугацаа доторхи суммыг авах
  const totals = await prisma.transaction.groupBy({
    by: ["type"], // Гүйлгээний төрөл (income, expense)
    where: {
      userId, // Хэрэглэгчийн ID-гаар шүүх
      date: {
        gte: from, // Эхлэх хугацаа
        lte: to, // Төгсгөл хугацаа
      },
    },
    _sum: {
      amount: true, // Төсвийн дүнгийн нийлбэрийг авах
    },
  });

  // Орлого болон зарлагын мэдээллийг буцаах
  return {
    expense: totals.find((t) => t.type === "expense")?._sum.amount || 0, // Зарлагын нийт дүн
    income: totals.find((t) => t.type === "income")?._sum.amount || 0,   // Орлогын нийт дүн
  };
}



