import React from "react";

const Cart = ({
  cartItems,
  updateQuantity,
  removeFromCart,
  handleCheckout,
}) => {
  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  return (
    <div className="cart">
      <h3>Cart</h3>
      <div className="cart-items">
        {cartItems.length === 0 ? (
          <p className="empty-cart-message">Cart is empty</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-details">
                <span>{item.name}</span>
                <br />
                <small>
                  ${item.price.toFixed(2)} x {item.quantity}
                </small>
              </div>
              <div className="cart-item-controls">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="remove-btn"
                >
                  ✖
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="cart-total">Total: ${calculateTotal()}</div>
      <button
        className="checkout-button"
        disabled={cartItems.length === 0}
        onClick={() => handleCheckout(cartItems)}
      >
        Complete Transaction
      </button>
    </div>
  );
};

export default Cart;
