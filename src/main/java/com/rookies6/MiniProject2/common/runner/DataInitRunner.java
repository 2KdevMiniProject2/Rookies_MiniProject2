package com.rookies6.MiniProject2.common.runner;

import com.rookies6.MiniProject2.menu.repository.StoreDetailRepository;
import com.rookies6.MiniProject2.menu.repository.StoreRepository;
import com.rookies6.MiniProject2.menu.repository.UserRepository;
import com.rookies6.MiniProject2.user.entity.Store;
import com.rookies6.MiniProject2.user.entity.StoreDetail;
import com.rookies6.MiniProject2.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final StoreDetailRepository storeDetailRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 이미 유저 데이터가 존재하면 중복 주입 방지를 위해 건너뜁니다.
        if (userRepository.count() > 0) {
            log.info("초기 더미 데이터가 이미 존재하므로 생성을 건너뜁니다.");
            return;
        }

        log.info(">>>>> [초기 더미 데이터 자동 생성 시작] <<<<<");

        // 1. 사장님(OWNER) 계정 생성
        User owner = User.builder()
                .email("owner@rookie.com")
                .password(passwordEncoder.encode("1234"))
                .name("루키즈사장님")
                .phone("010-1111-2222")
                .role(User.Role.OWNER)
                .build();
        userRepository.save(owner);

        // 2. 일반 손님(USER) 계정 생성
        User customer = User.builder()
                .email("user@rookie.com")
                .password(passwordEncoder.encode("1234"))
                .name("김손님")
                .phone("010-3333-4444")
                .role(User.Role.USER)
                .build();
        userRepository.save(customer);

        // 3. 1번 매장 (루키즈 베이커리) 생성 - 파트 B, C의 주문/메뉴 테스트 지원용
        Store bakeryStore = Store.builder()
                .owner(owner)
                .name("루키즈 베이커리")
                .address("서울시 강남구 테헤란로 123")
                .category("베이커리")
                .build();
        storeRepository.save(bakeryStore);

        // 4. 1번 매장 영업시간(StoreDetail) 생성 (1:1 연관관계)
        StoreDetail storeDetail = StoreDetail.builder()
                .store(bakeryStore)
                .openTime(LocalTime.of(8, 30))
                .closeTime(LocalTime.of(21, 0))
                .build();
        storeDetailRepository.save(storeDetail);
        bakeryStore.setStoreDetail(storeDetail);

        log.info(">>>>> [초기 더미 데이터 생성 완료!] <<<<<");
        log.info("1) 사장님 계정: owner@rookie.com / 1234");
        log.info("2) 손님 계정: user@rookie.com / 1234");
        log.info("3) 기본 1번 매장: 루키즈 베이커리 (ID: {})", bakeryStore.getId());
    }
}
