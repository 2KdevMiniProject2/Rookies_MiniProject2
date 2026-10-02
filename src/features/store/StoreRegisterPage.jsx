import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import Logo from '../../components/common/Logo';
import './StoreRegisterPage.css';

function StoreRegisterPage() {
    const navigate = useNavigate();
    const authUser = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const ownerId = authUser?.id;

    const [storeName, setStoreName] = useState('');
    const [storeCategory, setStoreCategory] = useState('');
    const [storeAddress, setStoreAddress] = useState('');
    const [storeImageUrl, setStoreImageUrl] = useState('');
    const [openTime, setOpenTime] = useState('');
    const [closeTime, setCloseTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStoreRegister = async () => {
        if (!ownerId) {
            alert('로그인 사용자 정보를 확인할 수 없습니다.');
            return;
        }

        if (!storeName.trim()) {
            alert('가게명을 입력해주세요.');
            return;
        }

        if (!storeCategory) {
            alert('카테고리를 선택해주세요.');
            return;
        }

        if (!storeAddress.trim()) {
            alert('주소를 입력해주세요.');
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await apiClient.post(`/api/stores?ownerId=${ownerId}`, {
                name: storeName,
                address: storeAddress,
                category: storeCategory,
                imageUrl: storeImageUrl.trim() || null,
                openTime: openTime || null,
                closeTime: closeTime || null,
            });

            console.log('가게 등록 성공:', response.data);

            alert(`${response.data.name} 가게가 등록되었습니다.`);

            setStoreName('');
            setStoreCategory('');
            setStoreAddress('');
            setStoreImageUrl('');
            setOpenTime('');
            setCloseTime('');
        } catch (error) {
            console.error('가게 등록 실패:', error);

            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('가게 등록에 실패했습니다.');
            }
        } finally {
            setIsSubmitting(false);
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
        <main className="store-register-page">
            <div className="store-register-layout">
                <aside className="store-register-sidebar">
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

                        <button
                            type="button"
                            onClick={() => navigate('/mypage#owner-dashboard-section')}
                        >
                            주문 대시보드
                        </button>

                        <button type="button" className="active">
                            가게 등록
                        </button>

                        <button type="button" onClick={() => navigate('/owner/stores')}>
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

                <section className="store-register-main">
                    <div className="store-register-title">
                        가게 등록
                    </div>

                    <div className="store-register-content">
                        <section className="register-section">
                            <h2>가게 기본 정보</h2>
                            <p className="register-section-description">
                                가게 운영에 필요한 기본 정보를 입력해주세요.
                            </p>

                            <div className="form-group">
                                <label htmlFor="storeName">가게명</label>

                                <input
                                    id="storeName"
                                    type="text"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    placeholder="가게명을 입력해주세요."
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="storeCategory">카테고리</label>

                                <select
                                    id="storeCategory"
                                    value={storeCategory}
                                    onChange={(e) => setStoreCategory(e.target.value)}
                                >
                                    <option value="" disabled>
                                        카테고리를 선택해주세요.
                                    </option>
                                    <option value="베이커리">베이커리</option>
                                    <option value="카페">카페</option>
                                    <option value="분식">분식</option>
                                    <option value="일식">일식</option>
                                    <option value="치킨">치킨</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="storeAddress">주소</label>

                                <input
                                    id="storeAddress"
                                    type="text"
                                    value={storeAddress}
                                    onChange={(e) => setStoreAddress(e.target.value)}
                                    placeholder="가게 주소를 입력해주세요."
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="storeImageUrl">가게 이미지 URL</label>

                                <input
                                    id="storeImageUrl"
                                    type="url"
                                    value={storeImageUrl}
                                    onChange={(e) => setStoreImageUrl(e.target.value)}
                                    placeholder="https://example.com/store.jpg"
                                />

                                {storeImageUrl && (
                                    <div className="store-image-preview">
                                        <img
                                            src={storeImageUrl}
                                            alt="가게 이미지 미리보기"
                                        />
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="register-section">
                            <h2>영업 시간</h2>
                            <p className="register-section-description">
                                가게의 오픈 시간과 마감 시간을 설정해주세요.
                            </p>

                            <div className="time-row">
                                <div className="form-group">
                                    <label htmlFor="openTime">오픈 시간</label>

                                    <input
                                        id="openTime"
                                        type="time"
                                        value={openTime}
                                        onChange={(e) => setOpenTime(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="closeTime">마감 시간</label>

                                    <input
                                        id="closeTime"
                                        type="time"
                                        value={closeTime}
                                        onChange={(e) => setCloseTime(e.target.value)}
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="register-buttons">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => navigate('/mypage')}
                            >
                                취소
                            </button>

                            <button
                                type="button"
                                className="register-button"
                                onClick={handleStoreRegister}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? '등록 중...' : '등록하기'}
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default StoreRegisterPage;