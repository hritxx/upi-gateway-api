interface TransactionData {
  key: string;
  client_txn_id: string;
  amount: number;
  p_info: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  redirect_url: string;
  udf1: string;
  udf2: string;
  udf3: string;
  createdAt: string;
  status: string;
  payment_url: string;
  qr_code_url?: string;
}

export const txnStore: Record<string, TransactionData> = {};
