import React, { useState } from 'react';
import { CsvItem } from '../data/models';

interface OrderItem {
  serialNumber: string;
  quantity: number;
  name: string;
}

const OrderSummary: React.FC<{ 
  items: OrderItem[]; 
  onBack: () => void;
  onNewOrder: () => void;
}> = ({ items, onBack, onNewOrder }) => {
  const [copied, setCopied] = useState(false);

  const formatOrderText = () => {
    return items
      .filter((item) => item.quantity > 0)
      .map((item) => `${item.serialNumber} x ${item.quantity}`)
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

  const filteredItems = items.filter((item) => item.quantity > 0);

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
            <button className="copy-btn" onClick={handleCopy} disabled={copied}>
              {copied ? 'Copied!' : 'Copy Order'}
            </button>
            <button className="new-order-btn" onClick={onNewOrder}>
              New Order
            </button>
          </div>

          <div className="order-text">
            <h3>Order Text:</h3>
            <pre className="order-text-content">{formatOrderText()}</pre>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderSummary;