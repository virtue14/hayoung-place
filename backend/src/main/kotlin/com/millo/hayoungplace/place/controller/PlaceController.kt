package com.millo.hayoungplace.place.controller

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.millo.hayoungplace.place.domain.Place
import com.millo.hayoungplace.place.domain.PlaceCategory
import com.millo.hayoungplace.place.domain.SubCategory
import com.millo.hayoungplace.place.domain.CategorySubCategoryMapping
import com.millo.hayoungplace.place.dto.PasswordRequest
import com.millo.hayoungplace.place.service.InvalidPasswordException
import com.millo.hayoungplace.place.service.PlaceService
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@Tag(name = "장소 API", description = "장소 정보를 관리하는 API")
@RestController
@RequestMapping("/api/places")
class PlaceController(
    private val placeService: PlaceService
) {
    companion object {
        private val logger: Logger = LoggerFactory.getLogger(PlaceController::class.java)
    }

    private val objectMapper = jacksonObjectMapper()

    @Operation(
        summary = "전체 장소 목록 조회",
        description = "등록된 모든 장소 목록을 페이징하여 조회합니다."
    )
    @GetMapping
    fun getAllPlaces(
        @PageableDefault(size = 5) pageable: Pageable
    ): ResponseEntity<Page<Place>> {
        return ResponseEntity.ok(placeService.getAllPlaces(pageable))
    }

    @Operation(
        summary = "장소 상세 정보 조회",
        description = "특정 장소의 상세 정보를 조회하고 조회수를 증가시킵니다."
    )
    @GetMapping("/{id}")
    fun getPlaceById(
        @Parameter(description = "조회할 장소 ID")
        @PathVariable id: String
    ): ResponseEntity<Place> {
        logger.info("Received request to get place by id: $id")
        val place = placeService.incrementViewCount(id)
        logger.info("Returning place with view count: ${place.viewCount}")
        return ResponseEntity.ok(place)
    }

    @Operation(
        summary = "카테고리별 장소 목록 조회",
        description = "특정 카테고리에 속한 장소 목록을 페이징하여 조회합니다."
    )
    @GetMapping("/category/{category}")
    fun getPlacesByCategory(
        @Parameter(description = "조회할 장소 카테고리 (대소문자 무관)")
        @PathVariable category: String,
        @PageableDefault(size = 20) pageable: Pageable
    ): ResponseEntity<Page<Place>> {
        val categoryEnum = PlaceCategory.valueOf(category.uppercase())
        return ResponseEntity.ok(placeService.getPlacesByCategory(categoryEnum, pageable))
    }

    @Operation(
        summary = "장소 검색",
        description = "장소 이름으로 검색합니다. (대소문자 구분 없음)"
    )
    @GetMapping("/search")
    fun searchPlaces(
        @Parameter(description = "검색할 장소 이름")
        @RequestParam query: String,
        @PageableDefault(size = 20) pageable: Pageable
    ): ResponseEntity<Page<Place>> {
        return ResponseEntity.ok(placeService.searchPlaces(query, pageable))
    }

    @Operation(
        summary = "주변 장소 검색",
        description = "특정 위치 주변의 장소들을 검색합니다."
    )
    @GetMapping("/nearby")
    fun getNearbyPlaces(
        @Parameter(description = "경도") @RequestParam longitude: Double,
        @Parameter(description = "위도") @RequestParam latitude: Double,
        @Parameter(description = "검색 반경 (미터)") @RequestParam(defaultValue = "1000") maxDistance: Double,
        @PageableDefault(size = 20) pageable: Pageable
    ): ResponseEntity<Page<Place>> {
        return ResponseEntity.ok(placeService.getNearbyPlaces(longitude, latitude, maxDistance, pageable))
    }

    @Operation(
        summary = "새로운 장소 등록",
        description = "새로운 장소를 등록합니다."
    )
    @PostMapping
    fun createPlace(
        @Parameter(description = "등록할 장소 정보")
        @Valid @RequestBody placeData: Map<String, Any>
    ): ResponseEntity<Place> {
        val place = placeService.createPlace(placeData, emptyList())
        return ResponseEntity.ok(place)
    }

    @Operation(
        summary = "비밀번호 검증",
        description = "장소 수정/삭제를 위한 비밀번호를 검증합니다."
    )
    @PostMapping("/{id}/verify-password")
    fun verifyPassword(
        @Parameter(description = "장소 ID")
        @PathVariable id: String,
        @Parameter(description = "비밀번호")
        @Valid @RequestBody passwordRequest: PasswordRequest
    ): ResponseEntity<Map<String, Any>> {
        return try {
            placeService.verifyPlacePassword(id, passwordRequest.password)
            ResponseEntity.ok(mapOf("valid" to true, "message" to "비밀번호가 확인되었습니다") as Map<String, Any>)
        } catch (e: InvalidPasswordException) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("valid" to false, "message" to e.message) as Map<String, Any>)
        } catch (e: NoSuchElementException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("valid" to false, "message" to e.message) as Map<String, Any>)
        }
    }

    @Operation(
        summary = "장소 정보 수정",
        description = "기존 장소의 정보를 수정합니다. 비밀번호가 필요합니다."
    )
    @PutMapping("/{id}")
    fun updatePlace(
        @Parameter(description = "수정할 장소 ID")
        @PathVariable id: String,
        @Parameter(description = "수정할 장소 정보 (비밀번호 포함)")
        @Valid @RequestBody placeData: Map<String, Any>
    ): ResponseEntity<Any> {
                return try {
            val password = placeData["password"] as? String
                ?: return ResponseEntity.badRequest().body(mapOf("error" to "비밀번호가 필요합니다") as Map<String, Any>)

            val place = placeService.updatePlace(id, placeData, password)
            ResponseEntity.ok(place)
        } catch (e: InvalidPasswordException) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message) as Map<String, Any>)
        } catch (e: NoSuchElementException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message) as Map<String, Any>)
        }
    }

    @Operation(
        summary = "장소 삭제",
        description = "등록된 장소를 삭제합니다. 비밀번호가 필요합니다."
    )
    @DeleteMapping("/{id}")
    fun deletePlace(
        @Parameter(description = "삭제할 장소 ID")
        @PathVariable id: String,
        @Parameter(description = "비밀번호")
        @Valid @RequestBody passwordRequest: PasswordRequest
    ): ResponseEntity<Map<String, Any>> {
        return try {
            placeService.deletePlace(id, passwordRequest.password)
            ResponseEntity.ok(mapOf("message" to "장소가 성공적으로 삭제되었습니다") as Map<String, Any>)
        } catch (e: InvalidPasswordException) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message) as Map<String, Any>)
        } catch (e: NoSuchElementException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message) as Map<String, Any>)
        }
    }

    @Operation(
        summary = "카테고리별 서브카테고리 목록 조회",
        description = "특정 카테고리에 속한 서브카테고리 목록을 조회합니다."
    )
    @GetMapping("/categories/{category}/subcategories")
    fun getSubCategories(
        @Parameter(description = "조회할 장소 카테고리")
        @PathVariable category: String
    ): ResponseEntity<List<SubCategory>> {
        val categoryEnum = PlaceCategory.valueOf(category.uppercase())
        val subCategories = CategorySubCategoryMapping.getSubCategories(categoryEnum)
        return ResponseEntity.ok(subCategories)
    }

    @Operation(
        summary = "서브카테고리로 장소 목록 조회",
        description = "특정 카테고리와 서브카테고리에 속한 장소 목록을 페이징하여 조회합니다."
    )
    @GetMapping("/category/{category}/subcategory/{subCategory}")
    fun getPlacesByCategoryAndSubCategory(
        @Parameter(description = "조회할 장소 카테고리")
        @PathVariable category: String,
        @Parameter(description = "조회할 서브카테고리")
        @PathVariable subCategory: String,
        @PageableDefault(size = 20) pageable: Pageable
    ): ResponseEntity<Page<Place>> {
        val categoryEnum = PlaceCategory.valueOf(category.uppercase())
        val subCategoryEnum = SubCategory.valueOf(subCategory.uppercase())

        // 카테고리와 서브카테고리 매핑 검증
        if (!CategorySubCategoryMapping.isValidSubCategory(categoryEnum, subCategoryEnum)) {
            return ResponseEntity.badRequest().build()
        }

        return ResponseEntity.ok(placeService.getPlacesByCategoryAndSubCategory(categoryEnum, subCategoryEnum, pageable))
    }

    @Operation(
        summary = "모든 카테고리와 서브카테고리 매핑 조회",
        description = "전체 카테고리별 서브카테고리 매핑 정보를 조회합니다."
    )
    @GetMapping("/categories")
    fun getAllCategoriesWithSubCategories(): ResponseEntity<Map<PlaceCategory, List<SubCategory>>> {
        return ResponseEntity.ok(CategorySubCategoryMapping.mappings)
    }
}
