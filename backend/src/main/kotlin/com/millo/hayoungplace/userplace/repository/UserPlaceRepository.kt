package com.millo.hayoungplace.userplace.repository

import com.millo.hayoungplace.userplace.domain.UserPlace
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface UserPlaceRepository : MongoRepository<UserPlace, String> {

    /**
     * 특정 사용자가 저장한 모든 장소 목록을 페이징하여 조회합니다.
     */
    fun findByUserId(userId: String, pageable: Pageable): Page<UserPlace>

    /**
     * 사용자 ID와 장소 ID로 저장된 장소가 있는지 확인합니다.
     */
    fun findByUserIdAndPlaceId(userId: String, placeId: String): Optional<UserPlace>
}
