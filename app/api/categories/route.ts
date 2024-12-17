import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

//  @author Odontuya

// Энэ сервер талын функц нь хэрэглэгчийн гүйлгээний төрөл (орлого эсвэл зарлага) дээр үндэслэн категориудыг хайж олдог.
export async function GET(request: Request) {
    // Хэрэглэгчийн мэдээллийг авах
    const user = await currentUser();
    if (!user) {
        return redirect("/sign-in"); // Хэрэглэгч нэвтэрээгүй бол sign-in хуудс руу чиглүүлэх
    }

    // URL-аас type параметрийг авах
    const { searchParams } = new URL(request.url);
    const paramType = searchParams.get("type");

    // Зодын ашиглан type параметрийн утгыг шалгах (зөвхөн "expense" эсвэл "income" байж болно)
    const validator = z.enum(["expense", "income"]).nullable();

    // Параметрийг шалгаж, алдааг буцаах
    const queryParams = validator.safeParse(paramType);
    if (!queryParams.success) {
        return Response.json(queryParams.error, {
            status: 400, // Хэрвээ параметр буруу байвал 400 алдааны код буцаана
        });
    }

    // Шалгалт дамжсан тохиолдолд, параметрийг авна
    const type = queryParams.data;

    // Хэрэглэгчийн категориудыг тусгайлан хайж олох (орлого эсвэл зарлагын төрлөөр)
    const categories = await prisma.category.findMany({
        where: {
            userId: user.id, // Хэрэглэгчийн ID-гаар шүүх
            ...(type && { type }), // Хэрвээ төрлийн параметр байгаа бол хэрэглэнэ
        },
        orderBy: {
            name: "asc", // Категориудыг нэрээр нь өсөх дарааллаар ангилах
        },
    });

    // Категориудыг хариу болгон буцаах
    return Response.json(categories);
}
