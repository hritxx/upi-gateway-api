"use client";

import { useEffect, useState } from "react";

export default function UPIPaymentPage() {
  const [amount, setAmount] = useState("10.00");
  const [txnId, setTxnId] = useState("");
  const [qrData, setQrData] = useState<any>(null);
  const [status, setStatus] = useState<"pending" | "success" | "failed" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createOrder = async () => {
    setLoading(true);
    setError(null);
    const txn = `TXN${Date.now()}`;
    setTxnId(txn);

    try {
      const res = await fetch("/api/create-upi-order", {
        method: "POST",
        body: JSON.stringify({
          amount,
          txn_id: txn,
          payer_name: "Test User",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
      }

      console.log("QR Data received:", data);
      setQrData(data);
      setStatus("pending");
    } catch (err: any) {
      console.error("Order creation failed:", err);
      setError(err.message || "Failed to create order");
      setTxnId(""); // Reset transaction ID on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!txnId || status === "success" || status === "failed") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-payment?txn_id=${txnId}`);
        const data = await res.json();

        if (res.ok && data.status && data.status !== "pending") {
          setStatus(data.status);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Payment check failed:", err);
      }
    }, 3000); // poll every 3 seconds

    return () => clearInterval(interval);
  }, [txnId, status]);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Pay with UPI</h1>

      <div className="mt-4">
        <input
          type="number"
          className="border p-2 rounded"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
        />
        <button
          onClick={createOrder}
          disabled={loading || !amount}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? "Creating..." : "Generate QR"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {qrData && (
        <div className="mt-6">
          {qrData.qr_code_url && (
            <img
              src={qrData.qr_code_url}
              alt="Scan to Pay"
              className="w-64 h-64 border"
              onError={(e) => {
                console.error("QR code image failed to load");
                setError("QR code image could not be loaded");
              }}
            />
          )}
          <p className="mt-2">
            or{" "}
            <a
              href={qrData.payment_url || qrData.upi_link}
              className="text-blue-600 underline"
            >
              Pay via UPI App
            </a>
          </p>

          <div className="mt-4 p-4 border rounded">
            <p>
              <strong>Transaction ID:</strong> {txnId}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {status === "pending"
                ? "⏳ Pending"
                : status === "success"
                ? "✅ Success"
                : "❌ Failed"}
            </p>
            <p>
              <strong>Amount:</strong> ₹{amount}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
