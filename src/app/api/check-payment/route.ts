import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { txnStore } from "../create-upi-order/route";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const txn_id = searchParams.get("txn_id");

  if (!txn_id) {
    return NextResponse.json(
      { error: "Transaction ID is required" },
      { status: 400 }
    );
  }

  // First check our in-memory store
  if (txnStore[txn_id]) {
    return NextResponse.json({
      status: txnStore[txn_id].status || "pending",
      txn_id,
      amount: txnStore[txn_id].amount,
    });
  }

  // If not found in store, check with external API
  if (!process.env.UPI_API_KEY) {
    return NextResponse.json(
      { error: "UPI API key not configured" },
      { status: 500 }
    );
  }

  const txn_date = new Date()
    .toISOString()
    .split("T")[0]
    .split("-")
    .reverse()
    .join("-"); // dd-mm-yyyy

  try {
    const res = await axios.post("https://api.ekqr.in/api/check_order_status", {
      key: process.env.UPI_API_KEY,
      client_txn_id: txn_id,
      txn_date,
    });

    const responseData = res.data?.data || res.data;

    // Update our store if we get a response
    if (txnStore[txn_id]) {
      //@ts-expect-error we are updating the existing transaction
      txnStore[txn_id].status = responseData.status || "pending";
    }

    return NextResponse.json(responseData);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    const errorData = axios.isAxiosError(err) ? err.response?.data : undefined;
    console.error("Payment check error:", errorData || errorMessage);
    return NextResponse.json(
      { error: "Unable to fetch status", details: errorMessage },
      { status: 400 }
    );
  }
}
