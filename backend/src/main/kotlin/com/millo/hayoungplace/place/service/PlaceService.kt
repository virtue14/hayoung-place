package com.millo.hayoungplace.place.service

import com.millo.hayoungplace.place.domain.Location
import com.millo.hayoungplace.place.domain.Place
import com.millo.hayoungplace.place.domain.PlaceCategory
import com.millo.hayoungplace.place.domain.SubCategory
import com.millo.hayoungplace.place.domain.CategorySubCategoryMapping
import com.millo.hayoungplace.place.repository.PlaceRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Paths
import java.security.MessageDigest
import java.util.*

/**
 * 중복된 장소 등록 시 발생하는 예외
 */
class DuplicatePlaceException(message: String) : RuntimeException(message)

/**
 * 비밀번호가 일치하지 않을 때 발생하는 예외
 */
class InvalidPasswordException(message: String) : RuntimeException(message)

/**
 * 장소 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
class PlaceService(
    private val placeRepository: PlaceRepository
) {
    companion object {
        private val logger: Logger = LoggerFactory.getLogger(PlaceService::class.java)
    }

    // 이미지 저장 경로 설정
    private val uploadDir = Paths.get("uploads/images")

    init {
        // 이미지 저장 디렉토리 생성
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir)
        }
    }

    /**
     * 비밀번호를 SHA-256으로 해시화합니다.
     * @param password 원본 비밀번호
     * @return 해시화된 비밀번호
     */
    private fun hashPassword(password: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val hash = digest.digest(password.toByteArray())
        return hash.joinToString("") { "%02x".format(it) }
    }

    /**
     * 입력된 비밀번호가 저장된 해시와 일치하는지 확인합니다.
     * @param inputPassword 입력된 비밀번호
     * @param hashedPassword 저장된 해시화된 비밀번호
     * @return 비밀번호 일치 여부
     */
    private fun verifyPassword(inputPassword: String, hashedPassword: String): Boolean {
        return hashPassword(inputPassword) == hashedPassword
    }

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
     * 장소 조회수를 증가시킵니다.
     * @param id 조회수를 증가시킬 장소 ID
     * @return 조회수가 증가된 장소 정보
     * @throws NoSuchElementException 해당 ID의 장소가 없는 경우
     */
    @Transactional
    fun incrementViewCount(id: String): Place {
        logger.info("Incrementing view count for place: $id")

        val place = placeRepository.findById(id)
            .orElseThrow { NoSuchElementException("Place not found with id: $id") }

        logger.info("Current view count for place $id: ${place.viewCount}")

        val updatedPlace = place.copy(
            viewCount = place.viewCount + 1
            // updatedAt은 변경하지 않음 (조회수 증가는 정보 수정이 아님)
        )

        val savedPlace = placeRepository.save(updatedPlace)
        logger.info("Updated view count for place $id: ${savedPlace.viewCount}")

        return savedPlace
    }

    /**
     * 장소의 댓글 수를 업데이트합니다.
     * @param id 댓글 수를 업데이트할 장소 ID
     * @param commentCount 새로운 댓글 수
     * @return 댓글 수가 업데이트된 장소 정보
     * @throws NoSuchElementException 해당 ID의 장소가 없는 경우
     */
    @Transactional
    fun updateCommentCount(id: String, commentCount: Long): Place {
        logger.info("Updating comment count for place: $id to $commentCount")

        val place = placeRepository.findById(id)
            .orElseThrow { NoSuchElementException("Place not found with id: $id") }

        val updatedPlace = place.copy(
            commentCount = commentCount
            // updatedAt은 변경하지 않음 (댓글 수 증가는 정보 수정이 아님)
        )

        val savedPlace = placeRepository.save(updatedPlace)
        logger.info("Updated comment count for place $id: ${savedPlace.commentCount}")

        return savedPlace
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
     * 카테고리와 서브카테고리별 장소 목록을 조회합니다.
     * @param category 조회할 장소 카테고리
     * @param subCategory 조회할 서브카테고리
     * @param pageable 페이징 정보
     * @return 페이징된 장소 목록
     */
    @Transactional(readOnly = true)
    fun getPlacesByCategoryAndSubCategory(category: PlaceCategory, subCategory: SubCategory, pageable: Pageable): Page<Place> {
        return placeRepository.findByCategoryAndSubCategory(category, subCategory, pageable)
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
     * @param placeData 등록할 장소 정보
     * @param images 장소 이미지 파일 목록 (선택사항)
     * @return 등록된 장소 정보
     * @throws DuplicatePlaceException 이미 등록된 장소인 경우
     */
    @Transactional
    fun createPlace(placeData: Map<String, Any>, images: List<MultipartFile>): Place {
        val name = placeData["name"] as String
        val address = placeData["address"] as String
        val placeUrl = placeData["placeUrl"] as String
        val password = placeData["password"] as? String ?: throw IllegalArgumentException("비밀번호는 필수입니다")

        // 중복 장소 확인
        when {
            placeRepository.existsByPlaceUrl(placeUrl) -> {
                throw DuplicatePlaceException("이미 등록된 장소입니다.")
            }
            placeRepository.existsByNameAndAddress(name, address) -> {
                throw DuplicatePlaceException("이미 등록된 장소입니다.")
            }
        }

        val longitude = when (val lon = placeData["longitude"]) {
            is Double -> lon
            is String -> lon.toDoubleOrNull() ?: throw IllegalArgumentException("Invalid longitude")
            is Number -> lon.toDouble()
            else -> throw IllegalArgumentException("Invalid longitude")
        }

        val latitude = when (val lat = placeData["latitude"]) {
            is Double -> lat
            is String -> lat.toDoubleOrNull() ?: throw IllegalArgumentException("Invalid latitude")
            is Number -> lat.toDouble()
            else -> throw IllegalArgumentException("Invalid latitude")
        }

        // 카테고리 및 서브카테고리 검증
        val category = PlaceCategory.valueOf(placeData["category"] as String)
        val subCategory = if (placeData.containsKey("subCategory") && placeData["subCategory"] != null) {
            val subCat = SubCategory.valueOf(placeData["subCategory"] as String)
            // 카테고리와 서브카테고리 매핑 검증
            if (!CategorySubCategoryMapping.isValidSubCategory(category, subCat)) {
                throw IllegalArgumentException("유효하지 않은 카테고리-서브카테고리 조합입니다")
            }
            subCat
        } else {
            SubCategory.NONE
        }

        // Place 객체 생성
        val place = Place(
            name = name,
            address = address,
            location = Location(coordinates = listOf(longitude, latitude)),
            placeUrl = placeUrl,
            category = category,
            subCategory = subCategory,
            description = placeData["description"] as String,
            password = hashPassword(password)
        )

        return placeRepository.save(place)
    }



    /**
     * 비밀번호를 검증합니다.
     * @param id 장소 ID
     * @param inputPassword 입력된 비밀번호
     * @throws NoSuchElementException 해당 ID의 장소가 없는 경우
     * @throws InvalidPasswordException 비밀번호가 일치하지 않는 경우
     */
    @Transactional(readOnly = true)
    fun verifyPlacePassword(id: String, inputPassword: String) {
        val place = placeRepository.findById(id)
            .orElseThrow { NoSuchElementException("Place not found with id: $id") }

        if (!verifyPassword(inputPassword, place.password)) {
            throw InvalidPasswordException("비밀번호가 일치하지 않습니다")
        }
    }

    /**
     * 기존 장소 정보를 수정합니다.
     * @param id 수정할 장소 ID
     * @param placeData 수정할 장소 정보
     * @param password 비밀번호
     * @return 수정된 장소 정보
     * @throws NoSuchElementException 해당 ID의 장소가 없는 경우
     * @throws InvalidPasswordException 비밀번호가 일치하지 않는 경우
     */
    @Transactional
    fun updatePlace(id: String, placeData: Map<String, Any>, password: String): Place {
        val existingPlace = placeRepository.findById(id)
            .orElseThrow { NoSuchElementException("Place not found with id: $id") }

        // 비밀번호 검증
        if (!verifyPassword(password, existingPlace.password)) {
            throw InvalidPasswordException("비밀번호가 일치하지 않습니다")
        }

        // 카테고리 및 서브카테고리 검증
        val category = PlaceCategory.valueOf(placeData["category"] as String)
        val subCategory = if (placeData.containsKey("subCategory") && placeData["subCategory"] != null) {
            val subCat = SubCategory.valueOf(placeData["subCategory"] as String)
            // 카테고리와 서브카테고리 매핑 검증
            if (!CategorySubCategoryMapping.isValidSubCategory(category, subCat)) {
                throw IllegalArgumentException("유효하지 않은 카테고리-서브카테고리 조합입니다")
            }
            subCat
        } else {
            SubCategory.NONE
        }

        // 수정한 필드만 업데이트
        val updatedPlace = existingPlace.copy(
            name = placeData["name"] as String,
            address = placeData["address"] as String,
            location = Location(
                coordinates = listOf(
                    (placeData["longitude"] as Number).toDouble(),
                    (placeData["latitude"] as Number).toDouble()
                )
            ),
            placeUrl = placeData["placeUrl"] as String,
            category = category,
            subCategory = subCategory,
            description = placeData["description"] as String,
            updatedAt = java.time.LocalDateTime.now()
        )

        return placeRepository.save(updatedPlace)
    }

    /**
     * 장소를 삭제합니다.
     * @param id 삭제할 장소 ID
     * @param password 비밀번호
     * @throws NoSuchElementException 해당 ID의 장소가 없는 경우
     * @throws InvalidPasswordException 비밀번호가 일치하지 않는 경우
     */
    @Transactional
    fun deletePlace(id: String, password: String) {
        val place = placeRepository.findById(id)
            .orElseThrow { NoSuchElementException("Place not found with id: $id") }

        // 비밀번호 검증
        if (!verifyPassword(password, place.password)) {
            throw InvalidPasswordException("비밀번호가 일치하지 않습니다")
        }

        placeRepository.deleteById(id)
    }

    /**
     * 모든 장소 목록을 조회합니다.
     */
    fun getAllPlaces(): List<Place> {
        return placeRepository.findAllByOrderByCreatedAtDesc()
    }
}
