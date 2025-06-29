package com.millo.hayoungplace.config

import com.millo.hayoungplace.jwt.JwtProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration

/**
 * 설정 프로퍼티 클래스들을 활성화하는 설정 클래스
 */
@Configuration
@EnableConfigurationProperties(
    JwtProperties::class
)
class PropertiesConfig
