import React, { useContext } from 'react';
import { AppContext } from '../store/context';
import { loadCsvCategory } from '../data/csv-loader';

const Categories = () => {
  const { state, dispatch } = useContext(AppContext);

  const loadCategory = async (
    category: 'drehtabak' | 'stopftabak' | 'zigaretten' | 'zubehor'
  ) => {
    if (state.activeCategory === category) {
      dispatch({ type: 'SET_ACTIVE_CATEGORY', payload: null });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const data = await loadCsvCategory(category);
      dispatch({ type: 'SET_ITEMS', payload: { category, items: data } });
      dispatch({ type: 'SET_ACTIVE_CATEGORY', payload: category });
    } catch (e: any) {
      dispatch({ type: 'SET_ERROR', payload: e.message || 'Failed to load CSV' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <div className="order-actions" style={{ marginBottom: 24 }}>
      <button
        className="view-summary-btn"
        onClick={() => loadCategory('drehtabak')}
      >
        Drehtabak
      </button>
      <button
        className="view-summary-btn"
        onClick={() => loadCategory('stopftabak')}
      >
        Stopftabak
      </button>
      <button
        className="view-summary-btn"
        onClick={() => loadCategory('zigaretten')}
      >
        Zigaretten
      </button>
      <button
        className="view-summary-btn"
        onClick={() => loadCategory('zubehor')}
      >
        Zubehör
      </button>
    </div>
  );
};

export default Categories;