package com.millo.hayoungplace.place.service

import com.millo.hayoungplace.place.domain.Location
import com.millo.hayoungplace.place.domain.Place
import com.millo.hayoungplace.place.domain.PlaceCategory
import com.millo.hayoungplace.place.repository.PlaceRepository
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
        val place = placeRepository.findById(id)
            .orElseThrow { NoSuchElementException("Place not found with id: $id") }

        val updatedPlace = place.copy(
            viewCount = place.viewCount + 1,
            updatedAt = java.time.LocalDateTime.now()
        )

        return placeRepository.save(updatedPlace)
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

        // 모든 사용자가 익명으로 장소를 등록할 수 있습니다
        val createdByUserId = "anonymous"

        // 이미지 파일 저장 및 URL 생성 (이미지가 있는 경우에만)
        val photos = if (images.isNotEmpty()) {
            images.map { file ->
                val fileName = "${UUID.randomUUID()}_${file.originalFilename}"
                val filePath = uploadDir.resolve(fileName)
                Files.copy(file.inputStream, filePath)
                "/images/$fileName"
            }
        } else {
            emptyList()
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

        // Place 객체 생성
        val place = Place(
            name = name,
            address = address,
            location = Location(coordinates = listOf(longitude, latitude)),
            placeUrl = placeUrl,
            category = PlaceCategory.valueOf(placeData["category"] as String),
            description = placeData["description"] as String,
            photos = photos,
            createdBy = createdByUserId,
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
            category = PlaceCategory.valueOf(placeData["category"] as String),
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
