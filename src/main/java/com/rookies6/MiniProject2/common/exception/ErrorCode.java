package com.rookies6.MiniProject2.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    INVALID_INPUT("잘못된 요청입니다: %s", HttpStatus.BAD_REQUEST),

    //로그인 관련 에러 코드
    DUPLICATE_EMAIL("이미 사용 중인 이메일입니다: %s", HttpStatus.CONFLICT),
    INVALID_CREDENTIALS("이메일 또는 비밀번호가 일치하지 않습니다.", HttpStatus.UNAUTHORIZED),

    // 유저 정보 관련 에러 코드
    STORE_NOT_FOUND("존재하지 않는 매장입니다. storeId=%s", HttpStatus.NOT_FOUND),
    CUSTOMER_NOT_FOUND("존재하지 않는 회원입니다. customerId=%s", HttpStatus.NOT_FOUND),

    // 메뉴 관련 에러 코드
    MENU_ITEM_NOT_FOUND("존재하지 않는 메뉴입니다. menuId=%s", HttpStatus.NOT_FOUND),
    MENU_SOLD_OUT("품절된 메뉴가 포함되어 있습니다: %s", HttpStatus.CONFLICT),

    // 주문 관련 에러 코드
    ORDER_ITEMS_EMPTY("주문 항목은 1개 이상이어야 합니다.", HttpStatus.BAD_REQUEST),
    ORDER_NOT_FOUND("존재하지 않는 주문입니다. orderId = %s", HttpStatus.NOT_FOUND),
    INVALID_ORDER_STATUS("주문 상태가 올바르지 않습니다. = %s", HttpStatus.CONFLICT),

    //동기화 관련 에러 코드
    INVALID_STORE_MENU_OR_NOT_FOUND("주문할 수 없는 메뉴가 포함되어 있습니다.( ex) 품절, 이벤트 시간 마감 등 )", HttpStatus.BAD_REQUEST);

    private final String messageTemplate;
    private final HttpStatus httpStatus;

    public String formatMessage(Object... args) {
        return String.format(messageTemplate, args);
    }
}