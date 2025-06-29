package com.millo.hayoungplace.user.service

import com.millo.hayoungplace.user.domain.AuthProvider
import com.millo.hayoungplace.user.domain.User
import com.millo.hayoungplace.user.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * 사용자 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
class UserService(
    private val userRepository: UserRepository
) {
    /**
     * 이메일로 사용자를 조회합니다.
     * @param email 조회할 사용자의 이메일
     * @return 조회된 사용자 정보 또는 null
     */
    @Transactional(readOnly = true)
    fun findByEmail(email: String): User? {
        return userRepository.findByEmail(email)
    }

    /**
     * OAuth2 로그인 시 사용자 정보를 생성하거나 업데이트합니다.
     * @param email 사용자 이메일
     * @param name 사용자 이름
     * @param nickname 사용자 닉네임
     * @param provider OAuth2 제공자 (Google)
     * @param providerId OAuth2 제공자의 유저 ID
     * @return 생성되거나 업데이트된 사용자 정보
     */
    @Transactional
    fun createOrUpdateUser(
        email: String,
        name: String,
        nickname: String,
        provider: AuthProvider,
        providerId: String
    ): User {
        val existingUser = userRepository.findByEmail(email)

        return if (existingUser != null) {
            // 기존 사용자 정보 업데이트
            existingUser.copy(
                name = name,
                nickname = nickname,
                providerId = providerId
            ).let { userRepository.save(it) }
        } else {
            // 새로운 사용자 생성
            User(
                email = email,
                name = name,
                nickname = nickname,
                provider = provider,
                providerId = providerId
            ).let { userRepository.save(it) }
        }
    }

    /**
     * 이메일의 존재 여부를 확인합니다.
     * @param email 확인할 이메일
     * @return 이메일 존재 여부
     */
    @Transactional(readOnly = true)
    fun existsByEmail(email: String): Boolean {
        return userRepository.existsByEmail(email)
    }
}
