import React, { useState } from 'react';
import Cart from './Cart';

function POSScreen({ products, onCheckout }) {
    const [cart, setCart] = useState([]);
    const [invoice, setInvoice] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const addToCart = (product) => {
        if (product.stock <= 0) return;
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) return prev;
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id, newQty) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const product = products.find(p => p.id === id);
                if (newQty < 0) return item;
                if (product && newQty > product.stock) return item;
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const handlePayment = () => {
        if (cart.length === 0) return;
        // Call the parent handler and get the invoice object back
        const transaction = onCheckout(cart);
        setInvoice(transaction);
        setCart([]); // Clear cart after successful checkout
    };

    const handleNewSale = () => {
        setInvoice(null);
        setCart([]);
        setSearchTerm("");
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.barcode.includes(searchTerm)
    );

    return (
        <div className="pos-container">
            <div className="pos-left">
                <input 
                    type="text" 
                    placeholder="Search products by name or barcode..." 
                    className="pos-search"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <div className="product-grid">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="product-card" onClick={() => addToCart(product)}>
                            <h3>{product.name}</h3>
                            <p>${product.price.toFixed(2)}</p>
                            <p className={product.stock < 5 ? "low-stock" : ""}>Stock: {product.stock}</p>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="pos-right">
                
                <div className="cart-section">
                    <h2>Current Sale</h2>
                    <Cart 
                        cartItems={cart}
                        updateQuantity={updateQuantity}
                        removeFromCart={removeFromCart}
                        handleCheckout={handlePayment}
                    />
                </div>
                
                {invoice && (
                    <div className="invoice-section">
                        <div className="invoice-header">
                            <h3>Invoice #{invoice.id}</h3>
                            <p>{new Date(invoice.date).toLocaleString()}</p>
                        </div>
                        <div className="invoice-items-list">
                            {invoice.items.map((item, idx) => (
                                <div key={idx} className="invoice-row">
                                    <span>{item.name} x{item.quantity}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="invoice-footer">
                            <h4>Total Paid: ${invoice.total.toFixed(2)}</h4>
                        </div>
                        <button className="new-sale-btn" onClick={handleNewSale}>New Sale</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default POSScreen;