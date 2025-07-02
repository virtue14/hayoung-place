package com.millo.hayoungplace.place.dto

import java.time.LocalDateTime

// 댓글 작성 요청
data class CommentCreateRequest(
    val nickname: String,
    val password: String,
    val content: String,
    val parentId: String? = null
)

// 댓글 수정 요청
data class CommentUpdateRequest(
    val password: String,
    val content: String
)

// 댓글 삭제 요청
data class CommentDeleteRequest(
    val password: String
)

// 댓글 응답 (패스워드 제외)
data class CommentResponse(
    val id: String,
    val placeId: String,
    val parentId: String? = null,
    val nickname: String,
    val content: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val isDeleted: Boolean = false,
    val replies: List<CommentResponse> = emptyList() // 대댓글 목록
)

// 댓글 페이지 응답
data class CommentPageResponse(
    val content: List<CommentResponse>,
    val totalPages: Int,
    val totalElements: Long,
    val currentPage: Int,
    val size: Int
)
