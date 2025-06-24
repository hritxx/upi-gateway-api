"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ThankYou() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Log all query parameters for debugging
    const params = Object.fromEntries(searchParams.entries());
    console.log("Thank you page received params:", params);
  }, [searchParams]);

  const status = searchParams.get("status");
  const txnId = searchParams.get("txn_id") || searchParams.get("client_txn_id");
  const amount = searchParams.get("amount");

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold mb-6">Payment Status</h1>

      {status === "success" ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded">
          <h2 className="text-xl font-semibold">✅ Payment Successful!</h2>
          <p className="mt-2">Your payment has been processed successfully.</p>
        </div>
      ) : status === "failed" ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded">
          <h2 className="text-xl font-semibold">❌ Payment Failed</h2>
          <p className="mt-2">Your payment could not be processed.</p>
        </div>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded">
          <h2 className="text-xl font-semibold">⏳ Payment Pending</h2>
          <p className="mt-2">Your payment is being processed.</p>
        </div>
      )}

      {txnId && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <p>
            <strong>Transaction ID:</strong> {txnId}
          </p>
          {amount && (
            <p>
              <strong>Amount:</strong> ₹{amount}
            </p>
          )}
        </div>
      )}

      <div className="mt-6">
        <a
          href="/upi"
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          Make Another Payment
        </a>
      </div>
    </div>
  );
}
