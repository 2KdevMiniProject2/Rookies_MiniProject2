import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import Logo from '../../components/common/Logo';
import './UserInfoPage.css';

function UserInfoPage() {
    const navigate = useNavigate();

    const authUser = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);

    const userId = authUser?.id;

    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userId) {
            setError('로그인 사용자 정보가 없습니다.');
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await apiClient.get(`/api/users/${userId}`);

                setUser(response.data);
                setName(response.data.name || '');
                setPhone(response.data.phone || '');
            } catch (error) {
                console.error('회원정보 조회 실패:', error);
                setError('회원정보를 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    const handleUpdate = async () => {
        if (!name.trim()) {
            alert('이름을 입력해주세요.');
            return;
        }

        if (!phone.trim()) {
            alert('전화번호를 입력해주세요.');
            return;
        }

        const phonePattern = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/;

        if (!phonePattern.test(phone)) {
            alert('전화번호는 010-1234-5678 형식으로 입력해주세요.');
            return;
        }

        if (newPassword && newPassword.length < 4) {
            alert('비밀번호는 4자리 이상 입력해주세요.');
            return;
        }

        if (newPassword !== passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            setIsSubmitting(true);

            const requestData = {
                name: name.trim(),
                phone: phone.trim(),
            };

            if (newPassword.trim()) {
                requestData.password = newPassword;
            }

            const response = await apiClient.patch(
                `/api/users/${userId}`,
                requestData
            );

            setUser(response.data);

            // 로그인 정보가 이미 연결되어 있으면 전역 사용자 정보도 갱신
            if (authUser) {
                login(response.data, token);
            }

            setNewPassword('');
            setPasswordConfirm('');

            alert('회원정보가 수정되었습니다.');
        } catch (error) {
            console.error('회원정보 수정 실패:', error);

            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('회원정보 수정에 실패했습니다.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async () => {
        const confirmed = window.confirm(
            '정말 회원탈퇴를 하시겠습니까?'
        );

        if (!confirmed) {
            return;
        }

        try {
            await apiClient.delete(`/api/users/${userId}`);

            logout();

            alert('회원탈퇴가 완료되었습니다.');

            navigate('/login');
        } catch (error) {
            console.error('회원탈퇴 실패:', error);

            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('회원탈퇴에 실패했습니다.');
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <main className="user-info-page">
                <p>회원정보를 불러오는 중입니다.</p>
            </main>
        );
    }

    if (error || !user) {
        return (
            <main className="user-info-page">
                <p>{error || '회원정보가 없습니다.'}</p>
            </main>
        );
    }

    return (
        <main className="user-info-page">
            <div className="user-info-layout">
                <aside className="user-info-sidebar">
                    <div
                        role="button"
                        tabIndex={0}
                        aria-label="메인 화면으로 이동"
                        onClick={() => navigate('/')}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                navigate('/');
                            }
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        <Logo className="owner-sidebar-logo" />
                    </div>

                    <strong>
                        {user.role === 'OWNER'
                            ? '사장님 마이페이지'
                            : '마이페이지'}
                    </strong>

                    <nav>
                        <button
                            type="button"
                            onClick={() => navigate('/mypage')}
                        >
                            마이페이지
                        </button>

                        {user.role === 'OWNER' && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => navigate('/mypage#owner-dashboard-section')}
                                >
                                    주문 대시보드
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/stores/register')}
                                >
                                    가게 등록
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/owner/stores')}
                                >
                                    가게별 메뉴 관리
                                </button>
                            </>
                        )}

                        <button
                            type="button"
                            className="active"
                        >
                            회원정보
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                        >
                            로그아웃
                        </button>
                    </nav>
                </aside>

                <section className="user-info-main">
                    <div className="user-info-title">
                        회원정보
                    </div>

                    <div className="user-info-content">
                        <section className="user-info-section">
                            <h2>기본 정보</h2>

                            <p className="user-info-description">
                                회원정보를 확인하고 수정할 수 있습니다.
                            </p>

                            <div className="user-info-form-group">
                                <label htmlFor="email">
                                    이메일
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={user.email}
                                    disabled
                                />

                                <span className="input-guide">
                                    이메일은 변경할 수 없습니다.
                                </span>
                            </div>

                            <div className="user-info-form-group">
                                <label htmlFor="role">
                                    회원 유형
                                </label>

                                <input
                                    id="role"
                                    type="text"
                                    value={user.role}
                                    disabled
                                />
                            </div>

                            <div className="user-info-form-group">
                                <label htmlFor="name">
                                    이름
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="이름을 입력해주세요."
                                />
                            </div>

                            <div className="user-info-form-group">
                                <label htmlFor="phone">
                                    전화번호
                                </label>

                                <input
                                    id="phone"
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="010-1234-5678"
                                />
                            </div>
                        </section>

                        <section className="user-info-section">
                            <h2>비밀번호 변경</h2>

                            <p className="user-info-description">
                                비밀번호를 변경하지 않으려면 비워두세요.
                            </p>

                            <div className="user-info-form-group">
                                <label htmlFor="newPassword">
                                    새 비밀번호
                                </label>

                                <input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="4자리 이상 입력해주세요."
                                />
                            </div>

                            <div className="user-info-form-group">
                                <label htmlFor="passwordConfirm">
                                    새 비밀번호 확인
                                </label>

                                <input
                                    id="passwordConfirm"
                                    type="password"
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                    placeholder="비밀번호를 다시 입력해주세요."
                                />
                            </div>

                            <div className="user-info-buttons">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => navigate('/mypage')}
                                >
                                    취소
                                </button>

                                <button
                                    type="button"
                                    className="save-button"
                                    onClick={handleUpdate}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? '저장 중...'
                                        : '수정하기'}
                                </button>
                            </div>
                        </section>

                        <section className="withdraw-section">
                            <div>
                                <h2>회원 탈퇴</h2>
                                <p>
                                    탈퇴하면 현재 계정을 더 이상 사용할 수 없습니다.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="withdraw-button"
                                onClick={handleDeleteUser}
                            >
                                회원 탈퇴
                            </button>
                        </section>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default UserInfoPage;