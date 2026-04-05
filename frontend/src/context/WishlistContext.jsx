import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setWishlist([]);
        }
    }, [user]);

    const fetchWishlist = async () => {
        try {
            const res = await axios.get('/wishlist');
            setWishlist(res.data);
        } catch (err) {
            console.error('Failed to fetch wishlist', err);
        }
    };

    const toggleWishlist = async (productId) => {
        if (!user) {
            alert("Please login to use wishlist");
            return false;
        }
        try {
            const res = await axios.post('/wishlist/toggle', { product_id: productId });
            if (res.data.status === 'added') {
                setWishlist([...wishlist, res.data.item]);
            } else {
                setWishlist(wishlist.filter(item => item.product_id !== productId));
            }
            return true;
        } catch (err) {
            console.error('Failed to toggle wishlist', err);
            return false;
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => item.product_id === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, fetchWishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
