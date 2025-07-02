package com.millo.hayoungplace.config

import com.millo.hayoungplace.place.domain.Place
import com.millo.hayoungplace.place.domain.SubCategory
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Service
import java.security.MessageDigest

@Service
class DataMigrationService(
    private val mongoTemplate: MongoTemplate
) : CommandLineRunner {

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(DataMigrationService::class.java)
        private const val DEFAULT_PASSWORD = "1234" // 기본 비밀번호
    }

    override fun run(vararg args: String?) {
        migrateExistingPlaces()
    }

    private fun migrateExistingPlaces() {
        try {
            logger.info("Starting Place data migration...")

            // viewCount 필드가 없는 문서들을 찾아서 업데이트
            val queryWithoutViewCount = Query(Criteria.where("viewCount").exists(false))
            val updateViewCount = Update().set("viewCount", 0)
            val viewCountResult = mongoTemplate.updateMulti(queryWithoutViewCount, updateViewCount, Place::class.java)
            logger.info("Updated ${viewCountResult.modifiedCount} places with viewCount field")

            // password 필드가 없는 문서들을 찾아서 업데이트
            val queryWithoutPassword = Query(Criteria.where("password").exists(false))
            val hashedDefaultPassword = hashPassword(DEFAULT_PASSWORD)
            val updatePassword = Update().set("password", hashedDefaultPassword)
            val passwordResult = mongoTemplate.updateMulti(queryWithoutPassword, updatePassword, Place::class.java)
            logger.info("Updated ${passwordResult.modifiedCount} places with password field")

            // subCategory 필드가 없는 문서들을 찾아서 업데이트
            val queryWithoutSubCategory = Query(Criteria.where("subCategory").exists(false))
            val updateSubCategory = Update().set("subCategory", SubCategory.NONE)
            val subCategoryResult = mongoTemplate.updateMulti(queryWithoutSubCategory, updateSubCategory, Place::class.java)
            logger.info("Updated ${subCategoryResult.modifiedCount} places with subCategory field")

            logger.info("Place data migration completed successfully!")

        } catch (e: Exception) {
            logger.error("Error during Place data migration: ${e.message}", e)
        }
    }

    private fun hashPassword(password: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val hash = digest.digest(password.toByteArray())
        return hash.joinToString("") { "%02x".format(it) }
    }
}
