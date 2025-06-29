package com.millo.hayoungplace.auth.domain

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.oauth2.core.user.OAuth2User

/**
 * OAuth2 인증이 완료된 사용자 정보를 담는 클래스
 */
class CustomOAuth2User(
    private val attributes: Map<String, Any>,
    private val nameAttributeKey: String,
    private val email: String
) : OAuth2User {

    /**
     * OAuth2 제공자가 제공한 원본 속성 정보를 반환합니다.
     */
    override fun getAttributes(): Map<String, Any> = attributes

    /**
     * 사용자의 이메일을 반환합니다.
     */
    override fun getName(): String = email

    /**
     * Spring Security 요구사항으로 인해 빈 권한 목록을 반환합니다.
     */
    override fun getAuthorities(): Collection<GrantedAuthority> = emptyList()
}
