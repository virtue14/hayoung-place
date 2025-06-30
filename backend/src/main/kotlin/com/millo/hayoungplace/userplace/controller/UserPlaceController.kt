package com.millo.hayoungplace.userplace.controller

import com.millo.hayoungplace.auth.domain.CustomOAuth2User
import com.millo.hayoungplace.userplace.domain.UserPlace
import com.millo.hayoungplace.userplace.dto.UserPlaceSaveRequest
import com.millo.hayoungplace.userplace.service.UserPlaceService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@Tag(name = "사용자별 장소 API", description = "사용자가 저장한 장소를 관리하는 API")
@RestController
@RequestMapping("/api/user-places")
class UserPlaceController(
    private val userPlaceService: UserPlaceService
) {

    @Operation(summary = "내 장소로 저장")
    @PostMapping
    fun saveUserPlace(
        @AuthenticationPrincipal user: CustomOAuth2User,
        @Valid @RequestBody request: UserPlaceSaveRequest
    ): ResponseEntity<UserPlace> {
        val savedUserPlace = userPlaceService.saveUserPlace(request, user.name)
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUserPlace)
    }

    @Operation(summary = "내가 저장한 장소 목록 조회")
    @GetMapping("/me")
    fun getMyPlaces(
        @AuthenticationPrincipal user: CustomOAuth2User,
        @PageableDefault(size = 10) pageable: Pageable
    ): ResponseEntity<Page<UserPlace>> {
        val myPlaces = userPlaceService.getMyPlaces(user.name, pageable)
        return ResponseEntity.ok(myPlaces)
    }

    @Operation(summary = "저장한 장소 삭제")
    @DeleteMapping("/{userPlaceId}")
    fun deleteUserPlace(
        @AuthenticationPrincipal user: CustomOAuth2User,
        @PathVariable userPlaceId: String
    ): ResponseEntity<Unit> {
        userPlaceService.deleteUserPlace(userPlaceId, user.name)
        return ResponseEntity.noContent().build()
    }
}
