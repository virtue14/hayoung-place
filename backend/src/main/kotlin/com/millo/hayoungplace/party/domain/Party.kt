package com.millo.hayoungplace.party.domain

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

@Document(collection = "parties")
data class Party(
    @Id
    val id: String? = null,
    val title: String,
    val status: PartyStatus = PartyStatus.RECRUITING,
    val description: String,
    val location: String,
    val date: LocalDateTime,
    val maxMembers: Int? = null,
    val tags: List<String> = emptyList(),
    val nickname: String,
    val password: String,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
