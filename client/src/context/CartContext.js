import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addCartItem,
  clearCartItems,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from "../services/orderService";
import { AuthContext } from "./AuthContext";

const emptyCart = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  currency: "INR",
};

export const CartContext = createContext({
  cart: emptyCart,
  loading: false,
  refreshCart: async () => {},
  addItem: async () => {},
  updateItem: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
});

const hasSession = (user) => Boolean(user && localStorage.getItem("token"));

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!hasSession(user)) {
      setCart(emptyCart);
      return emptyCart;
    }

    setLoading(true);
    try {
      const nextCart = await fetchCart();
      console.log(nextCart);
      const normalizedCart = nextCart || emptyCart;
      setCart(normalizedCart);
      return normalizedCart;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addItem = useCallback(
    async (medicineId,supplierId, quantity = 1) => {
      if (!hasSession(user)) {
        throw new Error("Please login to manage cart");
      }

      setLoading(true);
      try {
        const nextCart = await addCartItem({ medicineId,supplierId, quantity });
        const normalizedCart = nextCart || emptyCart;
        setCart(normalizedCart);
        return normalizedCart;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const updateItem = useCallback(
    async (medicineId, quantity) => {
      if (!hasSession(user)) {
        throw new Error("Please login to manage cart");
      }

      setLoading(true);
      try {
        const nextCart = await updateCartItem(medicineId, { quantity });
        const normalizedCart = nextCart || emptyCart;
        setCart(normalizedCart);
        return normalizedCart;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const removeItem = useCallback(
    async (medicineId) => {
      if (!hasSession(user)) {
        throw new Error("Please login to manage cart");
      }

      setLoading(true);
      try {
        const nextCart = await removeCartItem(medicineId);
        const normalizedCart = nextCart || emptyCart;
        setCart(normalizedCart);
        return normalizedCart;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const clearCart = useCallback(async () => {
    if (!hasSession(user)) {
      throw new Error("Please login to manage cart");
    }

    setLoading(true);
    try {
      const nextCart = await clearCartItems();
      const normalizedCart = nextCart || emptyCart;
      setCart(normalizedCart);
      return normalizedCart;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (hasSession(user)) {
      refreshCart().catch(() => setCart(emptyCart));
    } else {
      setCart(emptyCart);
    }
  }, [user, refreshCart]);

  const value = useMemo(
    () => ({
      cart,
      loading,
      refreshCart,
      addItem,
      updateItem,
      removeItem,
      clearCart,
    }),
    [cart, loading, refreshCart, addItem, updateItem, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
