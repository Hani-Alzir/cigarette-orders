import { AppState, Action } from './types';

export const initialState: AppState = {
  quantities: {},
  activeCategory: null,
  items: {
    drehtabak: null,
    stopftabak: null,
    zigaretten: null,
    zubehor: null,
  },
  loading: false,
  error: null,
};

export const csvKey = (item: { category: string; serialNumber: string }) =>
  `${item.category}:${item.serialNumber}`;

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_QUANTITY': {
      const { item, quantity } = action.payload;
      const key = csvKey(item);
      const newQuantities = { ...state.quantities };
      if (quantity > 0) {
        newQuantities[key] = quantity;
      } else {
        delete newQuantities[key];
      }
      return { ...state, quantities: newQuantities };
    }
    case 'SET_ACTIVE_CATEGORY':
      return { ...state, activeCategory: action.payload };
    case 'SET_ITEMS': {
      const { category, items } = action.payload;
      return {
        ...state,
        items: {
          ...state.items,
          [category]: items,
        },
      };
    }
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'NEW_ORDER':
      return {
        ...state,
        quantities: {},
        activeCategory: null,
      };
    default:
      return state;
  }
}
