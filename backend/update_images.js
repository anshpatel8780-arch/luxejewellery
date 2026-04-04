const API_URL = 'http://localhost:5000/api';

async function fixImages() {
    try {
        // 1. Login to get token
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@jewellery.com', password: 'admin123' })
        });
        const { token } = await loginRes.json();

        // 2. Get all products
        const prodRes = await fetch(`${API_URL}/products`);
        const data = await prodRes.json();
        const products = data.products || data; // Handle pagination wrapper if exists

        if (!Array.isArray(products)) {
            console.error('Expected products array, got:', products);
            return;
        }

        // 3. Find and update
        const ring = products.find(p => p.name === 'Platinum Sapphire Ring');
        if (ring) {
            await fetch(`${API_URL}/products/${ring._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500'] })
            });
            console.log('Fixed Platinum Sapphire Ring image');
        } else {
            console.log('Ring not found');
        }

        const choker = products.find(p => p.name === 'Kundan Choker Set');
        if (choker) {
            await fetch(`${API_URL}/products/${choker._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500'] })
            });
            console.log('Fixed Kundan Choker Set image');
        } else {
            console.log('Choker not found');
        }

    } catch (err) {
        console.error('An error occurred:', err);
    }
}

fixImages();
