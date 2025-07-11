package com.millo.hayoungplace.config

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.context.request.WebRequest
import java.time.LocalDateTime

/**
 * API 오류 응답 데이터 클래스
 */
data class ErrorResponse(
    val timestamp: LocalDateTime = LocalDateTime.now(),
    val status: Int,
    val error: String,
    val message: String,
    val path: String
)

/**
 * 중복된 장소 등록 시 발생하는 예외
 */
class DuplicatePlaceException(message: String) : RuntimeException(message)

/**
 * 장소를 찾을 수 없을 때 발생하는 예외
 */
class PlaceNotFoundException(message: String) : RuntimeException(message)

/**
 * 비밀번호가 일치하지 않을 때 발생하는 예외
 */
class InvalidPasswordException(message: String) : RuntimeException(message)

/**
 * 전역 예외 처리를 담당하는 핸들러
 */
@RestControllerAdvice
class GlobalExceptionHandler {

    /**
     * 중복된 장소 등록 예외 처리
     */
    @ExceptionHandler(DuplicatePlaceException::class)
    fun handleDuplicatePlaceException(
        ex: DuplicatePlaceException,
        request: WebRequest
    ): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(
            status = HttpStatus.CONFLICT.value(),
            error = "Duplicate Place",
            message = ex.message ?: "이미 등록된 장소입니다.",
            path = request.getDescription(false).removePrefix("uri=")
        )
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse)
    }

    /**
     * 장소를 찾을 수 없는 예외 처리
     */
    @ExceptionHandler(PlaceNotFoundException::class)
    fun handlePlaceNotFoundException(
        ex: PlaceNotFoundException,
        request: WebRequest
    ): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(
            status = HttpStatus.NOT_FOUND.value(),
            error = "Place Not Found",
            message = ex.message ?: "장소를 찾을 수 없습니다.",
            path = request.getDescription(false).removePrefix("uri=")
        )
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse)
    }

    /**
     * 비밀번호 불일치 예외 처리
     */
    @ExceptionHandler(InvalidPasswordException::class)
    fun handleInvalidPasswordException(
        ex: InvalidPasswordException,
        request: WebRequest
    ): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(
            status = HttpStatus.FORBIDDEN.value(),
            error = "Invalid Password",
            message = ex.message ?: "비밀번호가 일치하지 않습니다.",
            path = request.getDescription(false).removePrefix("uri=")
        )
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse)
    }

    /**
     * Security 예외 처리
     */
    @ExceptionHandler(SecurityException::class)
    fun handleSecurityException(
        ex: SecurityException,
        request: WebRequest
    ): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(
            status = HttpStatus.FORBIDDEN.value(),
            error = "Security Error",
            message = ex.message ?: "접근이 거부되었습니다.",
            path = request.getDescription(false).removePrefix("uri=")
        )
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse)
    }

    /**
     * 요소를 찾을 수 없는 예외 처리
     */
    @ExceptionHandler(NoSuchElementException::class)
    fun handleNoSuchElementException(
        ex: NoSuchElementException,
        request: WebRequest
    ): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(
            status = HttpStatus.NOT_FOUND.value(),
            error = "Not Found",
            message = ex.message ?: "요청한 리소스를 찾을 수 없습니다.",
            path = request.getDescription(false).removePrefix("uri=")
        )
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse)
    }

    /**
     * 잘못된 인수 예외 처리
     */
    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(
        ex: IllegalArgumentException,
        request: WebRequest
    ): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(
            status = HttpStatus.BAD_REQUEST.value(),
            error = "Bad Request",
            message = ex.message ?: "잘못된 요청입니다.",
            path = request.getDescription(false).removePrefix("uri=")
        )
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse)
    }

    /**
     * 일반적인 예외 처리
     */
    @ExceptionHandler(Exception::class)
    fun handleGeneralException(
        ex: Exception,
        request: WebRequest
    ): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(
            status = HttpStatus.INTERNAL_SERVER_ERROR.value(),
            error = "Internal Server Error",
            message = "서버에서 오류가 발생했습니다.",
            path = request.getDescription(false).removePrefix("uri=")
        )
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse)
    }
}
