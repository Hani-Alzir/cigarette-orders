import React, { useReducer, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import { AppContext } from './store/context';
import { reducer, initialState, csvKey } from './store/reducer';
import Kiosk from './components/Kiosk';
import OrderSummary from './components/OrderSummary';
import Welcome from './components/Welcome';
import { CsvItem } from './data/models';

interface OrderItem {
  serialNumber: string;
  quantity: number;
  name: string;
}

const AppRoutes = () => {
  const { state, dispatch } = React.useContext(AppContext);
  const navigate = useNavigate();

  const getOrderItems = (): OrderItem[] => {
    const allItems: OrderItem[] = [];
    const pushCsv = (items: CsvItem[] | null) => {
      if (!items) return;
      items.forEach((it) => {
        const qty = state.quantities[csvKey(it)] || 0;
        if (qty > 0) {
          allItems.push({
            serialNumber: it.serialNumber,
            quantity: qty,
            name: it.name,
          });
        }
      });
    };

    Object.values(state.items).forEach(pushCsv);

    return allItems;
  };

  const handleNewOrder = () => {
    dispatch({ type: 'NEW_ORDER' });
    navigate('/');
  };

  return (
    <Routes>
      <Route path="/" element={<Kiosk />} />
      <Route
        path="/summary"
        element={
          <OrderSummary
            items={getOrderItems()}
            onBack={() => navigate('/')}
            onNewOrder={handleNewOrder}
          />
        }
      />
    </Routes>
  );
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const handleWelcomeClose = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {showWelcome && <Welcome onClose={handleWelcomeClose} />}
      <Router basename="/cigarette-orders">
        <div className="App">
          <div className="container">
            <AppRoutes />
          </div>
        </div>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
