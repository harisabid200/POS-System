import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import './styles/App.css';
import Login from './components/Login';
import POSScreen from './components/POS/POSScreen';
import InventoryScreen from './components/Inventory/InventoryScreen';
import ReturnsScreen from './components/Returns/ReturnsScreen';
import axios from 'axios';


const initialProducts = [];

function App() {
  
  const [products, setProducts] = useState(initialProducts);
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const prevTransactionsLength = useRef(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios({
          method: 'get',
          url: `https://api.airtable.com/v0/${process.env.REACT_APP_BASE_ID}/${process.env.REACT_APP_TABLE_ID}`,
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_AIRTABLE}`,
          },
        });
        const fetchedProducts = response.data.records.map(record => ({
          id: record.id,
          name: record.fields.Name || '',
          barcode: record.fields.Barcode || '',
          price: record.fields.Price || 0,
          stock: record.fields.Stock || 0
        }));
        setProducts(fetchedProducts);
        

      } catch (err) {
        console.log("API Error: ", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (transactions.length > prevTransactionsLength.current) {
      const lastTransaction = transactions[transactions.length - 1];
      
      const updateAirtable = async () => {
        const updates = lastTransaction.items.map(item => {
          const product = products.find(p => p.id === item.id);
          if (!product) return null;
          return {
            id: product.id,
            fields: {
              Stock: product.stock
            }
          };
        }).filter(Boolean);

        if (updates.length > 0) {
          try {
            await axios({
              method: 'patch',
              url: `https://api.airtable.com/v0/${process.env.REACT_APP_BASE_ID}/${process.env.REACT_APP_TABLE_ID}`,
              headers: {
                Authorization: `Bearer ${process.env.REACT_APP_AIRTABLE}`,
                'Content-Type': 'application/json'
              },
              data: {
                records: updates,
                typecast: true
              }
            });
            console.log("Airtable stock updated successfully");
          } catch (error) {
            console.error("Error updating Airtable stock:", error);
          }
        }

        // Create Invoice in Airtable
        try {
          await axios({
            method: 'post',
            url: `https://api.airtable.com/v0/${process.env.REACT_APP_BASE_ID}/${process.env.REACT_APP_INVOICE_ID}`,
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_AIRTABLE}`,
              'Content-Type': 'application/json'
            },
            data: {
              records: [{
                fields: {
                  "TransactionID": String(lastTransaction.id),
                  "Date": lastTransaction.date,
                  "Total": lastTransaction.total,
                  "Items": JSON.stringify(lastTransaction.items)
                }
              }],
              typecast: true
            }
          });
          console.log("Invoice created in Airtable successfully");
        } catch (error) {
          console.error("Error creating invoice in Airtable:", error);
        }
      };
      updateAirtable();
    }
    prevTransactionsLength.current = transactions.length;
  }, [transactions, products]);

  const handleCheckout = (cartItems) => {
    console.log("Processing Checkout:", cartItems);
    const newTransaction = {
      id: Date.now(),
      items: cartItems,
      date: new Date().toISOString(),
      total: cartItems.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + (product.price * item.quantity);
      }, 0)
    };
    setTransactions(prev => [...prev, newTransaction]);
    setProducts(prevProducts => {
      return prevProducts.map(product => {
        const cartItem = cartItems.find(item => item.id === product.id);
        if (cartItem) {
          return { ...product, stock: product.stock - cartItem.quantity };
        }
        return product;
      });
    });
    console.log("Stock updated after checkout.");
    return newTransaction;
  };

  const handleSearchInvoice = async (searchId) => {
    try {
      const response = await axios({
        method: 'get',
        url: `https://api.airtable.com/v0/${process.env.REACT_APP_BASE_ID}/${process.env.REACT_APP_INVOICE_ID}`,
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_AIRTABLE}`,
        },
        params: {
          filterByFormula: `{TransactionID} = '${searchId}'`
        }
      });

      if (response.data.records.length > 0) {
        const record = response.data.records[0];
        return {
          airtableId: record.id,
          id: record.fields.TransactionID,
          date: record.fields.Date,
          total: record.fields.Total,
          items: JSON.parse(record.fields.Items || '[]')
        };
      }
      return null;
    } catch (error) {
      console.error("Error searching invoice:", error);
      return null;
    }
  };

  const handleReturn = async (invoice, productId, quantity, returnType) => {
    console.log(`Processing Return: Invoice ${invoice.id}, Product ${productId}, Qty ${quantity}, Type: ${returnType}`);
    if (returnType === 'resellable') {
      // Update Airtable Stock
      const product = products.find(p => p.id === productId);
      if (product) {
        try {
          await axios({
            method: 'patch',
            url: `https://api.airtable.com/v0/${process.env.REACT_APP_BASE_ID}/${process.env.REACT_APP_TABLE_ID}`,
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_AIRTABLE}`,
              'Content-Type': 'application/json'
            },
            data: {
              records: [{
                id: product.id,
                fields: {
                  Stock: product.stock + quantity
                }
              }],
              typecast: true
            }
          });
          console.log("Airtable stock updated for return");
          
          setProducts(prevProducts => {
            return prevProducts.map(product => {
              if (product.id === productId) {
                return { ...product, stock: product.stock + quantity };
              }
              return product;
            }); 
          });
        } catch (err) {
          console.error("Error updating Airtable stock on return:", err);
        }
      }
    }

    // Update Invoice in Airtable (Items returnedQuantity)
    const updatedItems = invoice.items.map(item => {
      if (item.id === productId) {
        return { ...item, returnedQuantity: (item.returnedQuantity || 0) + quantity };
      }
      return item;
    });

    try {
      await axios({
        method: 'patch',
        url: `https://api.airtable.com/v0/${process.env.REACT_APP_BASE_ID}/${process.env.REACT_APP_INVOICE_ID}/${invoice.airtableId}`,
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_AIRTABLE}`,
          'Content-Type': 'application/json'
        },
        data: {
          fields: {
            "Items": JSON.stringify(updatedItems)
          }
        }
      });
      console.log("Invoice updated in Airtable with returned items");
      return updatedItems;
    } catch (error) {
      console.error("Error updating invoice in Airtable:", error);
      return null;
    }
  };

  const handleUpdateStock = (productData) => {
    if (productData.id) {
        setProducts(prevProducts => {
            return prevProducts.map(p => {
                if (p.id === productData.id) {
                    return { ...p, ...productData };
                }
                return p;
            });
        });
    } else {
        console.log("Adding new product:", productData);
        const newProduct = {
            ...productData,
            id: Date.now(),
            barcode: String(Math.floor(100 + Math.random() )),
        };
        setProducts(prevProducts => [...prevProducts, newProduct]);
    }
  };

  const handleLogin = (username, password) => {
    if (username === 'cashier' && password === 'cashier123') {
      setUser({ role: 'cashier', name: 'Cashier' });
    } else if (username === 'inventory' && password === 'inventory123') {
      setUser({ role: 'inventory', name: 'Manager' });
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setUser(null);
  };
  

  return (
    <Router>
      <div className="App">
        {user && (
          <nav className="navbar">
            <div className="navbar-brand">Welcome, {user.name}</div>
            <div className="navbar-menu">
              {user.role === 'cashier' && (
                <>
                  <Link to="/pos" className="nav-link">POS</Link>
                  <Link to="/returns" className="nav-link">Returns</Link>
                </>
              )}
              {user.role === 'inventory' && (
                <Link to="/inventory" className="nav-link">Inventory</Link>
              )}
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </nav>
        )}

        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/" element={user ? (user.role === 'cashier' ? <Navigate to="/pos" /> : <Navigate to="/inventory" />) : <Navigate to="/login" />} />
          
          {/* Cashier Routes */}
          <Route path="/pos" element={user && user.role === 'cashier' ? <POSScreen products={products} onCheckout={handleCheckout} /> : <Navigate to="/" />} />
          <Route path="/returns" element={user && user.role === 'cashier' ? <ReturnsScreen onSearchInvoice={handleSearchInvoice} onReturn={handleReturn} /> : <Navigate to="/" />} />

          {/* Inventory Routes */}
          <Route path="/inventory" element={user && user.role === 'inventory' ? <InventoryScreen products={products} onUpdateStock={handleUpdateStock} /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;