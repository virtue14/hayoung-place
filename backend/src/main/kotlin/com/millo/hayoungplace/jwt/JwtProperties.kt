package com.millo.hayoungplace.jwt

import org.springframework.boot.context.properties.ConfigurationProperties

/**
 * JWT 관련 설정을 담당하는 프로퍼티 클래스
 */
@ConfigurationProperties(prefix = "jwt")
data class JwtProperties(
    /** JWT 토큰 서명에 사용할 비밀키 */
    val secret: String,

    /** 액세스 토큰의 만료 시간 (밀리초) */
    val accessTokenExpired: Long,

    /** 리프레시 토큰의 만료 시간 (밀리초) */
    val refreshTokenExpired: Long
)
