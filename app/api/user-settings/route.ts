// app/api/user-settings/route.ts
export {currentUser} from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
//  @author Erdenesuren

// Хэрэглэгчийн тохиргоог авах эсвэл үүсгэх GET хүсэлт
export async function GET(request: Request) {
    // Хэрэглэгчийн мэдээллийг авч байна
    const user = await currentUser();

    if (!user) {
        // Хэрэглэгч нэвтрээгүй бол /sign-in хуудас руу чиглүүлнэ
        redirect("/sign-in");
    }

    // Хэрэглэгчийн тохиргоог өгөгдлийн сангаас хайж байна
    let userSettings = await prisma.userSettings.findUnique({
        where: {
            userId: user.id, // Хэрэглэгчийн ID ашиглан тохиргоог олох
        },
    });

    if (!userSettings) {
        // Хэрэв тохиргоо олдохгүй бол шинэ тохиргоо үүсгэнэ
        userSettings = await prisma.userSettings.create({
            data: {
                userId: user.id, // Хэрэглэгчийн ID-тай тохиргоо үүсгэнэ
                currency: "MNT", // Үндсэн валют болох MNT-г тохируулах
            },
        });
    }

    // Хуудас дахин шинэчлэх (ревайлд хийх)
    revalidatePath("/");

    // Тохиргоог JSON хэлбэрээр буцаана
    return Response.json(userSettings);
}