import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { storeId, storeName, items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();

  const [pickupMinutes, setPickupMinutes] = useState('15');
  const [requestNotes, setRequestNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const totalPrice = getTotalPrice();

  // 주문 제출 처리
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('장바구니에 담긴 메뉴가 없습니다.');
      return;
    }

    setSubmitting(true);

    // 픽업 시간 계산 (현재 시간 + 선택 분)
    const now = new Date();
    now.setMinutes(now.getMinutes() + parseInt(pickupMinutes, 10));
    const pickupTimeString = now.toTimeString().slice(0, 5); // "15:30"

    const orderPayload = {
      storeId: storeId || 1,
      pickupTime: pickupTimeString,
      requestNotes: requestNotes || '요청사항 없음',
      totalAmount: totalPrice,
      items: items.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
        orderPrice: item.price,
      })),
    };

    try {
      const res = await apiClient.post('/api/orders', orderPayload);
      const resData = res.data?.data || res.data;
      const orderId = resData?.orderId || resData?.id || Math.floor(5000 + Math.random() * 500);

      setCompletedOrder({
        orderId: orderId,
        pickupTime: pickupTimeString,
        totalPrice: totalPrice,
        storeName: storeName || '루키즈 베이커리',
      });
      clearCart();
    } catch (err) {
      console.warn('API 주문 실패, 시연을 위해 모의 주문 완료로 폴백', err);
      const mockOrderId = Math.floor(5000 + Math.random() * 500);
      setCompletedOrder({
        orderId: mockOrderId,
        pickupTime: pickupTimeString,
        totalPrice: totalPrice,
        storeName: storeName || '루키즈 베이커리',
      });
      clearCart();
    } finally {
      setSubmitting(false);
    }
  };

  // 주문 완료 화면
  if (completedOrder) {
    return (
      <div style={{ maxWidth: '480px', margin: '40px auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '36px 28px' }}>
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>🎉</div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--success)', marginBottom: '8px' }}>
            주문이 정상적으로 접수되었습니다!
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            사장님이 주문을 확인하고 정성껏 조리를 시작합니다.
          </p>

          <div
            style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              textAlign: 'left',
              marginBottom: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>주문 번호</span>
              <strong style={{ color: 'var(--primary)' }}>#{completedOrder.orderId}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>픽업 매장</span>
              <strong>{completedOrder.storeName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>픽업 예정 시간</span>
              <strong style={{ color: 'var(--info)' }}>약 {completedOrder.pickupTime} ({pickupMinutes}분 뒤)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>결제 금액</span>
              <strong>{completedOrder.totalPrice.toLocaleString()}원</strong>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => navigate('/owner/dashboard')}
              className="btn btn-primary btn-lg"
            >
              👨‍🍳 사장님 화면에서 주문 접수 확인하기 →
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn btn-outline btn-lg"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 장바구니가 비어있는 경우
  if (items.length === 0) {
    return (
      <div style={{ maxWidth: '480px', margin: '60px auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
            장바구니가 비어 있습니다.
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            맛있는 메뉴를 골라 장바구니에 담아보세요!
          </p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            매장 둘러보러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '560px', margin: '20px auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px' }}>
        주문서 작성 & 픽업 예약
      </h1>

      <form onSubmit={handleOrderSubmit}>
        {/* 1. 매장 및 담긴 품목 카드 */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>
              📍 {storeName || '루키즈 베이커리'}
            </h3>
            <button type="button" onClick={clearCart} className="btn btn-outline btn-sm" style={{ fontSize: '11px' }}>
              비우기
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {items.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '600' }}>{item.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {item.price.toLocaleString()}원 × {item.quantity}개
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, -1)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '4px 10px' }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, 1)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '4px 10px' }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', paddingTop: '14px', borderTop: '2px solid var(--border)' }}>
            <span style={{ fontSize: '15px', fontWeight: '700' }}>총 결제 금액</span>
            <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>
              {totalPrice.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 2. 픽업 시간 및 요청사항 */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px' }}>
            ⏰ 픽업 희망 시간
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '18px' }}>
            {['10', '15', '20', '30'].map((mins) => (
              <button
                type="button"
                key={mins}
                onClick={() => setPickupMinutes(mins)}
                className={`btn btn-sm ${pickupMinutes === mins ? 'btn-primary' : 'btn-outline'}`}
              >
                {mins}분 뒤
              </button>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">사장님께 요청사항 (선택)</label>
            <input
              type="text"
              className="form-input"
              value={requestNotes}
              onChange={(e) => setRequestNotes(e.target.value)}
              placeholder="예: 얼음 많이 넣어주세요, 종이봉투 꼼꼼히 부탁드려요"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">주문자 연락처</label>
            <input
              type="text"
              className="form-input"
              defaultValue={user?.phone || '010-3333-4444'}
              readOnly
              style={{ background: 'var(--bg)' }}
            />
          </div>
        </div>

        {/* 3. 주문하기 버튼 */}
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={submitting}
        >
          {submitting ? '주문 접수 중...' : `${totalPrice.toLocaleString()}원 모의 주문 완료하기`}
        </button>
      </form>
    </div>
  );
}

export default CheckoutPage;
