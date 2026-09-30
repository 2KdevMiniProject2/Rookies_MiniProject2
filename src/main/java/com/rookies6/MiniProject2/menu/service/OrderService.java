package com.rookies6.MiniProject2.menu.service;

import com.rookies6.MiniProject2.common.exception.BusinessException;
import com.rookies6.MiniProject2.common.exception.ErrorCode;
import com.rookies6.MiniProject2.menu.dto.OrderCreateRequest;
import com.rookies6.MiniProject2.menu.dto.OrderItemRequest;
import com.rookies6.MiniProject2.menu.dto.OrderItemResponse;
import com.rookies6.MiniProject2.menu.dto.OrderResponse;
import com.rookies6.MiniProject2.menu.entity.MenuItem;
import com.rookies6.MiniProject2.menu.entity.Order;
import com.rookies6.MiniProject2.menu.entity.OrderItem;
import com.rookies6.MiniProject2.menu.repository.MenuItemRepository;
import com.rookies6.MiniProject2.menu.repository.OrderItemRepository;
import com.rookies6.MiniProject2.menu.repository.OrderRepository;
import com.rookies6.MiniProject2.user.entity.Store;
import com.rookies6.MiniProject2.user.entity.User;
import com.rookies6.MiniProject2.user.repository.StoreRepository;
import com.rookies6.MiniProject2.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderResponse createOrder(Long customerId, OrderCreateRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, customerId));

        Store store = storeRepository.findByIdAndDeletedAtIsNull(request.getStoreId())
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND, request.getStoreId()));

        Set<Long> uniqueMenuItemIds = request.getItems().stream()
                .map(OrderItemRequest::getMenuItemId)
                .collect(Collectors.toSet());

        Map<Long, MenuItem> menuItemMap = menuItemRepository.findAllByIdAndStoreId(uniqueMenuItemIds, store.getId()).stream()
                .collect(Collectors.toMap(MenuItem::getId, menuItem -> menuItem));

        if (menuItemMap.size() != uniqueMenuItemIds.size()) {
            throw new BusinessException(ErrorCode.INVALID_STORE_MENU_OR_NOT_FOUND);
        }

        Order order = Order.builder()
                .customer(customer)
                .store(store)
                .pickupTime(request.getPickupTime())
                .requestNotes(request.getRequestNotes())
                .build();

        for (OrderItemRequest itemRequest : request.getItems()) {
            MenuItem menuItem = menuItemMap.get(itemRequest.getMenuItemId());

            if (menuItem.isSoldOut()) {
                throw new BusinessException(ErrorCode.MENU_SOLD_OUT, menuItem.getName());
            }

            OrderItem orderItem = OrderItem.builder()
                    .menuItem(menuItem)
                    .quantity(itemRequest.getQuantity())
                    .orderPrice(menuItem.getPrice())
                    .build();

            order.addOrderItem(orderItem);
        }

        Order savedOrder = orderRepository.save(order);
        return OrderResponse.from(savedOrder);
    }

    public Page<OrderResponse> getOrdersByStore(Long storeId, Order.OrderStatus status, Pageable pageable) {
        storeRepository.findByIdAndDeletedAtIsNull(storeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND, storeId));

        Page<Order> orders = (status != null)
                ? orderRepository.findByStoreIdAndStatus(storeId, status, pageable)
                : orderRepository.findByStoreId(storeId, pageable);

        Map<Long, List<OrderItemResponse>> itemsByOrderId = groupItemsByOrderId(orders.getContent());

        return orders.map(order -> OrderResponse.from(order, itemsByOrderId.getOrDefault(order.getId(), List.of())));
    }

    private Map<Long, List<OrderItemResponse>> groupItemsByOrderId(List<Order> orders) {
        List<Long> orderIds = orders.stream().map(Order::getId).toList();
        if (orderIds.isEmpty()) {
            return Map.of();
        }
        return orderItemRepository.findAllWithMenuItemByOrderIdIn(orderIds).stream()
                .collect(Collectors.groupingBy(
                        oi -> oi.getOrder().getId(),
                        Collectors.mapping(OrderItemResponse::from, Collectors.toList())));
    }
}