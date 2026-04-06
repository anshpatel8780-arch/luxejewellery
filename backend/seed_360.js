const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const ProductSchema = new mongoose.Schema({
  name: String,
  images: [String],
  images360: [String]
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function seed360() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the first product to attach the 360 images to (e.g., Heritage Gold Chronograph)
    const product = await Product.findOne();
    
    if (!product) {
      console.log('No products found in DB!');
      process.exit();
    }

    // Since we don't have 36 real sequential photos of your specific jewelry,
    // we use one high-quality generic watch image 36 times to prove the UI logic handles real image arrays without text boxes.
    const mock360Array = Array(36).fill('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80');

    product.images360 = mock360Array;
    await product.save();

    console.log(`Successfully added 360 array to product: ${product.name}`);
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed360();
