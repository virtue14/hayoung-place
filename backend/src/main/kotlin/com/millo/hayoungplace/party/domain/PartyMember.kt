package com.millo.hayoungplace.party.domain

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

@Document(collection = "party_members")
data class PartyMember(
    @Id
    val id: String? = null,
    val partyId: String,
    val nickname: String,
    val password: String,
    val isCreator: Boolean = false,
    val joinedAt: LocalDateTime = LocalDateTime.now()
)
