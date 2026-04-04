export interface Product {
    _id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    images: string[];
    goldType: string;
    weight: string;
    stock: number;
    rating: number;
    numReviews: number;
    featured: boolean;
    bestSeller: boolean;
    createdAt: string;
}

export interface ProductResponse {
    products: Product[];
    total: number;
    page: number;
    pages: number;
}

export interface Address {
    _id?: string;
    name: string;
    phone: string;
    street: string;
    city: string;
    pincode: string;
    isDefault?: boolean;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    image?: string;
    role: string;
    addresses?: Address[];
    verified?: boolean;
    isSuspended?: boolean;
    lastLogin?: string;
    createdAt?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface CartItem {
    _id?: string;
    productId: Product;
    quantity: number;
}

export interface Cart {
    _id: string;
    userId: string;
    products: CartItem[];
}

export interface OrderProduct {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface Order {
    _id: string;
    userId: { _id: string; name: string; email: string };
    products: OrderProduct[];
    totalPrice: number;
    address: {
        name: string;
        phone: string;
        street: string;
        city: string;
        pincode: string;
    };
    paymentMethod: string;
    status: string;
    cancellation?: {
        reason: string;
        status: string;
        requestedAt?: string;
        processedAt?: string;
        adminNote?: string;
    };
    createdAt: string;
}

export interface Review {
    _id: string;
    userId: { _id: string; name: string };
    productId: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface Wishlist {
    _id: string;
    userId: string;
    products: Product[];
}

export interface OrderStats {
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    statusCounts: { _id: string; count: number }[];
    monthlySales: { _id: number; total: number; count: number }[];
    salesTrend: { _id: string; total: number }[];
    topProducts: { _id: string; quantity: number }[];
}

export interface Coupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderAmount: number;
    expiryDate: string;
    isActive: boolean;
    scope: 'all' | 'product';
    productId?: string;
    description: string;
    createdAt: string;
}

export interface CouponValidationResponse {
    valid: boolean;
    discount: number;
    code: string;
    message: string;
}
