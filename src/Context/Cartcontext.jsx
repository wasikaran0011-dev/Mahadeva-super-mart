import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];

      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch {
      // Cart functionality remains available even when browser storage is unavailable.
    }
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);

      if (existingItem) {
        return currentCart.map((item) => (
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const updateCartItemQuantity = (productId, change) => {
    setCartItems((currentCart) => (
      currentCart
        .map((item) => (
          item.id === productId
            ? { ...item, quantity: item.quantity + change }
            : item
        ))
        .filter((item) => item.quantity > 0)
    ));
  };

  const removeFromCart = (productId) => {
    setCartItems((currentCart) => currentCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
