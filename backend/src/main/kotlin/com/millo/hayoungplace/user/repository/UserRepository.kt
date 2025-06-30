package com.millo.hayoungplace.user.repository

import com.millo.hayoungplace.user.domain.User
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

/**
 * 사용자 정보에 대한 데이터베이스 접근을 담당하는 리포지토리
 */
@Repository
interface UserRepository : MongoRepository<User, String> {
    /**
     * 이메일로 사용자를 조회합니다.
     * @param email 조회할 사용자의 이메일
     * @return 조회된 사용자 정보 또는 null
     */
    fun findByEmail(email: String): User?

    /**
     * 이메일의 존재 여부를 확인합니다.
     * @param email 확인할 이메일
     * @return 이메일 존재 여부
     */
    fun existsByEmail(email: String): Boolean
}
