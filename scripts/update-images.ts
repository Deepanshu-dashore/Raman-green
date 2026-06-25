import * as fs from "fs";
import * as path from "path";

// Manually parse .env file
const envPath = path.resolve(process.cwd(), '.env');
try {
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split(/\r?\n/).forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#')) return;
            const parts = trimmedLine.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                let value = parts.slice(1).join('=').trim();
                // Strip quotes
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                } else if (value.startsWith("'") && value.endsWith("'")) {
                    value = value.slice(1, -1);
                }
                process.env[key] = value;
            }
        });
    }
} catch (e) {
    console.error("Error loading .env file manually:", e);
}

const { connectDB } = require("../src/app/lib/db/connectDB");
const { Product } = require("../src/app/lib/featuers/product/product.model");
const { ProductVariant } = require("../src/app/lib/featuers/product-variant/ProductVariants.model");

async function updateImages() {
    try {
        console.log("Connecting to DB...");
        await connectDB();
        
        const updates = [
            { slug: 'spinach-powder', front: '/product-upload-imgs/spinach-powder.png', back: '/product-upload-imgs/spinach-back.png' },
            { slug: 'tomato-powder', front: '/product-upload-imgs/tomato-powder.png', back: '/product-upload-imgs/tomato-back.png' },
            { slug: 'beetroot-powder', front: '/product-upload-imgs/beetroot-powder.png', back: '/product-upload-imgs/beetroot-back.png' },
            { slug: 'papaya-powder', front: '/product-upload-imgs/papaya-powder.png', back: '/product-upload-imgs/papaya-back.png' },
        ];
        
        for (const item of updates) {
            console.log(`\nUpdating product with slug: ${item.slug}`);
            const product = await Product.findOne({ slug: item.slug });
            if (!product) {
                console.log(`Product with slug ${item.slug} not found!`);
                continue;
            }
            
            console.log(`Found product: ${product.name}, variants count: ${product.variants.length}`);
            for (const variantRef of product.variants) {
                const variant = await ProductVariant.findById(variantRef._id);
                if (variant) {
                    variant.images = [item.front, item.back];
                    await variant.save();
                    console.log(`  - Updated SKU ${variant.sku} images to:`, variant.images);
                } else {
                    console.log(`  - Variant ID ${variantRef._id} not found!`);
                }
            }
        }
        
        console.log("\nImage update complete!");
        process.exit(0);
    } catch (error) {
        console.error("Error updating database images:", error);
        process.exit(1);
    }
}

updateImages();
