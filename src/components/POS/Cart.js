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
    <>
      <div className="cart-items">
        {cartItems.length === 0 ? (
          <p style={{color: '#888', textAlign: 'center'}}>Cart is empty</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="cart-item" style={{ display: 'flex', alignItems: 'center' }}>
              <div className="item-info" style={{ flex: 1 }}>
                <span>{item.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="qty-controls">
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
                </div>
                <span className="item-total" style={{ marginLeft: '10px', minWidth: '60px', textAlign: 'right' }}>${(item.price * item.quantity).toFixed(2)}</span>
                <button
                    onClick={() => removeFromCart(item.id)}
                    className="remove-btn"
                    style={{ marginLeft: '5px', color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                  >
                    ✖
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="cart-total">
        <h3>Total: ${calculateTotal()}</h3>
        <button
          className="checkout-btn"
          disabled={cartItems.length === 0}
          onClick={() => handleCheckout(cartItems)}
        >
          Process Checkout
        </button>
      </div>
    </>
  );
};

export default Cart;
