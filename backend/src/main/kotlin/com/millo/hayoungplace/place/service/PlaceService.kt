package com.millo.hayoungplace.place.service

import com.millo.hayoungplace.place.domain.Place
import com.millo.hayoungplace.place.domain.PlaceCategory
import com.millo.hayoungplace.place.repository.PlaceRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * 장소 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
class PlaceService(
    private val placeRepository: PlaceRepository
) {
    /**
     * 모든 장소 목록을 페이징하여 조회합니다.
     * @param pageable 페이징 정보
     * @return 페이징된 장소 목록
     */
    @Transactional(readOnly = true)
    fun getAllPlaces(pageable: Pageable): Page<Place> {
        return placeRepository.findAll(pageable)
    }

    /**
     * ID로 특정 장소를 조회합니다.
     * @param id 조회할 장소 ID
     * @return 조회된 장소 정보
     * @throws NoSuchElementException 해당 ID의 장소가 없는 경우
     */
    @Transactional(readOnly = true)
    fun getPlaceById(id: String): Place {
        return placeRepository.findById(id)
            .orElseThrow { NoSuchElementException("Place not found with id: $id") }
    }

    /**
     * 카테고리별 장소 목록을 조회합니다.
     * @param category 조회할 장소 카테고리
     * @param pageable 페이징 정보
     * @return 페이징된 장소 목록
     */
    @Transactional(readOnly = true)
    fun getPlacesByCategory(category: PlaceCategory, pageable: Pageable): Page<Place> {
        return placeRepository.findByCategory(category, pageable)
    }

    /**
     * 장소 이름으로 검색합니다.
     * @param query 검색할 장소 이름
     * @param pageable 페이징 정보
     * @return 페이징된 장소 목록
     */
    @Transactional(readOnly = true)
    fun searchPlaces(query: String, pageable: Pageable): Page<Place> {
        return placeRepository.findByNameContainingIgnoreCase(query, pageable)
    }

    /**
     * 특정 위치 근처의 장소들을 조회합니다.
     * @param longitude 경도
     * @param latitude 위도
     * @param maxDistance 최대 거리 (미터 단위)
     * @param pageable 페이징 정보
     * @return 페이징된 장소 목록
     */
    @Transactional(readOnly = true)
    fun getNearbyPlaces(longitude: Double, latitude: Double, maxDistance: Double, pageable: Pageable): Page<Place> {
        return placeRepository.findNearby(longitude, latitude, maxDistance, pageable)
    }

    /**
     * 새로운 장소를 등록합니다.
     * @param place 등록할 장소 정보
     * @return 등록된 장소 정보
     */
    @Transactional
    fun createPlace(place: Place): Place {
        return placeRepository.save(place)
    }

    /**
     * 기존 장소 정보를 수정합니다.
     * @param id 수정할 장소 ID
     * @param place 수정할 장소 정보
     * @return 수정된 장소 정보
     * @throws NoSuchElementException 해당 ID의 장소가 없는 경우
     */
    @Transactional
    fun updatePlace(id: String, place: Place): Place {
        if (!placeRepository.existsById(id)) {
            throw NoSuchElementException("Place not found with id: $id")
        }
        return placeRepository.save(place.copy(id = id))
    }

    /**
     * 장소를 삭제합니다.
     * @param id 삭제할 장소 ID
     * @throws NoSuchElementException 해당 ID의 장소가 없는 경우
     */
    @Transactional
    fun deletePlace(id: String) {
        if (!placeRepository.existsById(id)) {
            throw NoSuchElementException("Place not found with id: $id")
        }
        placeRepository.deleteById(id)
    }
}
