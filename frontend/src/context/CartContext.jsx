import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCart([]);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            const res = await axios.get('/cart');
            setCart(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const addToCart = async (productId, quantity = 1, size = null, color = null, variantId = null) => {
        if (!user) {
            alert("Please login to add to cart");
            return;
        }
        try {
            await axios.post('/cart', { 
                product_id: productId, 
                quantity, 
                size, 
                color,
                variant_id: variantId
            });
            fetchCart();
            setIsCartOpen(true); // Open drawer instantly
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const removeFromCart = async (id) => {
        try {
            await axios.delete(`/cart/${id}`);
            fetchCart();
        } catch (err) {
            console.error(err);
        }
    };

    const updateCartItemQuantity = async (id, quantity) => {
        try {
            await axios.put(`/cart/${id}`, { quantity });
            fetchCart();
        } catch (err) {
            console.error(err);
            if (err.response?.data?.message) {
                alert(err.response.data.message);
            }
        }
    };

    const checkout = async (paymentMethod, address, contact, city, selectedItemIds, couponCode = null, referenceNumber = null, customerNote = null) => {
        try {
            await axios.post('/orders', { payment_method: paymentMethod, address, contact, city, selected_item_ids: selectedItemIds, coupon_code: couponCode, reference_number: referenceNumber, customer_note: customerNote });
            fetchCart();
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCartItemQuantity, checkout, fetchCart, isCartOpen, setIsCartOpen }}>
            {children}
        </CartContext.Provider>
    );
};
