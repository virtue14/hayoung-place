package com.millo.hayoungplace.auth.handler

import com.millo.hayoungplace.jwt.JwtService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder

/**
 * OAuth2 인증 성공 시 처리를 담당하는 핸들러
 * 인증 성공 후 JWT 토큰을 생성하여 프론트엔드로 리다이렉트합니다.
 */
@Component
class OAuth2SuccessHandler(
    private val jwtService: JwtService,
    @Value("\${app.frontend-url}") private val frontendUrl: String
) : SimpleUrlAuthenticationSuccessHandler() {

    /**
     * OAuth2 인증 성공 시 호출되는 메서드
     * JWT 토큰을 생성하고 프론트엔드로 리다이렉트합니다.
     * @param request HTTP 요청
     * @param response HTTP 응답
     * @param authentication 인증 정보
     */
    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication
    ) {
        val oauth2User = authentication.principal as OAuth2User
        val email = oauth2User.attributes["email"] as String
        val userDetails: UserDetails = User.builder()
            .username(email)
            .password("")
            .authorities(authentication.authorities)
            .build()

        val accessToken = jwtService.generateAccessToken(userDetails)
        val refreshToken = jwtService.generateRefreshToken(userDetails)

        val targetUrl = UriComponentsBuilder.fromUriString("$frontendUrl/login/callback")
            .queryParam("accessToken", accessToken)
            .queryParam("refreshToken", refreshToken)
            .build()
            .toUriString()

        redirectStrategy.sendRedirect(request, response, targetUrl)
    }
}
