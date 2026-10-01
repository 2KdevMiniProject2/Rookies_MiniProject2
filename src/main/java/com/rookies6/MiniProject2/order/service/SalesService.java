package com.rookies6.MiniProject2.order.service;

import com.rookies6.MiniProject2.common.exception.BusinessException;
import com.rookies6.MiniProject2.common.exception.ErrorCode;
import com.rookies6.MiniProject2.menu.entity.Order;
import com.rookies6.MiniProject2.menu.repository.OrderRepository;
import com.rookies6.MiniProject2.order.dto.SalesSummaryResponse;
import com.rookies6.MiniProject2.user.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalesService {

    private final OrderRepository orderRepository;
    private final StoreRepository storeRepository;

    // [사장님] 오늘 매출 조회 (픽업 완료된 주문만 집계)
    public SalesSummaryResponse getTodaySales(Long ownerId, Long storeId) {
        // 이 사장님 소유의 영업 중인 가게인지 확인. 없는 가게이거나 남의 가게면 404
        if (!storeRepository.existsByIdAndOwnerIdAndDeletedAtIsNull(storeId, ownerId)) {
            throw new BusinessException(ErrorCode.STORE_NOT_FOUND, storeId);
        }

        // 오늘 0시 이상, 내일 0시 미만
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = start.plusDays(1);

        Long totalSales = orderRepository.sumTotalAmountByStoreAndPeriod(
                storeId, Order.OrderStatus.COMPLETED, start, end);
        Long orderCount = orderRepository.countByStoreAndPeriod(
                storeId, Order.OrderStatus.COMPLETED, start, end);

        return SalesSummaryResponse.of(totalSales, orderCount);
    }
}