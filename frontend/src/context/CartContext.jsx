import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
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

    const addToCart = async (productId, quantity = 1, size = null, color = null) => {
        if (!user) {
            alert("Please login to add to cart");
            return;
        }
        try {
            await axios.post('/cart', { product_id: productId, quantity, size, color });
            fetchCart();
        } catch (err) {
            console.error(err);
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

    const checkout = async (paymentMethod, address, contact, city, selectedItemIds) => {
        try {
            await axios.post('/orders', { payment_method: paymentMethod, address, contact, city, selected_item_ids: selectedItemIds });
            fetchCart();
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, checkout, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};
