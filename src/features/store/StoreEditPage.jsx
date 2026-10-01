import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../api/client';
import Logo from '../../components/common/Logo';
import './StoreRegisterPage.css';

function StoreEditPage() {
    const navigate = useNavigate();
    const { storeId } = useParams();

    const ownerId = 7; // 임시 테스트용, 나중에 로그인 사용자 id로 변경

    const [storeName, setStoreName] = useState('');
    const [storeCategory, setStoreCategory] = useState('');
    const [storeAddress, setStoreAddress] = useState('');
    const [storeImageUrl, setStoreImageUrl] = useState('');
    const [openTime, setOpenTime] = useState('');
    const [closeTime, setCloseTime] = useState('');

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const response = await apiClient.get(`/api/stores/${storeId}`);
                const store = response.data;

                setStoreName(store.name || '');
                setStoreCategory(store.category || '');
                setStoreAddress(store.address || '');
                setStoreImageUrl(store.imageUrl || '');

                setOpenTime(
                    store.openTime
                        ? store.openTime.slice(0, 5)
                        : ''
                );

                setCloseTime(
                    store.closeTime
                        ? store.closeTime.slice(0, 5)
                        : ''
                );
            } catch (error) {
                console.error('가게 정보 조회 실패:', error);
                setError('가게 정보를 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchStore();
    }, [storeId]);

    const handleStoreUpdate = async () => {
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

            const response = await apiClient.put(
                `/api/stores/${storeId}`,
                {
                    name: storeName,
                    address: storeAddress,
                    category: storeCategory,
                    imageUrl: storeImageUrl.trim() || null,
                    openTime: openTime || null,
                    closeTime: closeTime || null,
                },
                {
                    params: {
                        ownerId: ownerId,
                    },
                }
            );

            console.log('가게 수정 성공:', response.data);

            alert('가게 정보가 수정되었습니다.');

            navigate('/owner/stores');
        } catch (error) {
            console.error('가게 수정 실패:', error);

            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('가게 수정에 실패했습니다.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="store-register-page">
            <div className="store-register-layout">
                <aside className="store-register-sidebar">
                    <Logo className="owner-sidebar-logo" />

                    <strong>사장님 마이페이지</strong>

                    <nav>
                        <button
                            type="button"
                            onClick={() => navigate('/mypage')}
                        >
                            마이페이지
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/stores/register')}
                        >
                            가게 등록
                        </button>

                        <button
                            type="button"
                            className="active"
                            onClick={() => navigate('/owner/stores')}
                        >
                            가게별 메뉴 관리
                        </button>

                        <button type="button" onClick={() => navigate('/mypage/profile')}>
                            회원정보
                        </button>

                        <button type="button">
                            로그아웃
                        </button>
                    </nav>
                </aside>

                <section className="store-register-main">
                    <div className="store-register-title">
                        가게 정보 수정
                    </div>

                    <div className="store-register-content">
                        {loading ? (
                            <section className="register-section">
                                가게 정보를 불러오는 중입니다.
                            </section>
                        ) : error ? (
                            <section className="register-section">
                                {error}
                            </section>
                        ) : (
                            <>
                                <section className="register-section">
                                    <h2>가게 기본 정보</h2>

                                    <p className="register-section-description">
                                        수정할 가게 정보를 입력해주세요.
                                    </p>

                                    <div className="form-group">
                                        <label htmlFor="storeName">
                                            가게명
                                        </label>

                                        <input
                                            id="storeName"
                                            type="text"
                                            value={storeName}
                                            onChange={(e) => setStoreName(e.target.value)}
                                            placeholder="가게명을 입력해주세요."
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="storeCategory">
                                            카테고리
                                        </label>

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
                                            <option value="편의점">편의점</option>
                                            <option value="기타">기타</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="storeAddress">
                                            주소
                                        </label>

                                        <input
                                            id="storeAddress"
                                            type="text"
                                            value={storeAddress}
                                            onChange={(e) => setStoreAddress(e.target.value)}
                                            placeholder="가게 주소를 입력해주세요."
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="storeImageUrl">
                                            가게 이미지 URL
                                        </label>

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
                                        가게의 오픈 시간과 마감 시간을 수정해주세요.
                                    </p>

                                    <div className="time-row">
                                        <div className="form-group">
                                            <label htmlFor="openTime">
                                                오픈 시간
                                            </label>

                                            <input
                                                id="openTime"
                                                type="time"
                                                value={openTime}
                                                onChange={(e) => setOpenTime(e.target.value)}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="closeTime">
                                                마감 시간
                                            </label>

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
                                        onClick={() => navigate('/owner/stores')}
                                    >
                                        취소
                                    </button>

                                    <button
                                        type="button"
                                        className="register-button"
                                        onClick={handleStoreUpdate}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? '수정 중...' : '수정하기'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

export default StoreEditPage;