package com.rookies6.MiniProject2.order.service;

import com.rookies6.MiniProject2.common.exception.BusinessException;
import com.rookies6.MiniProject2.common.exception.ErrorCode;
import com.rookies6.MiniProject2.menu.dto.OrderItemResponse;
import com.rookies6.MiniProject2.menu.dto.OrderResponse;
import com.rookies6.MiniProject2.menu.entity.Order;
import com.rookies6.MiniProject2.menu.repository.OrderItemRepository;
import com.rookies6.MiniProject2.menu.repository.OrderRepository;
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
public class CustomerOrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public Page<OrderResponse> getMyOrders(Long customerId, Long callerId, Pageable pageable) {
        validateSelf(customerId, callerId);

        Page<Order> orders = orderRepository.findByCustomerId(customerId, pageable);
        List<Long> orderIds = orders.getContent().stream().map(Order::getId).toList();

        Map<Long, List<OrderItemResponse>> itemsByOrderId = orderIds.isEmpty()
                ? Map.of()
                : orderItemRepository.findAllWithMenuItemByOrderIdIn(orderIds).stream()
                .collect(Collectors.groupingBy(
                        oi -> oi.getOrder().getId(),
                        Collectors.mapping(OrderItemResponse::from, Collectors.toList())));

        return orders.map(order -> OrderResponse.from(order, itemsByOrderId.getOrDefault(order.getId(), List.of())));
    }

    public OrderResponse getMyOrder(Long customerId, Long callerId, Long orderId) {
        validateSelf(customerId, callerId);

        Order order = orderRepository.findByIdAndCustomerId(orderId, customerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND, orderId));
        return OrderResponse.from(order);
    }

    @Transactional
    public void cancelMyOrder(Long customerId, Long callerId, Long orderId) {
        validateSelf(customerId, callerId);

        Order order = orderRepository.findByIdAndCustomerId(orderId, customerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND, orderId));

        order.customerCancel();
    }

    private void validateSelf(Long customerId, Long callerId) {
        if (!customerId.equals(callerId)) {
            throw new BusinessException(ErrorCode.USER_ACCESS_DENIED, customerId);
        }
    }
}