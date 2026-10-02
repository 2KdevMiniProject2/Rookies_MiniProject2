import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import Logo from '../../components/common/Logo';
import './MenuRegisterPage.css';

function MenuRegisterPage() {
    const navigate = useNavigate();
    const { storeId } = useParams();
    const authUser = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const ownerId = authUser?.id;
    const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

    const menuImageInputRef = useRef(null);
    const editImageInputRef = useRef(null);

    const [menuName, setMenuName] = useState('');
    const [menuPrice, setMenuPrice] = useState('');
    const [menuImageFile, setMenuImageFile] = useState(null);
    const [menuImagePreview, setMenuImagePreview] = useState('');
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [editingMenuId, setEditingMenuId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editImageFile, setEditImageFile] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const getMenuImageSrc = (imageUrl) => {
        if (!imageUrl) {
            return '';
        }

        if (
            imageUrl.startsWith('http://') ||
            imageUrl.startsWith('https://') ||
            imageUrl.startsWith('blob:') ||
            imageUrl.startsWith('data:')
        ) {
            return imageUrl;
        }

        return `${backendBaseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    };

    const uploadMenuImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await apiClient.post('/api/menus/images', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    };

    const fetchMenus = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await apiClient.get(`/api/stores/${storeId}/menus`, {
                params: {
                    size: 100,
                },
            });

            console.log('메뉴 목록 조회 성공:', response.data);
            setMenus(response.data.content || []);
        } catch (error) {
            console.error('메뉴 목록 조회 실패:', error);
            setError('메뉴 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenus();
    }, [storeId]);

    const handleMenuImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 선택할 수 있습니다.');
            e.target.value = '';
            return;
        }

        if (menuImagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(menuImagePreview);
        }

        setMenuImageFile(file);
        setMenuImagePreview(URL.createObjectURL(file));
    };

    const resetMenuForm = () => {
        if (menuImagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(menuImagePreview);
        }

        setMenuName('');
        setMenuPrice('');
        setMenuImageFile(null);
        setMenuImagePreview('');

        if (menuImageInputRef.current) {
            menuImageInputRef.current.value = '';
        }
    };

    const handleMenuAdd = async () => {
        if (!ownerId) {
            alert('로그인 사용자 정보를 확인할 수 없습니다.');
            return;
        }

        if (!menuName.trim()) {
            alert('메뉴명을 입력해주세요.');
            return;
        }

        if (!menuPrice || Number(menuPrice) <= 0) {
            alert('가격은 0보다 큰 금액을 입력해주세요.');
            return;
        }

        try {
            setIsSubmitting(true);

            let imageUrl = null;

            if (menuImageFile) {
                imageUrl = await uploadMenuImage(menuImageFile);
            }

            const response = await apiClient.post(
                `/api/stores/${storeId}/menus`,
                {
                    name: menuName.trim(),
                    price: Number(menuPrice),
                    imageUrl: imageUrl,
                },
                {
                    params: {
                        ownerId: ownerId,
                    },
                }
            );

            console.log('메뉴 등록 성공:', response.data);
            resetMenuForm();
            await fetchMenus();
            alert(`${response.data.name} 메뉴가 등록되었습니다.`);
        } catch (error) {
            console.error('메뉴 등록 실패:', error);

            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('메뉴 등록에 실패했습니다.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSoldOutToggle = async (menuId) => {
        if (!ownerId) {
            alert('로그인 사용자 정보를 확인할 수 없습니다.');
            return;
        }

        try {
            const response = await apiClient.patch(
                `/api/menus/${menuId}/sold-out`,
                null,
                {
                    params: {
                        ownerId: ownerId,
                    },
                }
            );

            setMenus((prev) =>
                prev.map((menu) =>
                    menu.id === menuId ? response.data : menu
                )
            );
        } catch (error) {
            console.error('품절 상태 변경 실패:', error);
            alert('판매 상태 변경에 실패했습니다.');
        }
    };

    const handleEditStart = (menu) => {
        if (editImagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(editImagePreview);
        }

        setEditingMenuId(menu.id);
        setEditName(menu.name);
        setEditPrice(String(menu.price));
        setEditImageFile(null);
        setEditImagePreview(getMenuImageSrc(menu.imageUrl));

        if (editImageInputRef.current) {
            editImageInputRef.current.value = '';
        }
    };

    const handleEditImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 선택할 수 있습니다.');
            e.target.value = '';
            return;
        }

        if (editImagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(editImagePreview);
        }

        setEditImageFile(file);
        setEditImagePreview(URL.createObjectURL(file));
    };

    const handleEditCancel = () => {
        if (editImagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(editImagePreview);
        }

        setEditingMenuId(null);
        setEditName('');
        setEditPrice('');
        setEditImageFile(null);
        setEditImagePreview('');

        if (editImageInputRef.current) {
            editImageInputRef.current.value = '';
        }
    };

    const handleEditSave = async (menu) => {
        if (!ownerId) {
            alert('로그인 사용자 정보를 확인할 수 없습니다.');
            return;
        }

        if (!editName.trim()) {
            alert('메뉴명을 입력해주세요.');
            return;
        }

        if (!editPrice || Number(editPrice) <= 0) {
            alert('가격은 0보다 큰 금액을 입력해주세요.');
            return;
        }

        try {
            setIsEditing(true);

            let imageUrl = menu.imageUrl;

            if (editImageFile) {
                imageUrl = await uploadMenuImage(editImageFile);
            }

            const response = await apiClient.patch(
                `/api/menus/${menu.id}`,
                {
                    name: editName.trim(),
                    price: Number(editPrice),
                    imageUrl: imageUrl,
                },
                {
                    params: {
                        ownerId: ownerId,
                    },
                }
            );

            setMenus((prev) =>
                prev.map((item) =>
                    item.id === menu.id ? response.data : item
                )
            );

            handleEditCancel();
            alert('메뉴가 수정되었습니다.');
        } catch (error) {
            console.error('메뉴 수정 실패:', error);

            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('메뉴 수정에 실패했습니다.');
            }
        } finally {
            setIsEditing(false);
        }
    };

    const handleMenuDelete = async (menuId, menuName) => {
        if (!ownerId) {
            alert('로그인 사용자 정보를 확인할 수 없습니다.');
            return;
        }

        const confirmed = window.confirm(
            `${menuName} 메뉴를 삭제하시겠습니까?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await apiClient.delete(`/api/menus/${menuId}`, {
                params: {
                    ownerId: ownerId,
                },
            });

            setMenus((prev) =>
                prev.filter((menu) => menu.id !== menuId)
            );

            alert('메뉴가 삭제되었습니다.');
        } catch (error) {
            console.error('메뉴 삭제 실패:', error);

            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('메뉴 삭제에 실패했습니다.');
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    const handleLogoKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            navigate('/');
        }
    };

    return (
        <main className="menu-register-page">
            <div className="menu-register-layout">
                <aside className="menu-register-sidebar">
                    <div
                        role="button"
                        tabIndex={0}
                        aria-label="메인 화면으로 이동"
                        onClick={handleLogoClick}
                        onKeyDown={handleLogoKeyDown}
                        style={{ cursor: 'pointer' }}
                    >
                        <Logo className="owner-sidebar-logo" />
                    </div>

                    <strong>사장님 마이페이지</strong>

                    <nav>
                        <button type="button" onClick={() => navigate('/mypage')}>
                            마이페이지
                        </button>

                        <button type="button" onClick={() => navigate('/stores/register')}>
                            가게 등록
                        </button>

                        <button type="button" className="active" onClick={() => navigate('/owner/stores')}>
                            가게별 메뉴 관리
                        </button>

                        <button type="button" onClick={() => navigate('/mypage/profile')}>
                            회원정보
                        </button>

                        <button type="button" onClick={handleLogout}>
                            로그아웃
                        </button>
                    </nav>
                </aside>

                <section className="menu-register-main">
                    <div className="menu-register-title">
                        가게별 메뉴 관리
                    </div>

                    <div className="menu-register-content">
                        <section className="current-store-section">
                            <div>
                                <span className="current-store-label">
                                    선택한 가게
                                </span>

                                <h2>메뉴 관리</h2>

                                <p>
                                    선택한 가게의 메뉴를 등록하고 관리할 수 있습니다.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="store-change-button"
                                onClick={() => navigate('/owner/stores')}
                            >
                                가게 변경
                            </button>
                        </section>

                        <section className="menu-section">
                            <h2>새 메뉴 추가</h2>

                            <p className="menu-section-description">
                                메뉴 이름, 가격, 이미지를 등록해주세요.
                            </p>

                            <div className="menu-form-group">
                                <label htmlFor="menuName">메뉴명</label>

                                <input
                                    id="menuName"
                                    type="text"
                                    value={menuName}
                                    onChange={(e) => setMenuName(e.target.value)}
                                    placeholder="메뉴명을 입력해주세요."
                                />
                            </div>

                            <div className="menu-form-group">
                                <label htmlFor="menuPrice">가격</label>

                                <input
                                    id="menuPrice"
                                    type="number"
                                    value={menuPrice}
                                    onChange={(e) => setMenuPrice(e.target.value)}
                                    placeholder="가격을 입력해주세요."
                                />
                            </div>

                            <div className="menu-form-group">
                                <label htmlFor="menuImage">메뉴 이미지</label>

                                <input
                                    ref={menuImageInputRef}
                                    id="menuImage"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleMenuImageChange}
                                />

                                {menuImagePreview && (
                                    <div className="menu-image-preview">
                                        <img
                                            src={menuImagePreview}
                                            alt="메뉴 이미지 미리보기"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="menu-register-buttons">
                                <button
                                    type="button"
                                    className="back-button"
                                    onClick={() => navigate('/owner/stores')}
                                >
                                    이전
                                </button>

                                <button
                                    type="button"
                                    className="menu-save-button"
                                    onClick={handleMenuAdd}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? '등록 중...' : '메뉴 등록'}
                                </button>
                            </div>
                        </section>

                        <section className="menu-section">
                            <div className="menu-list-title">
                                <div>
                                    <h2>등록된 메뉴</h2>
                                    <p>현재 가게에 등록된 메뉴 목록입니다.</p>
                                </div>

                                <span>{menus.length}개</span>
                            </div>

                            {loading ? (
                                <div className="empty-menu">
                                    메뉴 목록을 불러오는 중입니다.
                                </div>
                            ) : error ? (
                                <div className="empty-menu">
                                    {error}
                                </div>
                            ) : menus.length === 0 ? (
                                <div className="empty-menu">
                                    등록된 메뉴가 없습니다.
                                </div>
                            ) : (
                                <div className="menu-list">
                                    {menus.map((menu) => (
                                        <div className="menu-item" key={menu.id}>
                                            {editingMenuId === menu.id ? (
                                                <div className="menu-edit-area">
                                                    <div className="menu-edit-image-column">
                                                        {editImagePreview ? (
                                                            <div className="menu-edit-image-preview">
                                                                <img
                                                                    src={editImagePreview}
                                                                    alt={`${menu.name} 메뉴 이미지`}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="menu-image-placeholder">
                                                                이미지 없음
                                                            </div>
                                                        )}

                                                        <input
                                                            ref={editImageInputRef}
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleEditImageChange}
                                                        />
                                                    </div>

                                                    <div className="menu-edit-fields">
                                                        <input
                                                            type="text"
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                        />

                                                        <input
                                                            type="number"
                                                            value={editPrice}
                                                            onChange={(e) => setEditPrice(e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="menu-edit-buttons">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditSave(menu)}
                                                            disabled={isEditing}
                                                        >
                                                            {isEditing ? '저장 중...' : '저장'}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={handleEditCancel}
                                                            disabled={isEditing}
                                                        >
                                                            취소
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {menu.imageUrl ? (
                                                        <div className="menu-item-image-wrap">
                                                            <img
                                                                src={getMenuImageSrc(menu.imageUrl)}
                                                                alt={`${menu.name} 메뉴 이미지`}
                                                                className="menu-item-image"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="menu-image-placeholder">
                                                            이미지 없음
                                                        </div>
                                                    )}

                                                    <div className="menu-item-info">
                                                        <strong>{menu.name}</strong>
                                                        <p>{menu.price.toLocaleString()}원</p>
                                                    </div>

                                                    <div className="menu-item-actions">
                                                        <button
                                                            type="button"
                                                            className={`sold-out-button ${menu.soldOut ? 'sold-out' : ''}`}
                                                            onClick={() => handleSoldOutToggle(menu.id)}
                                                        >
                                                            {menu.soldOut ? '판매 재개' : '품절 처리'}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="menu-edit-button"
                                                            onClick={() => handleEditStart(menu)}
                                                        >
                                                            수정
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="menu-delete-button"
                                                            onClick={() => handleMenuDelete(menu.id, menu.name)}
                                                        >
                                                            삭제
                                                        </button>

                                                        <span className={`menu-status ${menu.soldOut ? 'sold-out' : ''}`}>
                                                            {menu.soldOut ? '품절' : '판매중'}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default MenuRegisterPage;
