import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import { loadCsvCategory, CsvItem } from './data/cigarettes';

// Type definitions
interface OrderItem {
  serialNumber: string;
  quantity: number;
  name: string;
}

// ...existing code...

// OrderSummary Component
const OrderSummary: React.FC<{ 
  items: OrderItem[]; 
  onBack: () => void; 
  onNewOrder: () => void; 
}> = ({ items, onBack, onNewOrder }) => {
  const [copied, setCopied] = useState(false);

  const formatOrderText = () => {
    return items
      .filter(item => item.quantity > 0)
      .map(item => `${item.serialNumber} x ${item.quantity}`)
      .join('\n');
  };

  const handleCopy = async () => {
    const orderText = formatOrderText();
    try {
      await navigator.clipboard.writeText(orderText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const filteredItems = items.filter(item => item.quantity > 0);

  return (
    <div className="order-summary">
      <div className="summary-header">
        <h2>Order Summary</h2>
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
      </div>
      
      {filteredItems.length === 0 ? (
        <div className="empty-order">
          <p>No items selected</p>
          <p>Go back and select some cigarettes</p>
        </div>
      ) : (
        <>
          <div className="order-items">
            {filteredItems.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-info">
                  <span className="item-serial">#{item.serialNumber}</span>
                  <span className="item-name">{item.name}</span>
                </div>
                <span className="item-quantity">x{item.quantity}</span>
              </div>
            ))}
          </div>
          
          <div className="summary-actions">
            <button 
              className="copy-btn" 
              onClick={handleCopy}
              disabled={copied}
            >
              {copied ? 'Copied!' : 'Copy Order'}
            </button>
            <button 
              className="new-order-btn" 
              onClick={onNewOrder}
            >
              New Order
            </button>
          </div>
          
          <div className="order-text">
            <h3>Order Text:</h3>
            <pre className="order-text-content">
              {formatOrderText()}
            </pre>
          </div>
        </>
      )}
    </div>
  );
};

// Main App Router Component
const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleNewOrder = () => {
    setQuantities({});
    navigate('/');
  };

  const [activeCsvSection, setActiveCsvSection] = useState<'drehtabak' | 'stopftabak' | 'zigaretten' | null>(null);
  const [drehtabakItems, setDrehtabakItems] = useState<CsvItem[] | null>(null);
  const [stopftabakItems, setStopftabakItems] = useState<CsvItem[] | null>(null);
  const [zigarettenItems, setZigarettenItems] = useState<CsvItem[] | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);

  const csvKey = (item: CsvItem) => `${item.category}:${item.serialNumber}`;

  const handleCsvQuantityChange = (item: CsvItem, delta: number) => {
    const key = csvKey(item);
    setQuantities(prev => {
      const current = prev[key] || 0;
      const next = Math.max(0, current + delta);
      if (next === current) return prev;
      return { ...prev, [key]: next };
    });
  };

  const forceReloadSection = (section: 'drehtabak' | 'stopftabak' | 'zigaretten') => {
    if (section === 'drehtabak') setDrehtabakItems(null);
    if (section === 'stopftabak') setStopftabakItems(null);
    if (section === 'zigaretten') setZigarettenItems(null);
  };

  const loadCsvIfNeeded = async (section: 'drehtabak' | 'stopftabak' | 'zigaretten', opts: { force?: boolean } = {}) => {
    const togglingSame = section === activeCsvSection;
    if (togglingSame && !opts.force) {
      // Collapse if same section clicked (no force)
      setActiveCsvSection(null);
      return;
    }
    setActiveCsvSection(section);
    if (opts.force) forceReloadSection(section);
    const alreadyLoaded = !opts.force && ((section === 'drehtabak' && drehtabakItems) ||
      (section === 'stopftabak' && stopftabakItems) ||
      (section === 'zigaretten' && zigarettenItems));
    if (alreadyLoaded) return;
    setCsvLoading(true);
    setCsvError(null);
    try {
      const data = await loadCsvCategory(section);
      if (section === 'drehtabak') setDrehtabakItems(data);
      if (section === 'stopftabak') setStopftabakItems(data);
      if (section === 'zigaretten') setZigarettenItems(data);
    } catch (e: any) {
      setCsvError(e.message || 'Failed to load CSV');
    } finally {
      setCsvLoading(false);
    }
  };

  const renderCsvItems = (items: CsvItem[] | null) => {
    if (csvLoading && !items) return <p style={{ color: 'white' }}>Loading CSV...</p>;
    if (csvError) return <p style={{ color: '#ffc107' }}>Error: {csvError}</p>;
    if (!items) return <p style={{ color: 'white' }}>Section not loaded.</p>;
    if (items.length === 0) return <p style={{ color: 'white' }}>File loaded but no rows parsed (no valid lines).</p>;
    // Detect sentinel cases
    if (items.length === 1 && items[0].serialNumber === 'ERR') {
      return <p style={{ color: '#ffc107' }}>Failed to load CSV (see console). You can try again later.</p>;
    }
    if (items.length === 1 && items[0].serialNumber === '00000' && items[0].name === 'Fallback Example') {
      return <p style={{ color: 'white' }}>CSV appeared empty. Showing fallback example entry.</p>;
    }
    return (
      <div className="brands-grid">
        {items.map(it => {
          const qty = quantities[csvKey(it)] || 0;
          return (
            <div key={csvKey(it)} className="brand-card" style={{ position: 'relative' }}>
              {qty > 0 && (
                <div className="brand-item-count" style={{ top: 8, right: 8 }}>{qty}</div>
              )}
              <div className="brand-name" style={{ marginBottom: 8 }}>{it.name}</div>
              <div className="brand-models-count" style={{ marginBottom: 12 }}>Serial: <span style={{ color: '#007bff' }}>{it.serialNumber}</span></div>
              <div className="quantity-controls" style={{ justifyContent: 'center' }}>
                <button className="quantity-btn minus" onClick={() => handleCsvQuantityChange(it, -1)} disabled={qty === 0}>-</button>
                <span className="quantity-display">{qty}</span>
                <button className="quantity-btn plus" onClick={() => handleCsvQuantityChange(it, 1)}>+</button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getOrderItems = (): OrderItem[] => {
    const allItems: OrderItem[] = [];
    const pushCsv = (items: CsvItem[] | null) => {
      if (!items) return;
      items.forEach(it => {
        const qty = quantities[csvKey(it)] || 0;
        if (qty > 0) {
          allItems.push({
            serialNumber: it.serialNumber,
            quantity: qty,
            name: it.name
          });
        }
      });
    };
    pushCsv(drehtabakItems);
    pushCsv(stopftabakItems);
    pushCsv(zigarettenItems);
    return allItems;
  };

  const getTotalItemCount = (): number => {
    return Object.values(quantities).reduce((sum: number, qty: number) => sum + qty, 0);
  };

  const renderHomeScreen = () => (
    <div className="brands-screen">
      <h1>Kiosk Münchfeld</h1>
      <div className="order-actions" style={{ marginBottom: 24 }}>
        <button
          className="view-summary-btn"
          title="Click to toggle, Shift+Click to reload"
          onClick={(e) => loadCsvIfNeeded("drehtabak", { force: e.shiftKey })}
        >
          Drehtabak-Table 1
        </button>
        <button
          className="view-summary-btn"
          title="Click to toggle, Shift+Click to reload"
          onClick={(e) => loadCsvIfNeeded("stopftabak", { force: e.shiftKey })}
        >
          Stopftabak-Table 1
        </button>
        <button
          className="view-summary-btn"
          title="Click to toggle, Shift+Click to reload"
          onClick={(e) => loadCsvIfNeeded("zigaretten", { force: e.shiftKey })}
        >
          Zigaretten-Table 1
        </button>
      </div>
      {getTotalItemCount() > 0 && (
        <div className="current-order-info">
          <p>Current order: {getTotalItemCount()} items selected</p>
          <div className="order-actions">
            <button
              className="view-summary-btn"
              onClick={() => navigate("/summary")}
            >
              View Order Summary
            </button>
            <button className="new-order-btn" onClick={handleNewOrder}>
              New Order
            </button>
          </div>
        </div>
      )}
      {activeCsvSection === "drehtabak" && (
        <div style={{ marginTop: 32 }}>
          <h2
            style={{ color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
          >
            Drehtabak Items
          </h2>
          {renderCsvItems(drehtabakItems)}
        </div>
      )}
      {activeCsvSection === "stopftabak" && (
        <div style={{ marginTop: 32 }}>
          <h2
            style={{ color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
          >
            Stopftabak Items
          </h2>
          {renderCsvItems(stopftabakItems)}
        </div>
      )}
      {activeCsvSection === "zigaretten" && (
        <div style={{ marginTop: 32 }}>
          <h2
            style={{ color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
          >
            Zigaretten Items
          </h2>
          {renderCsvItems(zigarettenItems)}
        </div>
      )}
    </div>
  );

  const renderSummaryScreen = () => (
    <OrderSummary
      items={getOrderItems()}
      onBack={() => navigate('/')}
      onNewOrder={handleNewOrder}
    />
  );

  return (
    <div className="App">
      <div className="container">
        <Routes>
          <Route path="/" element={renderHomeScreen()} />
          <Route path="/summary" element={renderSummaryScreen()} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router basename="/cigarette-orders">
      <AppRoutes />
    </Router>
  );
}

export default App;
