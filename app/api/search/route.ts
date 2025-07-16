import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 1) {
    return NextResponse.json({ products: [], categories: [] });
  }

  const safeQuery = query.replace(/[%_]/g, "\\$&");

  try {
    const [products, categories] = await Promise.all([
      db.product.findMany({
        where: {
          OR: [
            { name: { contains: safeQuery, mode: "insensitive" } },
            { nameAr: { contains: safeQuery, mode: "insensitive" } },
          ],
        },
        take: 3,
        select: {
          id: true,
          name: true,
          nameAr: true,
          slug: true,
          variants: {
            select: {
              id: true,
              images: {
                take: 1,
                orderBy: { id: "asc" },
                select: {
                  url: true,
                  altText: true,
                  altTextAr: true,
                },
              },
            },
          },
        },
      }),
      db.category.findMany({
        where: {
          OR: [
            { name: { contains: safeQuery, mode: "insensitive" } },
            { nameAr: { contains: safeQuery, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, nameAr: true },
        take: 5, // Limit categories for performance
      }),
    ]);

    return NextResponse.json({ products, categories });
  } catch (error) {
    console.error("Error search:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}