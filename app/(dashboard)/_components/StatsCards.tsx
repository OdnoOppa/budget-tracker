import { GetBalanceStatsResponseType } from "@/app/api/stats/balance/route";
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helper";
import { UserSettings } from "@prisma/client";
import React, { ReactNode, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import CountUp from "react-countup"

//  @author Erdenesuren

interface Props {
  from: Date;
  to: Date;
  userSettings: UserSettings;
}

// StatsCards функц нь орлого, зарлага, үлдэгдэл харуулдаг гол компонент юм.
function StatsCards({ from, to, userSettings }: Props) {
  // React Query ашиглан өгөгдөл татах хүсэлтийг тодорхойлж байна.
  const statsQuery = useQuery<GetBalanceStatsResponseType>({
    queryKey: ["overview", "stats", from, to], // Өгөгдлийг кэшлэх түлхүүр
    queryFn: () =>
      fetch(
        `/api/stats/balance?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`
      ).then((res) => res.json()), // API-ээс JSON хэлбэрээр хариу авна.
  });

  // Хэрэглэгчийн тохиргооноос хамаарч валютын форматлагчийг үүсгэж байна.
  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  // Орлого, зарлагын утга ба үлдэгдлийг тооцоолж байна.
  const income = statsQuery.data?.income || 0;
  const expense = statsQuery.data?.expense || 0;
  const balance = income - expense;

  // SkeletonWrapper ашиглан ачааллаж байгаа үед placeholder харуулна.
  return <div className="relative flex w-full flex-wrap gap-2 md:flex-nowrap">
    <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard
        formatter={formatter}
        value={income} // Орлогын утга
        title="Income" // Орлого гэсэн гарчиг
        icon={
            <TrendingUp className="h-12 w-12 items-center rounded-lg p-2
            text-emerald-500 bg-emerald-400/10"/> // Өсөлтийг илтгэх дүрс
        }
        />
    </SkeletonWrapper>
    <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard
        formatter={formatter}
        value={expense} // Зарлагын утга
        title="Expense" // Зарлага гэсэн гарчиг
        icon={
            <TrendingDown className="h-12 w-12 items-center rounded-lg p-2
            text-red-500 bg-emerald-400/10"/> // Буурахыг илтгэх дүрс
        }
        />
    </SkeletonWrapper>
    <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard
        formatter={formatter}
        value={balance} // Үлдэгдэл
        title="Balance" // Үлдэгдэл гэсэн гарчиг
        icon={
            <Wallet className="h-12 w-12 items-center rounded-lg p-2
            text-violet-500 bg-emerald-400/10"/> // Хэтэвчний дүрс
        }
        />
    </SkeletonWrapper>
    </div>;
}

export default StatsCards;

// StatCard компонент нь нэг статистик картыг харуулна.
function StatCard({formatter,
  value,
  title,
  icon,
}: {
    formatter: Intl.NumberFormat; // Тоог форматлах функц
    icon: ReactNode; // Дүрс
    title: String; // Гарчиг
    value: number; // Утга
}) {
  // Утгыг форматлах функц
  const formatFn = useCallback(
    (value: number) => {
      return formatter.format(value);
    },
    [formatter]
  );
  return (
    <Card className="flex h-24 w-full items-center gap-2 p-4">
      {icon} {/* Дүрс */}
      <div className="flex flex-col items-center gap-0">
        <p className="text-muted-foreground">{title}</p> {/* Гарчиг */}
        <CountUp
          preserveValue
          redraw={false}
          end={value} // Тооны эцсийн утга
          decimals={2} // Аравтын орны тоо
          formattingFn={formatFn} // Форматлах функц
          className="text-2xl" 
        />
      </div>
    </Card>
  );
};