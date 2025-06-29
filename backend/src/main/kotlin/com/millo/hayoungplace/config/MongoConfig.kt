package com.millo.hayoungplace.config

import com.mongodb.client.MongoClient
import com.mongodb.client.MongoClients
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.mongodb.core.MongoTemplate

@Configuration
class MongoConfig(
    @Value("\${spring.data.mongodb.uri}") private val mongoUri: String
) {

    @Bean
    fun mongoClient(): MongoClient {
        return MongoClients.create(mongoUri)
    }

    @Bean
    fun mongoTemplate(): MongoTemplate {
        return MongoTemplate(mongoClient(), getDatabaseNameFromUri(mongoUri))
    }

    private fun getDatabaseNameFromUri(uri: String): String {
        val regex = Regex("mongodb(\\+srv)?://[^/]+/([^?]+)")
        return regex.find(uri)?.groupValues?.get(2)
            ?: throw IllegalArgumentException("Cannot extract DB name from URI: $uri")
    }
}
