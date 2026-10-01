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
    INVALID_SIGNUP_ROLE("가입 시 선택할 수 없는 권한입니다: %s", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS("이메일 또는 비밀번호가 일치하지 않습니다.", HttpStatus.UNAUTHORIZED),

    // 유저 정보 관련 에러 코드
    STORE_NOT_FOUND("존재하지 않는 매장입니다. storeId=%s", HttpStatus.NOT_FOUND),
    USER_NOT_FOUND("존재하지 않는 회원입니다. userId=%s", HttpStatus.NOT_FOUND),
    USER_ACCESS_DENIED("본인 계정만 조회·수정·삭제할 수 있습니다. userId=%s", HttpStatus.FORBIDDEN),

    // 메뉴 관련 에러 코드
    MENU_ITEM_NOT_FOUND("존재하지 않는 메뉴입니다. menuId=%s", HttpStatus.NOT_FOUND),
    MENU_SOLD_OUT("품절된 메뉴가 포함되어 있습니다: %s", HttpStatus.CONFLICT),
    DUPLICATE_MENU_NAME("이미 등록된 메뉴 이름입니다: %s", HttpStatus.CONFLICT),

    // 주문 관련 에러 코드
    ORDER_ITEMS_EMPTY("주문 항목은 1개 이상이어야 합니다.", HttpStatus.BAD_REQUEST),
    ORDER_NOT_FOUND("존재하지 않는 주문입니다. orderId = %s", HttpStatus.NOT_FOUND),
    INVALID_ORDER_STATUS("올바르지 않은 주문 변경입니다. = %s", HttpStatus.CONFLICT),

    //동기화 관련 에러 코드
    INVALID_STORE_MENU_OR_NOT_FOUND("주문할 수 없는 메뉴가 포함되어 있습니다.( ex) 품절, 이벤트 시간 마감 등 )", HttpStatus.BAD_REQUEST),

    // 매장 권한 관련 에러 코드
    STORE_ACCESS_DENIED("본인 소유의 매장만 삭제할 수 있습니다. storeId=%s", HttpStatus.FORBIDDEN),

    // 이미지 업로드 관련 에러 코드
    INVALID_IMAGE_FILE("이미지 파일만 업로드할 수 있습니다.", HttpStatus.BAD_REQUEST),
    IMAGE_UPLOAD_FAILED("이미지 업로드에 실패했습니다: %s", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String messageTemplate;
    private final HttpStatus httpStatus;

    public String formatMessage(Object... args) {
        return String.format(messageTemplate, args);
    }
}