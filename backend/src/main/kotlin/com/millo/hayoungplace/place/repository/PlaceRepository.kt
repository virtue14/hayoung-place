package com.millo.hayoungplace.place.repository

import com.millo.hayoungplace.place.domain.Place
import com.millo.hayoungplace.place.domain.PlaceCategory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.Query

/**
 * 장소 정보에 대한 데이터베이스 접근을 담당하는 리포지토리
 */
interface PlaceRepository : MongoRepository<Place, String> {
    /**
     * 카테고리별 장소 목록을 페이징하여 조회합니다.
     * @param category 조회할 장소 카테고리
     * @param pageable 페이징 정보
     * @return 페이징된 장소 목록
     */
    fun findByCategory(category: PlaceCategory, pageable: Pageable): Page<Place>

    /**
     * 특정 사용자가 등록한 장소 목록을 페이징하여 조회합니다.
     * @param userId 조회할 사용자 ID
     * @param pageable 페이징 정보
     * @return 페이징된 장소 목록
     */
    fun findByCreatedBy(userId: String, pageable: Pageable): Page<Place>

    /**
     * 특정 위치 근처의 장소들을 조회합니다.
     * @param longitude 경도
     * @param latitude 위도
     * @param maxDistance 최대 거리 (미터 단위)
     * @param pageable 페이징 정보
     * @return 페이징된 장소 목록
     */
    @Query("{'location': {\$near: {\$geometry: {\$type: 'Point', \$coordinates: [?0, ?1]}, \$maxDistance: ?2}}}")
    fun findNearby(longitude: Double, latitude: Double, maxDistance: Double, pageable: Pageable): Page<Place>

    /**
     * 장소 이름으로 검색합니다. (대소문자 구분 없음)
     * @param name 검색할 장소 이름
     * @param pageable 페이징 정보
     * @return 페이징된 장소 목록
     */
    fun findByNameContainingIgnoreCase(name: String, pageable: Pageable): Page<Place>
}
