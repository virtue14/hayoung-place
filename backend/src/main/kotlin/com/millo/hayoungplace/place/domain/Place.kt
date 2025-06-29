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

    /** 장소 카테고리 */
    val category: PlaceCategory,

    /** 장소 설명 */
    val description: String,

    /** 장소 주소 */
    val address: String,

    /** 위도/경도 정보 */
    val location: Location,

    /** 장소 사진 URL 목록 */
    val photos: List<String>,

    /** 장소를 등록한 사용자 ID */
    val createdBy: String,

    /** 장소 등록 시간 */
    val createdAt: LocalDateTime = LocalDateTime.now(),

    /** 장소 정보 수정 시간 */
    val updatedAt: LocalDateTime = LocalDateTime.now()
)

/**
 * 장소의 위치 정보를 저장하는 데이터 클래스
 */
data class Location(
    /** 위도 */
    val latitude: Double,

    /** 경도 */
    val longitude: Double
)

/**
 * 장소 카테고리 정의
 */
enum class PlaceCategory {
    RESTAURANT,    // 맛집
    CAFE,          // 카페
    GALLERY,       // 미술관
    PHOTO_SPOT,    // 포토스팟
    ACTIVITY,      // 체험
    CULTURE,       // 문화공간
    NATURE,        // 자연
    OTHER          // 기타
}
