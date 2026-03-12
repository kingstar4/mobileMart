import ProductDetailsPage from "@/components/Pages/ClientView/ClientProductView-Vendor/ProductDetails/ProductDetailsPage";

export default async function PublicProductPage({ params }: { params: Promise<{ vendorId: string; productId: string }> }) {
    const { vendorId, productId } = await params;
    return <ProductDetailsPage vendorId={vendorId} productId={productId} />;
}
