import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function GET (
  _req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {

    if (!params.categoryId) {
      return new NextResponse('Billboard id is required', { status: 400 });
    }

    const category = await prismadb.category.findUnique({
      where: {
        id: params.categoryId,
      }
    });

    return NextResponse.json(category);
  } catch (err) {
    console.log('[CATEGORIES_GET]', err);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH (
  req: Request,
  { params }: { params: { storeId: string, categoryId: string } }
) {
  try {

    const { userId } = auth();
    const body = await req.json();

    const { name, billboardId } = body;

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 403 });
    }

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }

    if (!billboardId) {
      return new NextResponse('Billboard ID is required', { status: 400 });
    }

    if (!params.categoryId) {
      return new NextResponse('Category id is required', { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const category = await prismadb.category.update({
      where: {
        id: params.categoryId,
      },
      data: {
        name,
        billboardId
      }
    });

    return NextResponse.json(category);
  } catch (err) {
    console.log('[CATEGORIES_PATCH]', err);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE (
  _req: Request,
  { params }: { params: { storeId: string, categoryId: string } }
) {
  try {

    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 });
    }

    if (!params.categoryId) {
      return new NextResponse('Category id is required', { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const category = await prismadb.category.delete({
      where: {
        id: params.categoryId,
      }
    });

    return NextResponse.json(category);
  } catch (err) {
    console.log('[CATEGORIES_DELETE]', err);
    return new NextResponse('Internal error', { status: 500 });
  }
}
