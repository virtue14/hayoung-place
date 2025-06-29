package com.millo.hayoungplace.auth.dto

/**
 * OAuth2 인증 제공자로부터 받아온 사용자 정보를 담는 DTO
 * 각 OAuth2 제공자(Google, Naver 등)별로 다른 응답 형식을 통일된 형식으로 변환합니다.
 */
data class OAuth2Attributes(
    /** OAuth2 제공자가 제공하는 원본 속성 정보 */
    val attributes: Map<String, Any>,

    /** 제공자가 식별하는 사용자 ID 필드명 */
    val nameAttributeKey: String,

    /** 제공자가 제공하는 사용자 ID */
    val id: String,

    /** 사용자 이름 */
    val name: String,

    /** 사용자 이메일 */
    val email: String,

    /** 프로필 이미지 URL */
    val picture: String?
) {
    companion object {
        /**
         * OAuth2 제공자와 속성 정보로부터 OAuth2Attributes 객체를 생성합니다.
         * @param registrationId OAuth2 제공자 ID (google, naver 등)
         * @param userNameAttributeName 제공자가 식별하는 사용자 ID 필드명
         * @param attributes 제공자가 제공하는 원본 속성 정보
         * @return OAuth2Attributes 객체
         */
        fun of(
            registrationId: String,
            userNameAttributeName: String,
            attributes: Map<String, Any>
        ): OAuth2Attributes {
            return when (registrationId.lowercase()) {
                "google" -> ofGoogle(userNameAttributeName, attributes)
                // 다른 OAuth2 제공자 추가 가능
                else -> throw IllegalArgumentException("Unsupported provider: $registrationId")
            }
        }

        /**
         * Google OAuth2 응답을 OAuth2Attributes 객체로 변환합니다.
         * @param userNameAttributeName 제공자가 식별하는 사용자 ID 필드명
         * @param attributes Google이 제공하는 원본 속성 정보
         * @return OAuth2Attributes 객체
         */
        private fun ofGoogle(
            userNameAttributeName: String,
            attributes: Map<String, Any>
        ): OAuth2Attributes {
            return OAuth2Attributes(
                attributes = attributes,
                nameAttributeKey = userNameAttributeName,
                id = attributes[userNameAttributeName].toString(),
                name = attributes["name"].toString(),
                email = attributes["email"].toString(),
                picture = attributes["picture"]?.toString()
            )
        }
    }
}
