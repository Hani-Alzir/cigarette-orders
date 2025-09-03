import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import './App.css';

// Type definitions
interface Model {
  id: string;
  name: string;
  serialNumber: string;
  imageUrl?: string;
}

interface Brand {
  id: string;
  name: string;
  imageUrl?: string;
  models: Model[];
}

interface OrderItem {
  serialNumber: string;
  quantity: number;
  modelName: string;
  brandName: string;
}

// Sample data
const cigaretteData: Brand[] = [
  {
    id: "marlboro",
    name: "Marlboro",
    imageUrl: `${process.env.PUBLIC_URL}/images/marlboro_logo.png`,
    models: [
      {
        id: "marlboro-gold",
        name: "Marlboro Gold",
        serialNumber: "234551",
        imageUrl: `${process.env.PUBLIC_URL}/images/marlboro_gold.jpg`,
      },
      {
        id: "marlboro-red",
        name: "Marlboro Red",
        serialNumber: "234552",
        imageUrl: `${process.env.PUBLIC_URL}/images/marlboro_logo.png`,
      },
    ],
  },
  {
    id: "winston",
    name: "Winston",
    imageUrl: `${process.env.PUBLIC_URL}/images/winston.jpg`,
    models: [
      {
        id: "winston-red",
        name: "Winston Red",
        serialNumber: "234522",
        imageUrl: `${process.env.PUBLIC_URL}/images/winston_red.webp`,
      },
      {
        id: "winston-blue",
        name: "Winston Blue",
        serialNumber: "234521",
        imageUrl: `${process.env.PUBLIC_URL}/images/winston.jpg`,
      },
    ],
  },
  {
    id: "camel",
    name: "Camel",
    imageUrl: `${process.env.PUBLIC_URL}/images/camel_logo.png`,
    models: [
      {
        id: "camel-blue",
        name: "Camel Blue",
        serialNumber: "234531",
        imageUrl: `${process.env.PUBLIC_URL}/images/camel_blue.webp`,
      },
      {
        id: "camel-yellow",
        name: "Camel Yellow",
        serialNumber: "234532",
        imageUrl: `${process.env.PUBLIC_URL}/images/camel_yellow.webp`,
      },
    ],
  },
];

// BrandCard Component
const BrandCard: React.FC<{ brand: Brand; onClick: (brand: Brand) => void }> = ({ brand, onClick }) => {
  return (
    <div className="brand-card" onClick={() => onClick(brand)}>
      <div className="brand-image">
        {brand.imageUrl ? (
          <img src={brand.imageUrl} alt={brand.name} />
        ) : (
          <div className="brand-placeholder">{brand.name.charAt(0)}</div>
        )}
      </div>
      <div className="brand-name">{brand.name}</div>
      <div className="brand-models-count">{brand.models.length} models</div>
    </div>
  );
};

