import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import Logo from '../../components/common/Logo';
import './OwnerStoreListPage.css';

const PAGE_SIZE = 10;

function OwnerStoreListPage() {
    const navigate = useNavigate();

    const authUser = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const ownerId = authUser?.id;

    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        if (!ownerId) {
            setLoading(false);
            return;
        }

        const fetchStores = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await apiClient.get(
                    `/api/stores/owner/${ownerId}`,
                    {
                        params: {
                            page: page,
                            size: PAGE_SIZE,
                        },
                    }
                );

                if (Array.isArray(response.data)) {
                    const allStores = response.data;

                    const startIndex = page * PAGE_SIZE;
                    const endIndex = startIndex + PAGE_SIZE;

                    const pagedStores = allStores.slice(
                        startIndex,
                        endIndex
                    );

                    setStores(pagedStores);

                    setTotalPages(
                        Math.max(
                            Math.ceil(
                                allStores.length / PAGE_SIZE
                            ),
                            1
                        )
                    );

                    setTotalElements(allStores.length);
                } else {
                    const storeList =
                        response.data.content || [];

                    setStores(storeList);

                    setTotalPages(
                        Math.max(
                            response.data.totalPages || 1,
                            1
                        )
                    );

                    setTotalElements(
                        response.data.totalElements ??
                            storeList.length
                    );
                }
            } catch (error) {
                console.error(
                    '가게 목록 조회 실패:',
                    error
                );

                setError(
                    '가게 목록을 불러오지 못했습니다.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchStores();
    }, [ownerId, page]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    const handleLogoKeyDown = (event) => {
        if (
            event.key === 'Enter' ||
            event.key === ' '
        ) {
            event.preventDefault();
            navigate('/');
        }
    };

    const handleDeleteStore = async (
        storeId,
        storeName
    ) => {
        const confirmed = window.confirm(
            `${storeName} 가게를 삭제하시겠습니까?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await apiClient.delete(
                `/api/stores/${storeId}`,
                {
                    params: {
                        ownerId: ownerId,
                    },
                }
            );

            if (
                stores.length === 1 &&
                page > 0
            ) {
                setPage((prev) => prev - 1);
            } else {
                setStores((prev) =>
                    prev.filter(
                        (store) =>
                            store.id !== storeId
                    )
                );
            }

            const nextTotalElements =
                Math.max(
                    totalElements - 1,
                    0
                );

            setTotalElements(
                nextTotalElements
            );

            setTotalPages(
                Math.max(
                    Math.ceil(
                        nextTotalElements /
                            PAGE_SIZE
                    ),
                    1
                )
            );

            alert(
                '가게가 삭제되었습니다.'
            );
        } catch (error) {
            console.error(
                '가게 삭제 실패:',
                error
            );

            if (
                error.response?.data?.message
            ) {
                alert(
                    error.response.data
                        .message
                );
            } else {
                alert(
                    '가게 삭제에 실패했습니다.'
                );
            }
        }
    };

    return (
        <main className="owner-store-list-page">
            <div className="owner-store-list-layout">
                <aside className="owner-store-list-sidebar">
                    <div
                        role="button"
                        tabIndex={0}
                        aria-label="메인 화면으로 이동"
                        onClick={
                            handleLogoClick
                        }
                        onKeyDown={
                            handleLogoKeyDown
                        }
                        style={{
                            cursor: 'pointer',
                        }}
                    >
                        <Logo className="owner-sidebar-logo" />
                    </div>

                    <strong>
                        사장님 마이페이지
                    </strong>

                    <nav>
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    '/mypage'
                                )
                            }
                        >
                            마이페이지
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    '/mypage#owner-dashboard-section'
                                )
                            }
                        >
                            주문 대시보드
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    '/stores/register'
                                )
                            }
                        >
                            가게 등록
                        </button>

                        <button
                            type="button"
                            className="active"
                        >
                            가게별 메뉴 관리
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    '/mypage/profile'
                                )
                            }
                        >
                            회원정보
                        </button>

                        <button
                            type="button"
                            onClick={
                                handleLogout
                            }
                        >
                            로그아웃
                        </button>
                    </nav>
                </aside>

                <section className="owner-store-list-main">
                    <div className="owner-store-list-title">
                        가게별 메뉴 관리
                    </div>

                    <div className="owner-store-list-content">
                        <section className="owner-store-list-section">
                            <div className="owner-store-list-heading">
                                <div>
                                    <h2>
                                        내 가게
                                    </h2>

                                    <p>
                                        관리할 가게를 선택해주세요.
                                        {totalElements >
                                            0 &&
                                            ` 총 ${totalElements}개`}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="owner-store-add-button"
                                    onClick={() =>
                                        navigate(
                                            '/stores/register'
                                        )
                                    }
                                >
                                    가게 등록
                                </button>
                            </div>

                            {loading ? (
                                <div className="owner-empty-store">
                                    가게 목록을 불러오는
                                    중입니다.
                                </div>
                            ) : error ? (
                                <div className="owner-empty-store">
                                    {error}
                                </div>
                            ) : stores.length ===
                              0 ? (
                                <div className="owner-empty-store">
                                    등록된 가게가
                                    없습니다.
                                </div>
                            ) : (
                                <div className="owner-store-card-list">
                                    {stores.map(
                                        (
                                            store
                                        ) => (
                                            <article
                                                className="owner-store-card"
                                                key={
                                                    store.id
                                                }
                                            >
                                                {store.imageUrl && (
                                                    <div className="owner-store-card-image-wrap">
                                                        <img
                                                            src={
                                                                store.imageUrl
                                                            }
                                                            alt={`${store.name} 가게 이미지`}
                                                            className="owner-store-card-image"
                                                        />
                                                    </div>
                                                )}

                                                <div className="owner-store-card-info">
                                                    <span className="owner-store-category">
                                                        {
                                                            store.category
                                                        }
                                                    </span>

                                                    <h3>
                                                        {
                                                            store.name
                                                        }
                                                    </h3>

                                                    <p>
                                                        {
                                                            store.address
                                                        }
                                                    </p>

                                                    {(store.openTime ||
                                                        store.closeTime) && (
                                                        <p className="owner-store-time">
                                                            영업시간{' '}
                                                            {store.openTime ||
                                                                '-'}{' '}
                                                            ~{' '}
                                                            {store.closeTime ||
                                                                '-'}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="owner-store-card-actions">
                                                    <button
                                                        type="button"
                                                        className="owner-store-menu-button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/owner/stores/${store.id}/orders`
                                                            )
                                                        }
                                                    >
                                                        주문
                                                        대시보드
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="owner-store-menu-button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/owner/stores/${store.id}/menus`
                                                            )
                                                        }
                                                    >
                                                        메뉴
                                                        관리
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="owner-store-menu-button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/owner/stores/${store.id}/edit`
                                                            )
                                                        }
                                                    >
                                                        가게
                                                        수정
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="owner-store-delete-button"
                                                        onClick={() =>
                                                            handleDeleteStore(
                                                                store.id,
                                                                store.name
                                                            )
                                                        }
                                                    >
                                                        가게
                                                        삭제
                                                    </button>
                                                </div>
                                            </article>
                                        )
                                    )}
                                </div>
                            )}

                            {!loading &&
                                !error &&
                                totalPages >
                                    1 && (
                                    <div className="owner-store-pagination">
                                        <button
                                            type="button"
                                            className="owner-store-page-button"
                                            disabled={
                                                page ===
                                                0
                                            }
                                            onClick={() =>
                                                setPage(
                                                    (
                                                        prev
                                                    ) =>
                                                        prev -
                                                        1
                                                )
                                            }
                                        >
                                            이전
                                        </button>

                                        {Array.from(
                                            {
                                                length: totalPages,
                                            },
                                            (
                                                _,
                                                index
                                            ) => (
                                                <button
                                                    type="button"
                                                    key={
                                                        index
                                                    }
                                                    className={`owner-store-page-button ${
                                                        page ===
                                                        index
                                                            ? 'active'
                                                            : ''
                                                    }`}
                                                    onClick={() =>
                                                        setPage(
                                                            index
                                                        )
                                                    }
                                                >
                                                    {index +
                                                        1}
                                                </button>
                                            )
                                        )}

                                        <button
                                            type="button"
                                            className="owner-store-page-button"
                                            disabled={
                                                page >=
                                                totalPages -
                                                    1
                                            }
                                            onClick={() =>
                                                setPage(
                                                    (
                                                        prev
                                                    ) =>
                                                        prev +
                                                        1
                                                )
                                            }
                                        >
                                            다음
                                        </button>
                                    </div>
                                )}
                        </section>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default OwnerStoreListPage;