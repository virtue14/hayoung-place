package com.millo.hayoungplace.place.repository

import com.millo.hayoungplace.place.domain.Comment
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface CommentRepository : MongoRepository<Comment, String> {

    // 특정 장소의 원댓글들만 조회 (페이징)
    fun findByPlaceIdAndParentIdIsNullAndIsDeletedFalseOrderByCreatedAtDesc(
        placeId: String,
        pageable: Pageable
    ): Page<Comment>

    // 특정 장소의 모든 댓글 조회 (대댓글 포함, 통계용)
    fun findByPlaceIdAndIsDeletedFalse(placeId: String): List<Comment>

    // 특정 부모 댓글의 대댓글들 조회 (삭제되지 않은 것만)
    fun findByParentIdAndIsDeletedFalseOrderByCreatedAtAsc(parentId: String): List<Comment>

    // 특정 부모 댓글의 모든 대댓글들 조회 (삭제된 것도 포함)
    fun findByParentId(parentId: String): List<Comment>

    // 특정 장소의 댓글 수 조회
    fun countByPlaceIdAndIsDeletedFalse(placeId: String): Long
}
