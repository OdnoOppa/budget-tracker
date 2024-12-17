"use client";

// Төрлийн импорт болон туслах сангууд
import { GetCategoriesStatsResponseType } from "@/app/api/stats/categories/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helper";
import { TransactionType } from "@/lib/types";
import { UserSettings } from "@prisma/client";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";

//  @author Odontuya

// Props-ийн төрлийг тодорхойлно
interface Props {
  userSettings: UserSettings; // Хэрэглэгчийн тохиргоо (валют г.м)
  from: Date; // Хугацааны эхлэл
  to: Date; // Хугацааны төгсгөл
}

// Хэрэглэгчийн орлого, зарлагын статистикийг харуулах гол функц
function CategoriesStats({ userSettings, from, to }: Props) {
  // Статистик өгөгдлийг авах API дуудлага
  const statsQuery = useQuery<GetCategoriesStatsResponseType>({
    queryKey: ["overview", "stats", "categories", from, to], // Кэшлэгдсэн түлхүүр
    queryFn: () =>
      fetch(`/api/stats/categories?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`)
        .then((res) => res.json()),
  });

  // Валют форматлагч функцыг үүсгэнэ
  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  return (
    <div className="flex w-full flex-wrap gap-2 md:flex-nowrap">
      {/* Орлого харуулах карт */}
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <CategoriesCard
          formatter={formatter}
          type="income"
          data={statsQuery.data || []}
        />
      </SkeletonWrapper>

      {/* Зарлага харуулах карт */}
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <CategoriesCard
          formatter={formatter}
          type="expense"
          data={statsQuery.data || []}
        />
      </SkeletonWrapper>
    </div>
  );
}

export default CategoriesStats;

// Орлого, зарлагын категорийн картын функц
function CategoriesCard({
    data, // Бүх статистик өгөгдөл
    type, // Төрөл: "income" эсвэл "expense"
    formatter, // Валют форматлагч
  }: {
    type: TransactionType; // Төрлийн тодорхойлолт
    formatter: Intl.NumberFormat; // Валют форматлагч
    data: GetCategoriesStatsResponseType; // Статистик өгөгдлийн төрөл
  }) {
    // Тухайн төрлөөр нь шүүж авах (income эсвэл expense)
    const filteredData = data.filter((el) => el.type === type);

    // Нийт дүнг тооцоолно
    const total = filteredData.reduce((acc, el) => acc + el.totalAmount, 0);

    return (
      <Card className="h-80 w-full col-span-6">
        <CardHeader>
          {/* Картын гарчиг */}
          <CardTitle className="grid grid-flow-row justify-between gap-2 text-muted-foreground md:grid-flow-col">
            {type === "income" ? "Incomes" : "Expenses"} by category
          </CardTitle>
        </CardHeader>

        <div className="flex items-center justify-between gap-2">
          {/* Хоосон үед харуулах хэсэг */}
          {filteredData.length === 0 && (
            <div className="flex h-60 w-full flex-col items-center justify-center">
              <p>Сонгосон хугацаанд өгөгдөл байхгүй</p>
              <p className="text-sm text-muted-foreground">
                Өөр хугацаа сонгох эсвэл шинэ{" "}
                {type === "income" ? "орлого" : "зарлага"} нэмэхийг оролдоно уу.
              </p>
            </div>
          )}

          {/* Өгөгдөлтэй үед харуулах хэсэг */}
          {filteredData.length > 0 && (
            <ScrollArea className="h-60 w-full px-4">
              <div className="flex w-full flex-col gap-4 p-4">
                {filteredData.map((item) => {
                  const amount = item.totalAmount; // Нийт дүн
                  const percentage = (amount * 100) / (total || amount); // Хувь тооцоолох

                  return (
                    <div key={item.category} className="flex flex-col gap-2">
                      {/* Категори болон хувь */}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center text-gray-400">
                          {item.categoryIcon} {item.category}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({percentage.toFixed(0)}%) {/* Хувийг бүхэл тоогоор */}
                          </span>
                        </span>

                        {/* Валют форматлаж харуулах */}
                        <span className="text-sm text-gray-400">
                          {formatter.format(amount)}
                        </span>
                      </div>

                      {/* Хувийг progress бар-р харуулах */}
                      <Progress
                        value={percentage}
                        indicator={
                          type === "income" ? "bg-emerald=500" :
                          "bg-red-500"
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </Card>
    );
  }
