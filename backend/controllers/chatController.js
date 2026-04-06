const axios = require('axios'); // Checking if axios is available, if not I'll use fetch
const Product = require('../models/Product');

// Simple in-memory cache to strictly avoid hitting DB repeatedly per chat message
let cachedProducts = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

async function getProductCatalog() {
    if (cachedProducts && (Date.now() - lastCacheUpdate < CACHE_TTL)) {
        return cachedProducts;
    }
    try {
        const products = await Product.find({}, '_id name slug price description images').lean();
        cachedProducts = products.map(p => ({
            name: p.name,
            slug: p.slug,
            price: p.price,
            description: p.description ? (p.description.substring(0, 100) + '...') : '',
            image: (p.images && p.images.length > 0) ? p.images[0] : null
        }));
        lastCacheUpdate = Date.now();
        return cachedProducts;
    } catch (e) {
        console.error('Error caching products for AI:', e);
        return [];
    }
}

exports.handleChat = async (req, res) => {
    try {
        const { message, history } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error('SERVER ERROR: GEMINI_API_KEY is missing from .env');
            return res.status(500).json({ message: 'AI Assistant configuration error' });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

        const catalog = await getProductCatalog();
        const catalogText = catalog.map(p => `- ${p.name} (Slug: ${p.slug}, Price: ₹${p.price}): ${p.description}`).join('\n');

        // System Instruction context
        const systemPrompt = `
            You are the LuxeJewels AI Shopping Assistant. You are elegant, professional, and knowledgeable about fine handcrafted jewellery.
            Store Name: LuxeJewels.
            Categories: Rings, Necklaces, Earrings, Bracelets, Watches.
            Materials: 18K/22K Gold, Silver, Platinum, Diamonds.
            Tone: Luxury, helpful, and sophisticated.
            
            Key Information:
            - Shipping is FREE on all orders.
            - We offer 18K and 22K gold options.
            - We have a premium collection for 2026.
            - Prices start from ₹10,000 for gold rings.
            
            Instructions:
            - Be concise but helpful.
            - If unknown, suggest browsing the "Shop" page.
            - Always maintain a premium, helpful tone.

            RECOMMENDING PRODUCTS:
            You have access to our live inventory. If a user asks for recommendations, choose from the exact products listed below. 
            When you recommend a specific product, YOU MUST append its exact slug in brackets at the very end of your response, like this: [SLUG:product-slug-here]
            You may recommend up to 3 products at a time.
            
            Live Inventory Catalog:
            ${catalogText}
        `;

        // Initialize with system context in a way Gemini likes (user prompt + model acknowledgement)
        const contents = [
            {
                role: 'user',
                parts: [{ text: systemPrompt }]
            },
            {
                role: 'model',
                parts: [{ text: "Understood. I am the LuxeJewels AI Assistant. How may I help you today?" }]
            }
        ];

        // Process history ensuring strictly alternating roles
        if (history && Array.isArray(history)) {
            history.forEach(msg => {
                const role = msg.role === 'user' ? 'user' : 'model';
                const lastContent = contents[contents.length - 1];

                if (lastContent.role === role) {
                    // Combine consecutive messages with the same role
                    lastContent.parts[0].text += "\n" + msg.content;
                } else {
                    contents.push({
                        role: role,
                        parts: [{ text: msg.content }]
                    });
                }
            });
        }

        // Add the current user message
        const lastContent = contents[contents.length - 1];
        if (lastContent.role === 'user') {
            lastContent.parts[0].text += "\n" + message;
        } else {
            contents.push({
                role: 'user',
                parts: [{ text: message }]
            });
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    maxOutputTokens: 800,
                    temperature: 0.7
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Response Error:', errorData);
            return res.status(500).json({ message: 'AI Assistant is currently busy. Please try again soon.' });
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
            let botResponse = data.candidates[0].content.parts[0].text;
            
            // Extract and clean [SLUG:...] tags
            const slugs = [];
            botResponse = botResponse.replace(/\[SLUG:([^\]]+)\]/g, (match, slug) => {
                slugs.push(slug.trim());
                return '';
            }).trim();

            const uniqueSlugs = [...new Set(slugs)].slice(0, 3); // Max 3 cards
            let recommends = [];
            
            if (uniqueSlugs.length > 0) {
                const catalog = await getProductCatalog();
                const baseUrl = process.env.BASE_URL || 'http://localhost:10000';
                
                recommends = uniqueSlugs.map(slug => {
                    const p = catalog.find(prod => prod.slug === slug);
                    if (p) {
                        let absoluteImage = p.image;
                        if (absoluteImage && !absoluteImage.startsWith('http') && !absoluteImage.startsWith('data:')) {
                            const path = absoluteImage.startsWith('/') ? absoluteImage : `/${absoluteImage}`;
                            absoluteImage = `${baseUrl}${path}`;
                        }
                        return {
                            name: p.name,
                            slug: p.slug,
                            price: p.price,
                            description: p.description,
                            image: absoluteImage
                        };
                    }
                    return null;
                }).filter(Boolean);
            }

            res.json({ response: botResponse, recommends });
        } else {
            console.warn('Gemini safety block or empty response:', data);
            res.status(200).json({ 
                response: "I'm sorry, I couldn't process that request due to my safety guidelines. Is there anything else I can help you with regarding our jewellery collection?" 
            });
        }

    } catch (error) {
        console.error('Chat Controller Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

