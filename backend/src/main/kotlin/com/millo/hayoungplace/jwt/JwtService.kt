package com.millo.hayoungplace.jwt

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import io.jsonwebtoken.security.Keys
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Service
import java.util.*
import javax.crypto.SecretKey

/**
 * JWT 토큰 생성 및 검증을 담당하는 서비스
 */
@Service
class JwtService(
    private val jwtProperties: JwtProperties
) {
    private val secretKey: SecretKey = Keys.hmacShaKeyFor(jwtProperties.secret.toByteArray())

    /**
     * 액세스 토큰을 생성합니다.
     */
    fun generateAccessToken(userDetails: UserDetails): String =
        generateToken(userDetails, jwtProperties.accessTokenExpired)

    /**
     * 리프레시 토큰을 생성합니다.
     */
    fun generateRefreshToken(userDetails: UserDetails): String =
        generateToken(userDetails, jwtProperties.refreshTokenExpired)

    /**
     * 토큰에서 사용자 이메일을 추출합니다.
     */
    fun extractEmail(token: String): String? =
        extractClaim(token) { it.subject }

    /**
     * 토큰이 만료되었는지 확인합니다.
     */
    fun isTokenExpired(token: String): Boolean =
        extractExpiration(token)?.before(Date()) ?: true

    /**
     * 토큰의 만료 시간을 추출합니다.
     */
    private fun extractExpiration(token: String): Date? =
        extractClaim(token) { it.expiration }

    /**
     * 토큰에서 클레임을 추출합니다.
     */
    private fun <T> extractClaim(token: String, claimsResolver: (Claims) -> T): T? =
        runCatching {
            val claims = extractAllClaims(token)
            claimsResolver(claims)
        }.getOrNull()

    /**
     * 토큰에서 모든 클레임을 추출합니다.
     */
    private fun extractAllClaims(token: String): Claims =
        Jwts.parserBuilder()
            .setSigningKey(secretKey)
            .build()
            .parseClaimsJws(token)
            .body

    /**
     * JWT 토큰을 생성합니다.
     */
    private fun generateToken(userDetails: UserDetails, expiration: Long): String =
        Jwts.builder()
            .setSubject(userDetails.username)
            .setIssuedAt(Date())
            .setExpiration(Date(System.currentTimeMillis() + expiration))
            .signWith(secretKey, SignatureAlgorithm.HS256)
            .compact()
}
