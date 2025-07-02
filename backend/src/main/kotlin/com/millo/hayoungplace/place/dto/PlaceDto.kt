package com.millo.hayoungplace.place.dto

import com.millo.hayoungplace.place.domain.PlaceCategory
import com.millo.hayoungplace.place.domain.SubCategory

/**
 * 장소 수정 요청 DTO
 */
data class UpdatePlaceRequest(
    val category: PlaceCategory,
    val subCategory: SubCategory,
    val description: String,
    val password: String
)
