package com.millo.hayoungplace.place.service

import com.millo.hayoungplace.place.domain.Comment
import com.millo.hayoungplace.place.dto.*
import com.millo.hayoungplace.place.repository.CommentRepository
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.security.MessageDigest
import java.time.LocalDateTime

@Service
class CommentService(
    private val commentRepository: CommentRepository,
    private val placeService: PlaceService
) {

    // 댓글 작성
    fun createComment(placeId: String, request: CommentCreateRequest): CommentResponse {
        // 대댓글인 경우 부모 댓글이 존재하는지 확인
        if (request.parentId != null) {
            val parentComment = commentRepository.findById(request.parentId)
                .orElseThrow { IllegalArgumentException("부모 댓글을 찾을 수 없습니다.") }

            // 부모 댓글이 삭제되었는지 확인
            if (parentComment.isDeleted) {
                throw IllegalArgumentException("삭제된 댓글에는 답글을 작성할 수 없습니다.")
            }

            // 대댓글의 대댓글은 허용하지 않음 (2뎁스까지만)
            if (parentComment.parentId != null) {
                throw IllegalArgumentException("대댓글에는 댓글을 작성할 수 없습니다.")
            }
        }

        val comment = Comment(
            placeId = placeId,
            parentId = request.parentId,
            nickname = request.nickname,
            password = hashPassword(request.password),
            content = request.content
        )

        val savedComment = commentRepository.save(comment)

        // 댓글 수 업데이트
        updatePlaceCommentCount(placeId)

        return mapToResponse(savedComment)
    }

    // 댓글 수정
    fun updateComment(commentId: String, request: CommentUpdateRequest): CommentResponse {
        val comment = commentRepository.findById(commentId)
            .orElseThrow { IllegalArgumentException("댓글을 찾을 수 없습니다.") }

        if (comment.isDeleted) {
            throw IllegalArgumentException("삭제된 댓글입니다.")
        }

        if (!verifyPassword(request.password, comment.password)) {
            throw IllegalArgumentException("비밀번호가 일치하지 않습니다.")
        }

        val updatedComment = comment.copy(
            content = request.content,
            updatedAt = LocalDateTime.now()
        )

        val savedComment = commentRepository.save(updatedComment)
        return mapToResponse(savedComment)
    }

    // 댓글 삭제
    fun deleteComment(commentId: String, request: CommentDeleteRequest) {
        val comment = commentRepository.findById(commentId)
            .orElseThrow { IllegalArgumentException("댓글을 찾을 수 없습니다.") }

        if (comment.isDeleted) {
            throw IllegalArgumentException("이미 삭제된 댓글입니다.")
        }

        if (!verifyPassword(request.password, comment.password)) {
            throw IllegalArgumentException("비밀번호가 일치하지 않습니다.")
        }

        // 삭제할 댓글 수를 미리 계산 (부모댓글 + 자식댓글들)
        var deletedCount = 1L // 현재 댓글

        // 부모댓글인 경우 자식댓글들도 함께 삭제
        if (comment.parentId == null) {
            val childComments = commentRepository.findByParentId(comment.id!!)

            // 자식댓글들 삭제
            childComments.forEach { childComment ->
                if (!childComment.isDeleted) {
                    val deletedChildComment = childComment.copy(
                        isDeleted = true,
                        updatedAt = LocalDateTime.now()
                    )
                    commentRepository.save(deletedChildComment)
                    deletedCount++
                }
            }
        }

        // 부모댓글 삭제
        val deletedComment = comment.copy(
            isDeleted = true,
            updatedAt = LocalDateTime.now()
        )

        commentRepository.save(deletedComment)

        // 댓글 수 업데이트
        updatePlaceCommentCount(comment.placeId)
    }

    // 댓글 목록 조회 (페이징)
    fun getComments(placeId: String, page: Int, size: Int): CommentPageResponse {
        val pageable: Pageable = PageRequest.of(page, size)
        val commentsPage = commentRepository.findByPlaceIdAndParentIdIsNullAndIsDeletedFalseOrderByCreatedAtDesc(
            placeId, pageable
        )

        val commentsWithReplies = commentsPage.content.map { comment ->
            val replies = commentRepository.findByParentIdAndIsDeletedFalseOrderByCreatedAtAsc(comment.id!!)
                .map { mapToResponse(it) }
            mapToResponse(comment).copy(replies = replies)
        }

        return CommentPageResponse(
            content = commentsWithReplies,
            totalPages = commentsPage.totalPages,
            totalElements = commentsPage.totalElements,
            currentPage = page,
            size = size
        )
    }

    // 댓글 수 조회
    fun getCommentCount(placeId: String): Long {
        return commentRepository.countByPlaceIdAndIsDeletedFalse(placeId)
    }

    // 장소의 댓글 수 업데이트
    private fun updatePlaceCommentCount(placeId: String) {
        val commentCount = commentRepository.countByPlaceIdAndIsDeletedFalse(placeId)
        placeService.updateCommentCount(placeId, commentCount)
    }

    // 비밀번호 해시화
    private fun hashPassword(password: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val hash = digest.digest(password.toByteArray())
        return hash.joinToString("") { "%02x".format(it) }
    }

    // 비밀번호 검증
    private fun verifyPassword(inputPassword: String, hashedPassword: String): Boolean {
        return hashPassword(inputPassword) == hashedPassword
    }

    // Comment를 CommentResponse로 변환
    private fun mapToResponse(comment: Comment): CommentResponse {
        return CommentResponse(
            id = comment.id!!,
            placeId = comment.placeId,
            parentId = comment.parentId,
            nickname = comment.nickname,
            content = if (comment.isDeleted) "삭제된 댓글입니다." else comment.content,
            createdAt = comment.createdAt,
            updatedAt = comment.updatedAt,
            isDeleted = comment.isDeleted
        )
    }
}
