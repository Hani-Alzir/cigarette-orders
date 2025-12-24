import React, { useContext } from 'react';
import { AppContext } from '../store/context';
import { CsvItem } from '../data/models';
import { csvKey } from '../store/reducer';

const ItemList = () => {
  const { state, dispatch } = useContext(AppContext);

  const handleQuantityChange = (item: CsvItem, delta: number) => {
    const key = csvKey(item);
    const currentQuantity = state.quantities[key] || 0;
    const newQuantity = Math.max(0, currentQuantity + delta);
    dispatch({ type: 'SET_QUANTITY', payload: { item, quantity: newQuantity } });
  };

  if (state.loading) {
    return <p className="loading-message">Loading CSV...</p>;
  }

  if (state.error) {
    return <p className="error-message">Error: {state.error}</p>;
  }

  const items = state.activeCategory ? state.items[state.activeCategory] : null;

  if (!items) {
    return null;
  }

  if (items.length === 0) {
    return <p className="empty-message">File loaded but no rows parsed (no valid lines).</p>;
  }

  if (items.length === 1 && items[0].serialNumber === 'ERR') {
    return <p className="error-message">Failed to load CSV (see console). You can try again later.</p>;
  }

  if (items.length === 1 && items[0].serialNumber === '00000' && items[0].name === 'Fallback Example') {
    return <p className="empty-message">CSV appeared empty. Showing fallback example entry.</p>;
  }

  return (
    <>
      {state.activeCategory && (
        <h2 className="category-title">
          {state.activeCategory.charAt(0).toUpperCase() + state.activeCategory.slice(1)} Items
        </h2>
      )}
      <div className="brands-grid">
        {items.map((item) => {
          const qty = state.quantities[csvKey(item)] || 0;
          return (
            <div key={csvKey(item)} className="brand-card">
              {qty > 0 && <div className="brand-item-count">{qty}</div>}
              <div className="brand-name">{item.name}</div>
              <div className="brand-models-count">
                Serial: <span>{item.serialNumber}</span>
              </div>
              <div className="quantity-controls">
                <button
                  className="quantity-btn minus"
                  onClick={() => handleQuantityChange(item, -1)}
                  disabled={qty === 0}
                >
                  -
                </button>
                <span className="quantity-display">{qty}</span>
                <button
                  className="quantity-btn plus"
                  onClick={() => handleQuantityChange(item, 1)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ItemList;
