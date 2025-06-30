package com.millo.hayoungplace.user.controller

import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/users")
class UserController {

    @GetMapping("/me")
    fun getCurrentUser(@AuthenticationPrincipal userDetails: UserDetails?): Map<String, Any?> {
        if (userDetails == null) {
            throw IllegalStateException("인증된 사용자를 찾을 수 없습니다.")
        }

        return mapOf(
            "email" to userDetails.username,
            "authorities" to userDetails.authorities.map { it.authority }
        )
    }
}
