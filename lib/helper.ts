
//lib/helper.ts
import { Currencies } from "./currencies";

export function DateToUTCDate(date: Date) {
    return new Date(
        Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
        )
    );
}

export function GetFormatterForCurrency(currency: string) {
    const locale = Currencies.find((c) => c.value === currency)?.locale;
  
    if (!locale) {
      throw new Error(`Locale for currency ${currency} not found`);
    }
  
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    });
  }
  //npx prisma generate
//npx prisma migrate dev --name zuv
//npx prisma migrate reset
//npx prisma introspect
//npx prisma studio