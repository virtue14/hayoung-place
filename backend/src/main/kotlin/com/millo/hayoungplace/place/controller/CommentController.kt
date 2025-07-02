package com.millo.hayoungplace.place.controller

import com.millo.hayoungplace.place.dto.*
import com.millo.hayoungplace.place.service.CommentService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/places/{placeId}/comments")
@Tag(name = "댓글", description = "장소 댓글 관리 API")
@CrossOrigin(origins = ["http://localhost:3000"])
class CommentController(
    private val commentService: CommentService
) {

    @PostMapping
    @Operation(summary = "댓글 작성", description = "특정 장소에 댓글을 작성합니다.")
    fun createComment(
        @PathVariable placeId: String,
        @RequestBody request: CommentCreateRequest
    ): ResponseEntity<CommentResponse> {
        val comment = commentService.createComment(placeId, request)
        return ResponseEntity.ok(comment)
    }

    @GetMapping
    @Operation(summary = "댓글 목록 조회", description = "특정 장소의 댓글 목록을 페이징으로 조회합니다.")
    fun getComments(
        @PathVariable placeId: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "5") size: Int
    ): ResponseEntity<CommentPageResponse> {
        val comments = commentService.getComments(placeId, page, size)
        return ResponseEntity.ok(comments)
    }

    @GetMapping("/count")
    @Operation(summary = "댓글 수 조회", description = "특정 장소의 총 댓글 수를 조회합니다.")
    fun getCommentCount(@PathVariable placeId: String): ResponseEntity<Map<String, Long>> {
        val count = commentService.getCommentCount(placeId)
        return ResponseEntity.ok(mapOf("count" to count))
    }

    @PutMapping("/{commentId}")
    @Operation(summary = "댓글 수정", description = "댓글을 수정합니다.")
    fun updateComment(
        @PathVariable placeId: String,
        @PathVariable commentId: String,
        @RequestBody request: CommentUpdateRequest
    ): ResponseEntity<CommentResponse> {
        val comment = commentService.updateComment(commentId, request)
        return ResponseEntity.ok(comment)
    }

    @DeleteMapping("/{commentId}")
    @Operation(summary = "댓글 삭제", description = "댓글을 삭제합니다.")
    fun deleteComment(
        @PathVariable placeId: String,
        @PathVariable commentId: String,
        @RequestBody request: CommentDeleteRequest
    ): ResponseEntity<Void> {
        commentService.deleteComment(commentId, request)
        return ResponseEntity.ok().build()
    }
}
