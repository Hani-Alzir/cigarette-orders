import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Categories from './Categories';
import ItemList from './ItemList';
import { AppContext } from '../store/context';

const Kiosk = () => {
  const { state, dispatch } = useContext(AppContext);
  const navigate = useNavigate();

  const getTotalItemCount = () => {
    return Object.values(state.quantities).reduce((sum, qty) => sum + qty, 0);
  };

  const handleNewOrder = () => {
    dispatch({ type: 'NEW_ORDER' });
    navigate('/');
  };

  return (
    <div className="brands-screen">
      <h1>Kiosk Münchfeld</h1>
      <Categories />
      {getTotalItemCount() > 0 && (
        <div className="current-order-info">
          <p>Current order: {getTotalItemCount()} items selected</p>
          <div className="order-actions">
            <button
              className="view-summary-btn"
              onClick={() => navigate('/summary')}
            >
              View Order Summary
            </button>
            <button className="new-order-btn" onClick={handleNewOrder}>
              New Order
            </button>
          </div>
        </div>
      )}
      <ItemList />
    </div>
  );
};

export default Kiosk;