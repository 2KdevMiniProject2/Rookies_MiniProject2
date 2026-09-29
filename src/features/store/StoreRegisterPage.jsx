import { useNavigate } from 'react-router-dom';
import './StoreRegisterPage.css';

function StoreRegisterPage() {
    const navigate = useNavigate();

    return (
        <main className="store-register-page">
            <div className="store-register-layout">

                {/* 왼쪽 메뉴 */}
                <aside className="store-register-sidebar">
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
                            className="active"
                        >
                            가게 등록
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/owner/stores')}
                        >
                            가게별 메뉴 관리
                        </button>

                        <button type="button">
                            회원정보
                        </button>

                        <button type="button">
                            로그아웃
                        </button>
                    </nav>
                </aside>

                {/* 오른쪽 내용 */}
                <section className="store-register-main">
                    <div className="store-register-title">
                        가게 등록
                    </div>

                    <div className="store-register-content">

                        {/* 가게 기본 정보 */}
                        <section className="register-section">
                            <h2>가게 기본 정보</h2>
                            <p className="register-section-description">
                                가게 운영에 필요한 기본 정보를 입력해주세요.
                            </p>

                            <div className="form-group">
                                <label htmlFor="storeName">
                                    가게명
                                </label>

                                <input
                                    id="storeName"
                                    type="text"
                                    placeholder="가게명을 입력해주세요."
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="storeCategory">
                                    카테고리
                                </label>

                                <select
                                    id="storeCategory"
                                    defaultValue=""
                                >
                                    <option value="" disabled>
                                        카테고리를 선택해주세요.
                                    </option>
                                    <option value="베이커리">베이커리</option>
                                    <option value="카페">카페</option>
                                    <option value="분식">분식</option>
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
                                    placeholder="가게 주소를 입력해주세요."
                                />
                            </div>
                        </section>

                        {/* 영업 시간 */}
                        <section className="register-section">
                            <h2>영업 시간</h2>
                            <p className="register-section-description">
                                가게의 오픈 시간과 마감 시간을 설정해주세요.
                            </p>

                            <div className="time-row">
                                <div className="form-group">
                                    <label htmlFor="openTime">
                                        오픈 시간
                                    </label>

                                    <input
                                        id="openTime"
                                        type="time"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="closeTime">
                                        마감 시간
                                    </label>

                                    <input
                                        id="closeTime"
                                        type="time"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 버튼 */}
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
                            >
                                등록하기
                            </button>
                        </div>

                    </div>
                </section>

            </div>
        </main>
    );
}

export default StoreRegisterPage;