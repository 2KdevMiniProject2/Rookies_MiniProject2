package com.rookies6.MiniProject2.order.service;

import com.rookies6.MiniProject2.common.exception.BusinessException;
import com.rookies6.MiniProject2.common.exception.ErrorCode;
import com.rookies6.MiniProject2.menu.entity.Order;
import com.rookies6.MiniProject2.menu.repository.OrderRepository;
import com.rookies6.MiniProject2.order.dto.OwnerOrderResponse;
import com.rookies6.MiniProject2.user.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderStatusService {

    // 진행 중 상태: 날짜 상관없이 대시보드에 계속 표시
    private static final List<Order.OrderStatus> ACTIVE_STATUSES = List.of(
            Order.OrderStatus.PENDING,
            Order.OrderStatus.ACCEPTED,
            Order.OrderStatus.READY
    );

    private final OrderRepository orderRepository;
    private final StoreRepository storeRepository;

    // [사장님] 대시보드 주문 목록 조회
    // 진행 중 주문은 전부, 끝난 주문(완료·거절·취소)은 오늘 들어온 것만
    public List<OwnerOrderResponse> getOwnerOrders(Long ownerId, Long storeId) {
        // 이 사장님 소유의 영업 중인 가게인지 확인. 없는 가게이거나 남의 가게면 404
        if (!storeRepository.existsByIdAndOwnerIdAndDeletedAtIsNull(storeId, ownerId)) {
            throw new BusinessException(ErrorCode.STORE_NOT_FOUND, storeId);
        }

        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = start.plusDays(1);

        return orderRepository.findDashboardOrdersByStoreId(storeId, ACTIVE_STATUSES, start, end).stream()
                .map(OwnerOrderResponse::from)
                .toList();
    }

    // [사장님] 주문 상태 변경
    @Transactional
    public void updateStatus(Long ownerId, Long orderId, Order.OrderStatus status) {
        if (status == null) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "변경할 상태(status)를 입력해주세요");
        }

        // 이 사장님 가게의 주문일 때만 조회됨. 없는 주문이거나 남의 가게 주문이면 404
        Order order = orderRepository.findByIdAndStoreOwnerId(orderId, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND, orderId));

        // 요청한 상태에 맞는 메서드 호출. 순서 검증은 Order 엔티티 안에서 함 (틀리면 409)
        switch (status) {
            case ACCEPTED -> order.accept();
            case REJECTED -> order.reject();
            case READY -> order.ready();
            case COMPLETED -> order.complete();
            default -> throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS,
                    status + "(으)로는 변경할 수 없습니다");
        }
    }
}