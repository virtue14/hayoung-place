package com.millo.hayoungplace.auth.service

import com.millo.hayoungplace.auth.domain.CustomOAuth2User
import com.millo.hayoungplace.auth.dto.OAuth2Attributes
import com.millo.hayoungplace.user.domain.AuthProvider
import com.millo.hayoungplace.user.domain.User
import com.millo.hayoungplace.user.repository.UserRepository
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Service

/**
 * OAuth2 인증을 처리하는 서비스
 * 사용자 정보를 가져와서 데이터베이스에 저장하고, CustomOAuth2User 객체를 생성합니다.
 */
@Service
class CustomOAuth2UserService(
    private val userRepository: UserRepository
) : OAuth2UserService<OidcUserRequest, OidcUser> {

    private val delegate = OidcUserService()

    /**
     * OAuth2 인증 후 사용자 정보를 로드하고 처리합니다.
     * @param userRequest OAuth2 사용자 요청 정보
     * @return OidcUser 객체
     */
    @Throws(OAuth2AuthenticationException::class)
    override fun loadUser(userRequest: OidcUserRequest): OidcUser {
        val oidcUser = delegate.loadUser(userRequest)

        // OAuth2 제공자 정보 추출
        val registrationId = userRequest.clientRegistration.registrationId
        val attributes = oidcUser.attributes

        // OAuth2 속성 정보를 통일된 형식으로 변환
        val email = attributes["email"] as String
        val name = attributes["name"] as String
        val picture = attributes["picture"] as String?
        val sub = attributes["sub"] as String

        // 사용자 정보 저장 또는 업데이트
        val user = saveOrUpdate(email, name, sub, registrationId)

        return oidcUser
    }

    /**
     * OAuth2 사용자 정보를 데이터베이스에 저장하거나 업데이트합니다.
     * @param email 사용자 이메일
     * @param name 사용자 이름
     * @param providerId OAuth2 제공자의 사용자 ID
     * @param registrationId OAuth2 제공자 ID
     * @return 저장된 User 객체
     */
    private fun saveOrUpdate(
        email: String,
        name: String,
        providerId: String,
        registrationId: String
    ): User {
        val user = userRepository.findByEmail(email)
            ?: User(
                email = email,
                name = name,
                nickname = name, // 초기 닉네임은 이름과 동일하게 설정
                provider = AuthProvider.valueOf(registrationId.uppercase()),
                providerId = providerId
            )

        return userRepository.save(user)
    }
}
