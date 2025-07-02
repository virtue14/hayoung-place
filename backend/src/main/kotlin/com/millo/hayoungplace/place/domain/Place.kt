package com.millo.hayoungplace.place.domain

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

/**
 * 장소 정보를 저장하는 도메인 클래스
 * MongoDB의 places 컬렉션에 매핑됩니다.
 */
@Document(collection = "places")
data class Place(
    /** 자동 생성 ID */
    @Id
    val id: String? = null,

    /** 장소 이름 */
    val name: String,

    /** 장소 주소 */
    val address: String,

    /** 위치 (GeoJSON Point) */
    val location: Location,

    /** 장소 URL (Kakao Place URL) */
    val placeUrl: String,

    /** 장소 카테고리 */
    val category: PlaceCategory,

    /** 장소 세부 카테고리 */
    val subCategory: SubCategory = SubCategory.NONE,

    /** 장소 설명 */
    val description: String,

    /** 조회수 */
    val viewCount: Int = 0,

    /** 댓글 수 */
    val commentCount: Long = 0,

    /** 글 수정/삭제를 위한 비밀번호 (해시화되어 저장) */
    val password: String,

    /** 생성일시 */
    val createdAt: LocalDateTime = LocalDateTime.now(),

    /** 수정일시 */
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
