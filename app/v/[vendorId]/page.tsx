import React from "react";
import ClientProductViewPerVendor from "@/components/Pages/ClientView/ClientProductView-Vendor/ClientProductView-PerVendor";

export default function VendorStorePage({
    params,
}: {
    params: Promise<{ vendorId: string }>;
}) {
    return (
        <ClientProductViewPerVendor params={params} />
    );
}
