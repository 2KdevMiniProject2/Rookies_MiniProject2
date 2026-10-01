package com.rookies6.MiniProject2.security.annotation;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 로그인한 사용자의 User 엔티티를 컨트롤러 파라미터로 주입받는 커스텀 애노테이션. (교재 Step 13)
 *
 * @AuthenticationPrincipal(expression = "#this == 'anonymousUser' ? null : userInfo") 를 감싼 것이며,
 * 컨트롤러 파라미터에 @CurrentUser User user 형태로 선언하면 현재 로그인한 사용자 객체를 바로 전달받습니다.
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@AuthenticationPrincipal(expression = "#this == 'anonymousUser' ? null : userInfo")
public @interface CurrentUser {
}
