import { connectDB } from "@/app/lib/db/connectDB";
import { Product } from "@/app/lib/featuers/product/product.model";
import { Category } from "@/app/lib/featuers/category/category.model";
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
        
        const pageParam = searchParams.get("page");
        const page = pageParam ? parseInt(pageParam, 10) : 1;
        const limitParam = searchParams.get("limit");
        const limit = limitParam ? parseInt(limitParam, 10) : 8;
        const skip = (page - 1) * limit;
        
        const categorySlug = searchParams.get("category");
        const search = searchParams.get("search");
        
        // Build query
        const filter: any = {
            isPublished: true,
            ...notDeletedFilter
        };
        
        if (featured) {
            filter.isFeatured = true;
        }
        
        if (categorySlug) {
            const category = await Category.findOne({ slug: categorySlug, ...notDeletedFilter });
            if (category) {
                filter.category = category._id;
            } else {
                // If category not found, return empty data
                return ApiResponse(200, {
                    products: [],
                    pagination: {
                        total: 0,
                        pages: 0,
                        page,
                        limit
                    }
                }, "Category not found.");
            }
        }
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }
        
        const products = await Product.find(filter)
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
            let hoverImage = "";
            if (firstVariant && firstVariant.images && firstVariant.images.length > 0) {
                const imgPath = firstVariant.images[0];
                image = getUrls.getUrl(imgPath) || imgPath;
                if (firstVariant.images.length > 1) {
                    const hoverImgPath = firstVariant.images[1];
                    hoverImage = getUrls.getUrl(hoverImgPath) || hoverImgPath;
                }
            } else {
                // High-quality fallback botanical image if no variant image
                image = "https://images.unsplash.com/photo-1598030304671-5aa1d6f21128?w=600&q=80";
            }
            
            return {
                id: product.slug || product._id.toString(),
                name: product.name,
                description: product.description || "",
                price: formattedPrice,
                originalPrice: formattedOriginalPrice,
                image,
                hoverImage,
                tags: product.tags || [],
                category: product.category?.slug || "organic",
                isFeatured: product.isFeatured || false,
                createdAt: product.createdAt
            };
        });
        
        // In-memory sorting based on sortBy parameter
        const sortBy = searchParams.get("sortBy") || "featured";
        if (sortBy === "price-low") {
            minimalProducts.sort((a, b) => {
                const priceA = parseFloat(a.price.replace(/[^\d.]/g, "")) || 0;
                const priceB = parseFloat(b.price.replace(/[^\d.]/g, "")) || 0;
                return priceA - priceB;
            });
        } else if (sortBy === "price-high") {
            minimalProducts.sort((a, b) => {
                const priceA = parseFloat(a.price.replace(/[^\d.]/g, "")) || 0;
                const priceB = parseFloat(b.price.replace(/[^\d.]/g, "")) || 0;
                return priceB - priceA;
            });
        } else if (sortBy === "alpha") {
            minimalProducts.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === "newest") {
            minimalProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else {
            // featured/default sort: featured first, then newest
            minimalProducts.sort((a, b) => {
                if (a.isFeatured && !b.isFeatured) return -1;
                if (!a.isFeatured && b.isFeatured) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
        }
        
        const totalCount = minimalProducts.length;
        const paginatedProducts = minimalProducts.slice(skip, skip + limit);
        const totalPages = Math.ceil(totalCount / limit);
        
        return ApiResponse(200, {
            products: paginatedProducts,
            pagination: {
                total: totalCount,
                pages: totalPages,
                page,
                limit
            }
        }, "Minimal products fetched successfully.");
    } catch (error: any) {
        console.error("Error fetching minimal products:", error);
        return ApiResponse(500, null, error.message || "Failed to fetch minimal products.");
    }
}
