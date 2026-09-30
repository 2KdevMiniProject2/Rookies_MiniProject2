package com.rookies6.MiniProject2.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecureDigestAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.function.Function;

/**
 * JWT 발급과 검증을 담당한다.
 *
 * 비밀 키는 소스에 두지 않고 application.properties 의 jwt.secret 에서 주입받는다.
 * ( 운영에서는 환경 변수 JWT_SECRET 으로 주입한다 )
 */
@Component
public class JwtService {

    private static final SecureDigestAlgorithm<SecretKey, SecretKey> ALGORITHM = Jwts.SIG.HS256;

    private final SecretKey key;
    private final long accessExpireSeconds;

    public JwtService(@Value("${jwt.secret}") String secret,
                      @Value("${jwt.access-expire-seconds}") long accessExpireSeconds) {
        // HS256 은 최소 256비트(32바이트) 이상의 키를 요구한다
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessExpireSeconds = accessExpireSeconds;
    }

    /** 토큰 만료 시간 ( 초 ). 로그인 응답에 함께 내려준다 */
    public long getAccessExpireSeconds() {
        return accessExpireSeconds;
    }

    public String generateToken(String userName) {
        Date expireDate = Date.from(Instant.now().plusSeconds(accessExpireSeconds));

        return Jwts.builder()
                .signWith(key, ALGORITHM)
                .subject(userName)
                .issuedAt(new Date())
                .expiration(expireDate)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * 토큰의 사용자와 만료 여부를 확인한다.
     * 서명이 올바르지 않거나 만료된 토큰이면 JwtException 이 발생한다.
     */
    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
}
