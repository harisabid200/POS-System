import React from 'react';

const ProductList = ({ products, addToCart }) => {
  return (
    <div className="product-grid">
      {products.map(product => (
        <div key={product.id} className="product-card" onClick={() => addToCart(product)}>
          <h3>{product.name}</h3>
          <p className="product-price">${product.price.toFixed(2)}</p>
          <p className="product-barcode">Barcode: {product.barcode}</p>
          <p className={product.stock < 5 ? "low-stock" : ""}>Stock: {product.stock}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
