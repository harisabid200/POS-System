import React, { useState } from 'react';

function ReturnsScreen({ onSearchInvoice, onReturn }) {
    const [searchId, setSearchId] = useState('');
    const [invoice, setInvoice] = useState(null);
    const [returnQuantities, setReturnQuantities] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        const found = await onSearchInvoice(searchId);
        setLoading(false);

        if (found) {
            setInvoice(found);
            setReturnQuantities({});
        } else {
            alert("Invoice not found");
            setInvoice(null);
        }
    };

    const handleQuantityChange = (itemId, value) => {
        setReturnQuantities({
            ...returnQuantities,
            [itemId]: parseInt(value) || 0
        });
    };

    const handleReturnClick = async (item) => {
        const qtyToReturn = returnQuantities[item.id] || 0;
        const alreadyReturned = item.returnedQuantity || 0;
        const remainingQty = item.quantity - alreadyReturned;
        
        if (qtyToReturn <= 0) {
            alert("Please enter a valid quantity to return.");
            return;
        }

        if (qtyToReturn > remainingQty) {
            alert("Cannot return more than purchased quantity.");
            return;
        }

        const updatedItems = await onReturn(invoice, item.id, qtyToReturn, 'resellable');
        if (updatedItems) {
            alert(`Successfully returned ${qtyToReturn} item(s) of ${item.name}`);
            
            // Update local invoice state with new items
            setInvoice(prev => ({ ...prev, items: updatedItems }));
            setReturnQuantities({
                ...returnQuantities,
                [item.id]: 0
            });
        }
    };

    return (
        <div className="returns-container">
            <div className="search-section">
                <h2>Process Return</h2>
                <form onSubmit={handleSearch} className="search-form">
                    <input 
                        type="text" 
                        placeholder="Enter Invoice ID" 
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-btn" disabled={loading}>{loading ? "Searching..." : "Search Invoice"}</button>
                </form>
            </div>

            {invoice && (
                <div className="invoice-details">
                    <div className="invoice-info">
                        <h3>Invoice #{invoice.id}</h3>
                        <p>Date: {new Date(invoice.date).toLocaleString()}</p>
                        <p>Total: ${invoice.total.toFixed(2)}</p>
                    </div>
                    
                    <table className="returns-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Price</th>
                                <th>Purchased Qty</th>
                                <th>Return Qty</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map(item => {
                                const remainingQty = item.quantity - (item.returnedQuantity || 0);
                                if (remainingQty <= 0) return null;
                                return (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td>${item.price.toFixed(2)}</td>
                                        <td>{remainingQty} (Orig: {item.quantity})</td>
                                        <td>
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max={remainingQty}
                                                value={returnQuantities[item.id] || ''}
                                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                className="qty-input"
                                            />
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => handleReturnClick(item)}
                                                className="return-action-btn"
                                            >
                                                Return
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ReturnsScreen;