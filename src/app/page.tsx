import Link from "next/link";
import React from "react";

const Page = () => {
  return (
    <div>
      <Link href="/upi">
        <h1 className="text-3xl font-bold text-center mt-10">
          UPI Payment Demo
        </h1>
      </Link>
      <p className="text-center mt-4">
        This is a simple demo for UPI payments using the{" "}
        <a href="https://ekqr.in" className="text-blue-600 underline">
          ekQR API
        </a>
        .
      </p>
    </div>
  );
};

export default Page;
