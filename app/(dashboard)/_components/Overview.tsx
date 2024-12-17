"use client"; 

// Шаардлагатай модуль болон компонентуудыг импортолж байна.
import { DateRangePicker } from "@/components/ui/date-range-picker"; // Огнооны хүрээ сонгогч
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants"; // Хамгийн их хугацааны хязгаар
import { UserSettings } from "@prisma/client"; // Хэрэглэгчийн тохиргооны төрөл
import { differenceInDays, startOfMonth } from "date-fns"; // Огноо тооцооллын функцууд
import React, { useState } from "react"; 
import { toast } from "sonner"; // Хэрэглэгчид мэдэгдэл харуулахад ашиглана.
import StatsCards from "./StatsCards"; // Статистикийн картуудыг харуулах компонент
import CategoryPicker from "./CategoryPicker"; // Категори сонгогч (ашиглагдаагүй байна)
import CategoriesStats from "./CategoriesStats"; // Категорийн статистик харуулах компонент

// @author Odontuya (Зохиогчийн нэрийг тодорхой заажээ)

function Overview({ userSettings }: { userSettings: UserSettings }) {
    // Огнооны хүрээг удирдах `useState` 
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: startOfMonth(new Date()), // Энэ сарын эхний өдөр
        to: new Date(), // Өнөөдөр
    });

    return (
        <>
            {/* Толгой хэсэг: Гарчиг болон Огнооны хүрээ сонгогч */}
            <div className="flex items-center justify-center">
                <div className="flex w-full max-w-4xl items-end justify-between px-4 py-6">
                    <h2 className="text-3xl font-bold">Overview</h2> {/* Хуудасны гарчиг */}
                    <div className="flex items-center gap-3">
                        {/* Огнооны хүрээ сонгогч */}
                        <DateRangePicker
                            initialCompareFrom={dateRange.from} // Эхний огноо
                            initialCompareTo={dateRange.to} // Дуусах огноо
                            showCompare={false} // Харьцуулалт харуулахгүй
                            onUpdate={(values: { range: { from?: Date; to?: Date } }) => {
                                const { from, to } = values.range || {}; // Сонгосон огноонууд

                                if (!from || !to) return; // Огноо сонгогдоогүй бол юу ч хийхгүй

                                // Хамгийн их боломжит хугацааны хязгаарлалт
                                if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                                    toast.error(
                                        `The selected date range is too big. Max allowed is ${MAX_DATE_RANGE_DAYS} days.`
                                    );
                                    return;
                                }

                                // Огнооны хүрээг шинэчилнэ
                                setDateRange({ from, to });
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Үндсэн контент хэсэг */}
            <div className="container flex w-full flex-col gap-2">
                {/* Статистикийн картууд */}
                <StatsCards
                    userSettings={userSettings}
                    from={dateRange.from}
                    to={dateRange.to}
                />

                {/* Категорийн статистик */}
                <CategoriesStats
                    userSettings={userSettings}
                    from={dateRange.from}
                    to={dateRange.to}
                />
            </div>
        </>
    );
}

export default Overview; // Компонентыг экспортолж байна.
