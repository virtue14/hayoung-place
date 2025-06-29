package com.millo.hayoungplace.jwt

import com.fasterxml.jackson.databind.ObjectMapper
import io.jsonwebtoken.JwtException
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

/**
 * JWT 토큰 처리 중 발생하는 예외를 처리하는 필터
 */
@Component
class JwtExceptionFilter(
    private val objectMapper: ObjectMapper
) : OncePerRequestFilter() {

    /**
     * JWT 토큰 처리 중 발생하는 예외를 처리하고 적절한 응답을 반환합니다.
     * @param request HTTP 요청
     * @param response HTTP 응답
     * @param filterChain 필터 체인
     */
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            filterChain.doFilter(request, response)
        } catch (e: JwtException) {
            setErrorResponse(response, e)
        }
    }

    /**
     * JWT 예외에 대한 에러 응답을 설정합니다.
     * @param response HTTP 응답
     * @param exception 발생한 예외
     */
    private fun setErrorResponse(
        response: HttpServletResponse,
        exception: JwtException
    ) {
        response.status = HttpServletResponse.SC_UNAUTHORIZED
        response.contentType = MediaType.APPLICATION_JSON_VALUE
        response.characterEncoding = "UTF-8"

        val errorResponse = mapOf(
            "status" to HttpServletResponse.SC_UNAUTHORIZED,
            "error" to "Unauthorized",
            "message" to (exception.message ?: "Invalid JWT token")
        )

        response.writer.write(objectMapper.writeValueAsString(errorResponse))
    }
}
