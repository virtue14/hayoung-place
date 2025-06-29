package com.millo.hayoungplace.config

import com.millo.hayoungplace.auth.handler.OAuth2SuccessHandler
import com.millo.hayoungplace.jwt.JwtAuthenticationFilter
import com.millo.hayoungplace.jwt.JwtExceptionFilter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

/**
 * Spring Security 설정을 담당하는 클래스
 */
@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val jwtAuthenticationFilter: JwtAuthenticationFilter,
    private val jwtExceptionFilter: JwtExceptionFilter,
    private val oauth2SuccessHandler: OAuth2SuccessHandler,
    private val corsProperties: CorsProperties
) {
    /**
     * 보안 필터 체인을 구성합니다.
     * @param http HttpSecurity 객체
     * @return 구성된 SecurityFilterChain
     */
    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        return http
            .csrf { it.disable() }
            .cors { it.configurationSource(corsConfigurationSource()) }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers(
                        "/",
                        "/error",
                        "/favicon.ico",
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/api/auth/**"
                    ).permitAll()
                    .requestMatchers("/api/users/me").authenticated()
                    .anyRequest().authenticated()
            }
            .oauth2Login { oauth2 ->
                oauth2
                    .authorizationEndpoint {
                        it.baseUri("/api/auth/oauth2/authorize")
                    }
                    .redirectionEndpoint {
                        it.baseUri("/login/oauth2/code/*")
                    }
                    .successHandler(oauth2SuccessHandler)
            }
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)
            .addFilterBefore(jwtExceptionFilter, JwtAuthenticationFilter::class.java)
            .build()
    }

    /**
     * CORS 설정을 구성합니다.
     * @return 구성된 CorsConfigurationSource
     */
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration().apply {
            allowedOrigins = corsProperties.allowedOrigins
            allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
            allowedHeaders = listOf("*")
            allowCredentials = true
            maxAge = 3600L
        }

        return UrlBasedCorsConfigurationSource().apply {
            registerCorsConfiguration("/**", configuration)
        }
    }
}
