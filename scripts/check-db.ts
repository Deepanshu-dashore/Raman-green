import * as fs from "fs";
import * as path from "path";

// Manually parse .env file
const envPath = path.resolve(process.cwd(), '.env');
console.log("Resolved envPath:", envPath);
console.log("envPath exists:", fs.existsSync(envPath));

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
                console.log(`Parsed key: ${key}, value length: ${value.length}`);
            }
        });
    }
} catch (e) {
    console.error("Error loading .env file manually:", e);
}

console.log("MONGODB_URL in process.env:", !!process.env.MONGODB_URL);

// Use require to bypass ES Module hoisting and guarantee these run AFTER env is loaded
const { connectDB } = require("../src/app/lib/db/connectDB");
const { Product } = require("../src/app/lib/featuers/product/product.model");
const { ProductVariant } = require("../src/app/lib/featuers/product-variant/ProductVariants.model");

async function checkDatabase() {
    try {
        console.log("Connecting to DB...");
        await connectDB();
        
        console.log("Fetching products...");
        const products = await Product.find({}).populate('variants');
        console.log(`Found ${products.length} products:`);
        
        for (const prod of products) {
            console.log(`\nProduct: ${prod.name} (${prod.slug})`);
            console.log(`Variants count: ${prod.variants.length}`);
            for (const variantRef of prod.variants) {
                const variant = await ProductVariant.findById(variantRef._id);
                if (variant) {
                    console.log(`  - Variant SKU: ${variant.sku}, Weight: ${variant.weight}, Images:`, variant.images);
                } else {
                    console.log(`  - Variant ID ${variantRef._id} not found!`);
                }
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error("Error checking database:", error);
        process.exit(1);
    }
}

checkDatabase();
