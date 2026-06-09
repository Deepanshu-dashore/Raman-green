import { connectDB } from "@/app/lib/db/connectDB";
import { Product } from "@/app/lib/featuers/product/product.model";
import { notDeletedFilter, variantPopulate } from "@/app/lib/utils/softDelete";
import { getUrls } from "@/app/lib/utils/geturl";
import { ApiResponse } from "@/app/lib/utils/ApiResponse";
import { NextRequest } from "next/server";

// Force dynamic execution since we are accessing request searchParams and connecting to DB
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        
        const featured = searchParams.get("featured") === "true";
        const newest = searchParams.get("newest") === "true";
        const limitParam = searchParams.get("limit");
        const limit = limitParam ? parseInt(limitParam, 10) : 8;
        
        // Build query
        const filter: any = {
            isPublished: true,
            ...notDeletedFilter
        };
        
        if (featured) {
            filter.isFeatured = true;
        }
        
        // Build sort
        let sortQuery: any = { createdAt: -1 }; // default newest
        if (featured && !newest) {
            sortQuery = { isFeatured: -1, createdAt: -1 };
        }
        
        const products = await Product.find(filter)
            .sort(sortQuery)
            .limit(limit)
            .populate("category")
            .populate(variantPopulate);
            
        // Map to minimal card layout
        const minimalProducts = products.map((product: any) => {
            const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
            
            let formattedPrice = "₹0";
            let formattedOriginalPrice = undefined;
            
            if (firstVariant) {
                const basePrice = firstVariant.basePrice || 0;
                const discountedPrice = firstVariant.discountedPrice || 0;
                
                if (discountedPrice > 0 && discountedPrice < basePrice) {
                    formattedPrice = `₹${discountedPrice}`;
                    formattedOriginalPrice = `₹${basePrice}`;
                } else {
                    formattedPrice = `₹${basePrice}`;
                }
            }
            
            // Image resolution
            let image = "";
            if (firstVariant && firstVariant.images && firstVariant.images.length > 0) {
                const imgPath = firstVariant.images[0];
                image = getUrls.getUrl(imgPath) || imgPath;
            } else {
                // High-quality fallback botanical image if no variant image
                image = "https://images.unsplash.com/photo-1598030304671-5aa1d6f21128?w=600&q=80";
            }
            
            return {
                id: product._id.toString(),
                name: product.name,
                description: product.description || "",
                price: formattedPrice,
                originalPrice: formattedOriginalPrice,
                image,
                tags: product.tags || [],
                category: product.category?.slug || "organic",
                isFeatured: product.isFeatured || false,
                createdAt: product.createdAt
            };
        });
        
        return ApiResponse(200, minimalProducts, "Minimal products fetched successfully.");
    } catch (error: any) {
        console.error("Error fetching minimal products:", error);
        return ApiResponse(500, null, error.message || "Failed to fetch minimal products.");
    }
}
