package com.millo.hayoungplace.place.domain

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

@Document(collection = "comments")
data class Comment(
    @Id
    val id: String? = null,
    val placeId: String,
    val parentId: String? = null, // 대댓글의 경우 부모 댓글 ID
    val nickname: String,
    val password: String, // 암호화된 패스워드
    val content: String,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now(),
    val isDeleted: Boolean = false // 소프트 삭제
)
