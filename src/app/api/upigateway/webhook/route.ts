import { NextRequest, NextResponse } from "next/server";
import { txnStore } from "@/utils/txnStore";
import qs from "qs";

export async function POST(req: NextRequest) {
  const rawText = await req.text();
  const data = qs.parse(rawText); // parse x-www-form-urlencoded

  console.log("Webhook received:", data);

  const txnId = data.client_txn_id as string;
  if (txnStore[txnId]) {
    txnStore[txnId] = {
      ...txnStore[txnId],
      ...data,
      status: data.status as string,
    };
  }

  return NextResponse.json({ status: "ok" });
}
