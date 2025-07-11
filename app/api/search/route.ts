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
      name: {
        contains: safeQuery,
        mode: "insensitive",
      },
    },
    take: 3,
    select: {
      id: true,
      name: true,
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
            },
          },
        },
      },
    },
  }),
  db.category.findMany({
    where: {
      name: {
        contains: safeQuery,
        mode: "insensitive",
      },
    },
    select: { id: true, name: true },
  }),
]);

    return NextResponse.json({ products, categories });
  } catch (error) {
    console.error("Error search:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
