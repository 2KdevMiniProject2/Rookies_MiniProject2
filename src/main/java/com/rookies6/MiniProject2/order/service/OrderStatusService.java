package com.rookies6.MiniProject2.order.service;

import com.rookies6.MiniProject2.common.exception.BusinessException;
import com.rookies6.MiniProject2.common.exception.ErrorCode;
import com.rookies6.MiniProject2.menu.dto.OrderItemResponse;
import com.rookies6.MiniProject2.menu.entity.Order;
import com.rookies6.MiniProject2.menu.repository.OrderItemRepository;
import com.rookies6.MiniProject2.menu.repository.OrderRepository;
import com.rookies6.MiniProject2.order.dto.OwnerOrderResponse;
import com.rookies6.MiniProject2.user.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderStatusService {

    private final OrderRepository orderRepository;
    private final StoreRepository storeRepository;
    private final OrderItemRepository orderItemRepository;

    // [사장님] 가게 주문 목록 조회 (최신순)
    public Page<OwnerOrderResponse> getOwnerOrders(Long ownerId, Long storeId, Order.OrderStatus status, Pageable pageable) {
        if (!storeRepository.existsByIdAndOwnerIdAndDeletedAtIsNull(storeId, ownerId)) {
            throw new BusinessException(ErrorCode.STORE_NOT_FOUND, storeId);
        }

        Page<Order> orders = (status != null)
                ? orderRepository.findByStoreIdAndStatus(storeId, status, pageable)
                : orderRepository.findByStoreId(storeId, pageable);

        List<Long> orderIds = orders.getContent().stream().map(Order::getId).toList();
        Map<Long, List<OrderItemResponse>> itemsByOrderId = orderIds.isEmpty()
                ? Map.of()
                : orderItemRepository.findAllWithMenuItemByOrderIdIn(orderIds).stream()
                .collect(Collectors.groupingBy(
                        oi -> oi.getOrder().getId(),
                        Collectors.mapping(OrderItemResponse::from, Collectors.toList())));

        return orders.map(order -> OwnerOrderResponse.from(order, itemsByOrderId.getOrDefault(order.getId(), List.of())));
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