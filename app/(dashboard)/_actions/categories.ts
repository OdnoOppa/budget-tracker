"use server";

import prisma from "@/lib/prisma";
import { CreateCategorySchema, CreateCategorySchematype, DeleteCategorySchemaType } from "@/schema/categories"; // Fixed import
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {DeleteCategorySchema} from "@/schema/categories"

export async function CreateCategory(form: CreateCategorySchematype) {
    const parsedBody = CreateCategorySchema.safeParse(form);
    if (!parsedBody.success) {
        throw new Error("bad request");
    }

    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
        
    }

    const { name, icon, type } = parsedBody.data; // Corrected to destructure from parsed data
    return await prisma.category.create({
        data: {
            userId: user.id,
            name,
            icon,
            type,
        },
    });
}

export async function DeleteCategory(form: DeleteCategorySchemaType){
    const parsedBody = CreateCategorySchema.safeParse(form);
    if(!parsedBody.success) {
        throw new Error("bad request");
    }

    const user = await currentUser();
    if(!user) {
        redirect("/sign-in");
    }

    const categories = await prisma.category.delete({
        where: {
            name_userId_type: {
                userId: user.id,
                name: parsedBody.data.name,
                type: parsedBody.data.type,
            }
        }
    })
}
