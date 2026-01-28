import React, { useState } from 'react';

const InventoryScreen = ({ products, onUpdateStock }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    barcode: '',
    price: '',
    stock: ''
  });

  // Filter products based on search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.barcode && p.barcode.includes(searchTerm))
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: value
    }));
  };

  const handleEditClick = (product) => {
    setFormData({
        id: product.id,
        name: product.name,
        barcode: product.barcode || '',
        price: product.price,
        stock: product.stock
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
        id: null,
        name: '',
        barcode: '',
        price: '',
        stock: ''
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || formData.stock === '') {
        alert("Please fill in all required fields");
        return;
    }

    if (formData.barcode) {
        const duplicate = products.find(p => p.barcode === formData.barcode && p.id !== formData.id);
        if (duplicate) {
            alert(`Barcode "${formData.barcode}" already exists for product: ${duplicate.name}`);
            return;
        }
    }

    setIsLoading(true);
    await onUpdateStock({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
    });
    setIsLoading(false);
    
    // Reset form after submission
    handleCancel();
  };

  return (
    <div className="pos-container">
      {/* Left Side: Product List */}
      <div className="pos-left">
        <div className="search-bar-container" style={{ marginBottom: '20px' }}>
            <input 
                type="text" 
                placeholder="Search inventory by name or barcode..." 
                className="pos-search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
        
        <div className="inventory-table-container" style={{ overflowY: 'auto', height: 'calc(100vh - 180px)', backgroundColor: 'white', borderRadius: '8px', padding: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>Name</th>
                        <th style={{ padding: '12px' }}>Barcode</th>
                        <th style={{ padding: '12px' }}>Price</th>
                        <th style={{ padding: '12px' }}>Stock</th>
                        <th style={{ padding: '12px' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.map(product => (
                        <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px' }}>{product.name}</td>
                            <td style={{ padding: '12px' }}>{product.barcode}</td>
                            <td style={{ padding: '12px' }}>${product.price.toFixed(2)}</td>
                            <td style={{ padding: '12px', fontWeight: 'bold', color: product.stock < 5 ? 'red' : 'inherit' }}>
                                {product.stock}
                            </td>
                            <td style={{ padding: '12px' }}>
                                <button 
                                    onClick={() => handleEditClick(product)}
                                    style={{ 
                                        padding: '6px 12px', 
                                        cursor: 'pointer',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px'
                                    }}
                                >
                                    Edit
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Right Side: Add/Edit Form */}
      <div className="pos-right">
        <div className="cart-section">
            <h2>{isEditing ? 'Edit Product / Restock' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Product Name</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        required
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Barcode</label>
                    <input 
                        type="text" 
                        name="barcode" 
                        value={formData.barcode} 
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Price ($)</label>
                        <input 
                            type="number" 
                            name="price" 
                            value={formData.price} 
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                            required
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Stock Qty</label>
                        <input 
                            type="number" 
                            name="stock" 
                            value={formData.stock} 
                            onChange={handleInputChange}
                            min="0"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                            required
                        />
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button 
                        type="submit" 
                        className="checkout-btn"
                        disabled={isLoading}
                        style={{ flex: 1, opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? 'Saving...' : (isEditing ? 'Update Product' : 'Add Product')}
                    </button>
                    {isEditing && (
                        <button 
                            type="button" 
                            onClick={handleCancel}
                            style={{ 
                                flex: 1, 
                                padding: '10px', 
                                cursor: 'pointer', 
                                backgroundColor: '#6c757d', 
                                border: 'none', 
                                color: 'white',
                                borderRadius: '4px',
                                fontSize: '1.2rem'
                            }}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryScreen;