// ModelCard Component
const ModelCard: React.FC<{ 
  model: Model; 
  quantity: number; 
  onQuantityChange: (modelId: string, quantity: number) => void 
}> = ({ model, quantity, onQuantityChange }) => {
  const handleIncrement = () => {
    onQuantityChange(model.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onQuantityChange(model.id, quantity - 1);
    }
  };

  return (
    <div className="model-card">
      <div className="model-info">
        <div className="model-image">
          {model.imageUrl ? (
            <img src={model.imageUrl} alt={model.name} />
          ) : (
            <div className="model-placeholder">{model.name.charAt(0)}</div>
          )}
        </div>
        <div className="model-details">
          <div className="model-name">{model.name}</div>
          <div className="model-serial">#{model.serialNumber}</div>
        </div>
      </div>
      <div className="quantity-controls">
        <button 
          className="quantity-btn minus" 
          onClick={handleDecrement}
          disabled={quantity === 0}
        >
          -
        </button>
        <span className="quantity-display">{quantity}</span>
        <button 
          className="quantity-btn plus" 
          onClick={handleIncrement}
        >
          +
        </button>
      </div>
    </div>
  );
};

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
                  <span className="item-name">{item.modelName}</span>
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

  const handleBrandSelect = (brand: Brand) => {
    navigate(`/models/${brand.id}`);
    // Initialize quantities for all models in this brand if not already set
    const newQuantities = { ...quantities };
    brand.models.forEach((model: Model) => {
      if (!(model.id in newQuantities)) {
        newQuantities[model.id] = 0;
      }
    });
    setQuantities(newQuantities);
  };

  const handleQuantityChange = (modelId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [modelId]: quantity
    }));
  };

  const handleDone = () => {
    navigate('/summary');
  };

  const handleBackToBrands = () => {
    navigate('/');
    // Don't reset quantities - keep them for multi-brand selection
  };

  const handleNewOrder = () => {
    setQuantities({});
    navigate('/');
  };

  const getOrderItems = (): OrderItem[] => {
    const allItems: OrderItem[] = [];
    
    // Go through all brands and collect items with quantities > 0
    cigaretteData.forEach((brand: Brand) => {
      brand.models.forEach((model: Model) => {
        const quantity = quantities[model.id] || 0;
        if (quantity > 0) {
          allItems.push({
            serialNumber: model.serialNumber,
            quantity: quantity,
            modelName: model.name,
            brandName: brand.name
          });
        }
      });
    });
    
    return allItems;
  };

  const getBrandItemCount = (brand: Brand): number => {
    return brand.models.reduce((count: number, model: Model) => {
      return count + (quantities[model.id] || 0);
    }, 0);
  };

  const getTotalItemCount = (): number => {
    return Object.values(quantities).reduce((sum: number, qty: number) => sum + qty, 0);
  };

  const renderBrandsScreen = () => (
    <div className="brands-screen">
      <h1>Cigarette Orders</h1>
      <p className="subtitle">Select a brand to start your order</p>
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
            <button 
              className="new-order-btn" 
              onClick={handleNewOrder}
            >
              New Order
            </button>
          </div>
        </div>
      )}
      <div className="brands-grid">
        {cigaretteData.map((brand: Brand) => {
          const brandItemCount = getBrandItemCount(brand);
          return (
            <div key={brand.id} className="brand-card-wrapper">
              <BrandCard
                brand={brand}
                onClick={handleBrandSelect}
              />
              {brandItemCount > 0 && (
                <div className="brand-item-count">
                  {brandItemCount} items selected
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderModelsScreen = (brandId: string) => {
    const brand = cigaretteData.find(b => b.id === brandId);
    if (!brand) {
      navigate('/');
      return null;
    }

    const totalItems = Object.values(quantities).reduce((sum: number, qty: number) => sum + qty, 0);

    return (
      <div className="models-screen">
        <div className="models-header">
          <button className="back-btn" onClick={handleBackToBrands}>
            ← Back to Brands
          </button>
          <h2>{brand.name} Models</h2>
          <div className="total-items">
            Total: {totalItems} items
          </div>
        </div>
        
        <div className="models-list">
          {brand.models.map((model: Model) => (
            <ModelCard
              key={model.id}
              model={model}
              quantity={quantities[model.id] || 0}
              onQuantityChange={handleQuantityChange}
            />
          ))}
        </div>
        
        <div className="models-actions">
          <button 
            className="done-btn" 
            onClick={handleDone}
            disabled={totalItems === 0}
          >
            Done ({totalItems} items)
          </button>
        </div>
      </div>
    );
  };

  const renderSummaryScreen = () => (
    <OrderSummary
      items={getOrderItems()}
      onBack={handleBackToBrands}
      onNewOrder={handleNewOrder}
    />
  );

  return (
    <div className="App">
      <div className="container">
        <Routes>
          <Route path="/" element={renderBrandsScreen()} />
          <Route path="/models/:brandId" element={
            <ModelScreenWrapper 
              renderModelsScreen={renderModelsScreen}
              quantities={quantities}
              setQuantities={setQuantities}
            />
          } />
          <Route path="/summary" element={renderSummaryScreen()} />
        </Routes>
      </div>
    </div>
  );
};

// Wrapper component for models screen to handle URL params
const ModelScreenWrapper: React.FC<{
  renderModelsScreen: (brandId: string) => React.ReactNode;
  quantities: Record<string, number>;
  setQuantities: (quantities: Record<string, number>) => void;
}> = ({ renderModelsScreen, quantities, setQuantities }) => {
  const { brandId } = useParams<{ brandId: string }>();
  
  React.useEffect(() => {
    if (brandId) {
      const brand = cigaretteData.find(b => b.id === brandId);
      if (brand) {
        // Initialize quantities for all models in this brand if not already set
        const newQuantities = { ...quantities };
        brand.models.forEach((model: Model) => {
          if (!(model.id in newQuantities)) {
            newQuantities[model.id] = 0;
          }
        });
        setQuantities(newQuantities);
      }
    }
  }, [brandId, quantities, setQuantities]);

  return <>{brandId ? renderModelsScreen(brandId) : null}</>;
};

function App() {
  return (
    <Router basename="/cigarette-orders">
      <AppRoutes />
    </Router>
  );
}

export default App;
