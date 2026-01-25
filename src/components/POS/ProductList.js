import React from 'react';

const ProductList = ({ products, addToCart }) => {
  return (
    <div className="product-list">
      <h3>Products</h3>
      <div className="product-items-container">
        {products.map(product => (
          <div key={product.id} className="product-item">
            <span>{product.name} (${product.price.toFixed(2)})</span>
            <button 
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? 'Add' : 'Out of Stock'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
