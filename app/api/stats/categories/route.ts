import prisma from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

//  @author Odontuya

// Энэ сервер талын код нь хэрэглэгчийн гүйлгээний төрөл (орлого, зарлага) болон ангиллаар статистик мэдээллийг авахад ашиглагддаг.
export async function GET(request: Request) {
  // Хэрэглэгчийн мэдээллийг авах
  const user = await currentUser();

  if (!user) {
      // Хэрэв хэрэглэгч нэвтрээгүй бол sign-in хуудс руу чиглүүлэх
      redirect("/sign-in");
      return;
  }

  // URL-аас "from" болон "to" параметрүүдийг авах
  const searchParams = new URL(request.url).searchParams;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // OverviewQuerySchema-ийг ашиглан query параметрүүдийг шалгах
  const queryParams = OverviewQuerySchema.safeParse({ from, to });

  if (!queryParams.success) {
      // Хэрэв шалгалт амжилтгүй бол алдааны мессежийг гаргах
      throw new Error(queryParams.error.message);
  }

  // Шалгалт дамжсан тохиолдолд, ангилалын статистикийг авах
  const stats = await getCategoriesStats(
      user.id,
      queryParams.data.from,
      queryParams.data.to
  );

  // Ангилалын статистикийг хариу болгон буцаах
  return Response.json(stats);
}

// Гүйлгээний төрөл болон ангилалын статистикийг авах тусдаа функц
export type GetCategoriesStatsResponseType = Awaited<ReturnType<typeof getCategoriesStats>>;

async function getCategoriesStats(userId: string, from: Date, to: Date) {
  // Гүйлгээний төрөл, ангилал, ангиллын icon болон нийт дүнгийн мэдээллийг авах
  const stats = await prisma.transaction.groupBy({
      by: ["type", "category", "categoryIcon"],  // Төрөл, ангилал, ангиллын icon-ийг групп хийх
      where: {
          userId,  // Хэрэглэгчийн ID-гаар шүүх
          date: {
              gte: from, // Эхлэх хугацаа
              lte: to,   // Төгсгөл хугацаа
          },
      },
      _sum: {
          amount: true,  // Төсвийн дүнгийн нийлбэрийг авах
      },
      orderBy: {
          _sum: {
              amount: "desc", // Нийт дүнгийн дагуу бууралттайгаар байршуулна
          },
      },
  });

  // Статистикийг map ашиглан хариу болгон боловсруулж буцаах
  return stats.map((stat) => ({
      type: stat.type,  // Гүйлгээний төрөл
      category: stat.category,  // Ангилал
      categoryIcon: stat.categoryIcon,  // Ангиллын icon
      totalAmount: stat._sum?.amount ?? 0,  // Нийт дүнг аюулгүй олж авах
  }));
}
