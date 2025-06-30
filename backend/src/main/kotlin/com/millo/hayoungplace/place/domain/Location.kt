package com.millo.hayoungplace.place.domain

/**
 * GeoJSON Point를 표현하는 데이터 클래스.
 * [경도, 위도] 순서로 저장해야 합니다.
 */
data class Location(
    val type: String = "Point",
    val coordinates: List<Double>
)
