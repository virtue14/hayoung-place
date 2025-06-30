package com.millo.hayoungplace.userplace.service

import com.millo.hayoungplace.place.repository.PlaceRepository
import com.millo.hayoungplace.userplace.domain.UserPlace
import com.millo.hayoungplace.userplace.dto.UserPlaceSaveRequest
import com.millo.hayoungplace.userplace.repository.UserPlaceRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.nio.file.AccessDeniedException

@Service
class UserPlaceService(
    private val userPlaceRepository: UserPlaceRepository,
    private val placeRepository: PlaceRepository // 공용 장소의 존재 여부 확인용
) {

    @Transactional
    fun saveUserPlace(request: UserPlaceSaveRequest, userId: String): UserPlace {
        // 1. 공용 장소(Place)가 실제로 존재하는지 확인
        placeRepository.findById(request.placeId)
            .orElseThrow { NoSuchElementException("존재하지 않는 장소입니다. (placeId: ${request.placeId})") }

        // 2. 이미 저장한 장소인지 확인 (Repository의 unique index가 처리하지만, 서비스 로직에서 한번 더 확인)
        userPlaceRepository.findByUserIdAndPlaceId(userId, request.placeId).ifPresent {
            throw IllegalStateException("이미 저장한 장소입니다.")
        }

        // 3. UserPlace 엔티티 생성 및 저장
        val userPlace = UserPlace(
            userId = userId,
            placeId = request.placeId,
            customDescription = request.customDescription,
            customCategory = request.customCategory,
            photos = request.photos ?: emptyList()
        )
        return userPlaceRepository.save(userPlace)
    }

    @Transactional(readOnly = true)
    fun getMyPlaces(userId: String, pageable: Pageable): Page<UserPlace> {
        return userPlaceRepository.findByUserId(userId, pageable)
    }

    @Transactional
    fun deleteUserPlace(userPlaceId: String, userId: String) {
        val userPlace = userPlaceRepository.findById(userPlaceId)
            .orElseThrow { NoSuchElementException("저장되지 않은 장소입니다. (id: $userPlaceId)") }

        if (userPlace.userId != userId) {
            throw AccessDeniedException("삭제할 권한이 없습니다.")
        }

        userPlaceRepository.delete(userPlace)
    }
}
