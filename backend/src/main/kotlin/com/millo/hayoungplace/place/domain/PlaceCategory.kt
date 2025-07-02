package com.millo.hayoungplace.place.domain

enum class PlaceCategory {
    RESTAURANT,
    CAFE,
    GALLERY,
    PHOTO_SPOT,
    CULTURE_ACTIVITY,
    SHOPPING,
    OTHER
}

enum class SubCategory {
    // 맛집 (RESTAURANT) 서브카테고리
    KOREAN_FOOD,
    CHINESE_FOOD,
    JAPANESE_FOOD,
    WESTERN_FOOD,
    FAST_FOOD,
    SEAFOOD,
    BBQ,
    DESSERT,

    // 카페 (CAFE) 서브카테고리
    COFFEE_SHOP,
    BAKERY,
    TEA_HOUSE,
    ROASTERY,

    // 갤러리 (GALLERY) 서브카테고리
    ART_GALLERY,
    MUSEUM,
    EXHIBITION_HALL,

    // 포토스팟 (PHOTO_SPOT) 서브카테고리
    SCENIC_VIEW,
    LANDMARK,
    BEACH,
    MOUNTAIN,
    GARDEN,

    // 문화활동 (CULTURE_ACTIVITY) 서브카테고리
    THEATER,
    CINEMA,
    CONCERT_HALL,
    CULTURAL_CENTER,

    // 쇼핑 (SHOPPING) 서브카테고리
    DEPARTMENT_STORE,
    OUTLET,
    TRADITIONAL_MARKET,
    SHOPPING_MALL,

    // 기타 (OTHER) 서브카테고리
    ACCOMMODATION,
    ENTERTAINMENT,
    SPORTS,
    NONE // 서브카테고리 없음
}

// 카테고리별 서브카테고리 매핑
object CategorySubCategoryMapping {
    val mappings = mapOf(
        PlaceCategory.RESTAURANT to listOf(
            SubCategory.KOREAN_FOOD,
            SubCategory.CHINESE_FOOD,
            SubCategory.JAPANESE_FOOD,
            SubCategory.WESTERN_FOOD,
            SubCategory.FAST_FOOD,
            SubCategory.SEAFOOD,
            SubCategory.BBQ,
            SubCategory.DESSERT
        ),
        PlaceCategory.CAFE to listOf(
            SubCategory.COFFEE_SHOP,
            SubCategory.BAKERY,
            SubCategory.TEA_HOUSE,
            SubCategory.ROASTERY
        ),
        PlaceCategory.GALLERY to listOf(
            SubCategory.ART_GALLERY,
            SubCategory.MUSEUM,
            SubCategory.EXHIBITION_HALL
        ),
        PlaceCategory.PHOTO_SPOT to listOf(
            SubCategory.SCENIC_VIEW,
            SubCategory.LANDMARK,
            SubCategory.BEACH,
            SubCategory.MOUNTAIN,
            SubCategory.GARDEN
        ),
        PlaceCategory.CULTURE_ACTIVITY to listOf(
            SubCategory.THEATER,
            SubCategory.CINEMA,
            SubCategory.CONCERT_HALL,
            SubCategory.CULTURAL_CENTER
        ),
        PlaceCategory.SHOPPING to listOf(
            SubCategory.DEPARTMENT_STORE,
            SubCategory.OUTLET,
            SubCategory.TRADITIONAL_MARKET,
            SubCategory.SHOPPING_MALL
        ),
        PlaceCategory.OTHER to listOf(
            SubCategory.ACCOMMODATION,
            SubCategory.ENTERTAINMENT,
            SubCategory.SPORTS,
            SubCategory.NONE
        )
    )

    fun getSubCategories(category: PlaceCategory): List<SubCategory> {
        return mappings[category] ?: emptyList()
    }

    fun isValidSubCategory(category: PlaceCategory, subCategory: SubCategory): Boolean {
        return mappings[category]?.contains(subCategory) == true
    }
}
