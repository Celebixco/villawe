import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth/session";

export async function POST() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    {
      error:
        "Bu endpoint doğrudan kullanılmaz. Güvenli yükleme akışı admin panelindeki server action formları üzerinden çalışır.",
    },
    { status: 410 },
  );
}
