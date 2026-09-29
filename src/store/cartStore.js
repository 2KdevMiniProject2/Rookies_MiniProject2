import { create } from 'zustand';

const CART_STORAGE_KEY = 'rookie_order_cart';

const getInitialCart = () => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        storeId: parsed.storeId || null,
        storeName: parsed.storeName || '',
        items: parsed.items || [],
      };
    }
  } catch (e) {
    console.error('Failed to parse cart from localStorage', e);
  }
  return { storeId: null, storeName: '', items: [] };
};

const initial = getInitialCart();

export const useCartStore = create((set, get) => ({
  storeId: initial.storeId,
  storeName: initial.storeName,
  items: initial.items,

  // 장바구니에 담기
  addItem: (storeInfo, item) => {
    const state = get();
    // 다른 매장 메뉴가 이미 들어있는 경우 새로 시작
    let newItems = [...state.items];
    let newStoreId = state.storeId;
    let newStoreName = state.storeName;

    if (state.storeId && state.storeId !== storeInfo.id) {
      if (!window.confirm('다른 매장의 메뉴가 담겨 있습니다. 기존 장바구니를 비우고 새로 담으시겠습니까?')) {
        return false;
      }
      newItems = [];
      newStoreId = storeInfo.id;
      newStoreName = storeInfo.name;
    } else {
      newStoreId = storeInfo.id;
      newStoreName = storeInfo.name;
    }

    const existingIndex = newItems.findIndex((i) => i.id === item.id);
    if (existingIndex > -1) {
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newItems[existingIndex].quantity + 1,
      };
    } else {
      newItems.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        imageUrl: item.imageUrl || '',
      });
    }

    const cartData = { storeId: newStoreId, storeName: newStoreName, items: newItems };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    set(cartData);
    return true;
  },

  // 수량 변경 (+1, -1)
  updateQuantity: (itemId, delta) => {
    const state = get();
    const newItems = state.items
      .map((item) => {
        if (item.id === itemId) {
          const nextQty = item.quantity + delta;
          return nextQty > 0 ? { ...item, quantity: nextQty } : null;
        }
        return item;
      })
      .filter(Boolean);

    const newStoreId = newItems.length > 0 ? state.storeId : null;
    const newStoreName = newItems.length > 0 ? state.storeName : '';
    const cartData = { storeId: newStoreId, storeName: newStoreName, items: newItems };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    set(cartData);
  },

  // 특정 품목 삭제
  removeItem: (itemId) => {
    const state = get();
    const newItems = state.items.filter((item) => item.id !== itemId);
    const newStoreId = newItems.length > 0 ? state.storeId : null;
    const newStoreName = newItems.length > 0 ? state.storeName : '';
    const cartData = { storeId: newStoreId, storeName: newStoreName, items: newItems };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    set(cartData);
  },

  // 장바구니 비우기
  clearCart: () => {
    localStorage.removeItem(CART_STORAGE_KEY);
    set({ storeId: null, storeName: '', items: [] });
  },

  // 총 수량 계산
  getTotalQuantity: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  // 총 금액 계산
  getTotalPrice: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
}));
