package com.millo.hayoungplace.userplace.dto

import com.millo.hayoungplace.place.domain.PlaceCategory
import jakarta.validation.constraints.NotEmpty

data class UserPlaceSaveRequest(
    @field:NotEmpty(message = "장소 ID는 필수입니다.")
    val placeId: String,

    val customDescription: String?,

    val customCategory: PlaceCategory?,

    val photos: List<String>? = emptyList()
)
