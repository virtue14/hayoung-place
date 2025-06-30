package com.millo.hayoungplace.userplace.domain

import com.millo.hayoungplace.place.domain.PlaceCategory
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

/**
 * 사용자별로 저장한 장소 정보를 관리하는 도메인 클래스.
 * MongoDB의 `user_places` 컬렉션에 매핑됩니다.
 * userId와 placeId에는 복합 유니크 인덱스를 설정하여 중복 저장을 방지합니다.
 */
@Document(collection = "user_places")
@CompoundIndex(name = "user_place_unique", def = "{'userId': 1, 'placeId': 1}", unique = true)
data class UserPlace(
    @Id
    val id: String? = null,

    /** 사용자 ID */
    val userId: String,

    /** 공용 장소의 ID */
    val placeId: String,

    /** 사용자 정의 설명 */
    val customDescription: String?,

    /** 사용자 정의 카테고리 */
    val customCategory: PlaceCategory?,

    /** 사용자별 갤러리 이미지 URL 목록 */
    val photos: List<String>,

    /** 저장일시 */
    val createdAt: LocalDateTime = LocalDateTime.now(),

    /** 수정일시 */
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
