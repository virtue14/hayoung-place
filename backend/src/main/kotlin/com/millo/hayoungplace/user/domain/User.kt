package com.millo.hayoungplace.user.domain

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

/**
 * 사용자 정보를 저장하는 도메인 클래스
 */
@Document(collection = "users")
data class User(
    /** MongoDB 자동 생성 ID */
    @Id
    val id: String? = null,

    /** 사용자 이메일 */
    val email: String,

    /** 사용자 이름 */
    val name: String,

    /** 사용자 닉네임 */
    val nickname: String,

    /** OAuth2 인증 제공자 */
    val provider: AuthProvider,

    /** OAuth2 제공자의 유저 ID */
    val providerId: String,

    /** 계정 생성일시 */
    val createdAt: LocalDateTime = LocalDateTime.now(),

    /** 계정 정보 수정일시 */
    val updatedAt: LocalDateTime = LocalDateTime.now(),

    /** 계정 탈퇴일시 */
    val deletedAt: LocalDateTime? = null
)

/**
 * OAuth2 인증 제공자를 정의하는 열거형
 */
enum class AuthProvider {
    /** Google 로그인 */
    GOOGLE
}
