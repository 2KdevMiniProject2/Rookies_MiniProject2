/* ---------------------------------------------------------
   장바구니 store — 주문 페이지 · 장바구니 페이지가 함께 씀
     값      store(담은 가게) · cartItems [{ menuItemId, name, price, quantity }]
     함수    addToCart · changeQuantity · removeItem · clearCart

   persist: sessionStorage 에 저장 → 새로고침하거나 다른 페이지에 갔다 와도 유지
            (브라우저 탭을 닫으면 비워짐)
   --------------------------------------------------------- */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set) => ({
      store: null,
      cartItems: [],

      // 담기 — 다른 가게 메뉴면 장바구니를 새로 시작 (주문 1건 = 가게 1곳)
      addToCart: (store, menu) =>
        set((state) => {
          const prevItems = state.store?.id === store.id ? state.cartItems : [];
          const found = prevItems.find((cartItem) => cartItem.menuItemId === menu.id);

          const nextItems = found
            ? prevItems.map((cartItem) =>
                cartItem.menuItemId === menu.id
                  ? { ...cartItem, quantity: cartItem.quantity + 1 }
                  : cartItem
              )
            : [...prevItems, { menuItemId: menu.id, name: menu.name, price: menu.price, quantity: 1 }];

          return { store, cartItems: nextItems };
        }),

      // 수량 +1 / -1 — 0개가 되면 뺀다
      changeQuantity: (menuItemId, amount) =>
        set((state) => ({
          cartItems: state.cartItems
            .map((cartItem) =>
              cartItem.menuItemId === menuItemId
                ? { ...cartItem, quantity: cartItem.quantity + amount }
                : cartItem
            )
            .filter((cartItem) => cartItem.quantity > 0),
        })),

      // 한 줄 삭제
      removeItem: (menuItemId) =>
        set((state) => ({
          cartItems: state.cartItems.filter((cartItem) => cartItem.menuItemId !== menuItemId),
        })),

      // 주문 성공 후 비우기
      clearCart: () => set({ store: null, cartItems: [] }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);