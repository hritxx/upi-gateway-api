import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { txnStore } from "@/utils/txnStore"; // Assuming txnStore is defined in a separate file

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Handle both parameter formats
  const {
    amount,
    txn_id: providedTxnId,
    payer_name,
    customer_name,
    customer_email,
    customer_mobile,
    p_info,
  } = body;

  const txn_id = providedTxnId || `TXN${Date.now()}`;

  // Check if environment variable is set
  if (!process.env.UPI_API_KEY) {
    console.error("UPI_API_KEY not found in environment variables");
    return NextResponse.json(
      { error: "UPI API key not configured" },
      { status: 500 }
    );
  }

  const payload = {
    key: process.env.UPI_API_KEY,
    client_txn_id: txn_id,
    amount,
    p_info: p_info || "Payment",
    customer_name: customer_name || payer_name || "Test User",
    customer_email: customer_email || "test@example.com",
    customer_mobile: customer_mobile || "9999999999",
    redirect_url:
      process.env.NEXT_PUBLIC_UPI_REDIRECT_URL ||
      "https://www.upi-gateway-api.app/",
    udf1: "NA",
    udf2: "NA",
    udf3: "NA",
  };

  console.log("Creating order with payload:", payload);

  try {
    const response = await axios.post(
      "https://api.ekqr.in/api/create_order",
      payload,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000, // 10 second timeout
      }
    );

    console.log("API Response:", response.data);

    // Handle different response structures
    const responseData = response.data;
    const paymentUrl =
      responseData?.data?.payment_url ||
      responseData?.payment_url ||
      responseData?.upi_link;

    const qrCodeUrl =
      responseData?.data?.qr_code_url ||
      responseData?.qr_code_url ||
      responseData?.qr_code;

    if (!paymentUrl) {
      console.error("No payment URL in response:", responseData);
      return NextResponse.json(
        {
          error: "Invalid response from payment gateway",
          details: responseData,
        },
        { status: 500 }
      );
    }

    txnStore[txn_id] = {
      ...payload,
      createdAt: new Date().toISOString(),
      status: "pending",
      payment_url: paymentUrl,
      qr_code_url: qrCodeUrl,
    };

    return NextResponse.json({
      txn_id,
      payment_url: paymentUrl,
      qr_code_url: qrCodeUrl,
      upi_link: paymentUrl,
      status: "pending",
    });
  } catch (err: unknown) {
    const error = err as Error & {
      response?: { data?: unknown; status?: number };
    };
    console.error("API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
