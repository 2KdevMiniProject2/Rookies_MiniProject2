import apiClient from "./client";

// 메뉴는 10개씩 페이지로 온다
const MENU_PAGE_SIZE = 100;

// 백엔드 응답 → 화면에서 쓰는 모양
// phone · description은 백엔드에 없음 → 없으면 null (화면에서 숨김)
const toStore = (response) => ({
    id: response.id,
    name: response.name,
    address: response.address,
    category: response.category,
    openTime: response.openTime,
    closeTime: response.closeTime,
    phone: response.phone ?? null,
    description: response.description ?? null,
});

const toMenu = (item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    soldOut: item.soldOut,
    imageUrl: toImageUrl(item.imageUrl),
    description: item.description ?? null,
});

// DB에는 "/images/파일이름" 저장
const toImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${apiClient.defaults.baseURL}${path}`;
};

// GET /api/stores/{storeId}
export const fetchStore = async (storeId) => {
    const response = await apiClient.get(`/api/stores/${storeId}`);
    return toStore(response.data);
};

// GET /api/stores/{storeId}/menus?size=100
export const fetchMenus = async (storeId) => {
    const response = await apiClient.get(`/api/stores/${storeId}/menus`,{params: {size: MENU_PAGE_SIZE}});
    //console.log(response.data); 
    return response.data.content.map(toMenu);
};
