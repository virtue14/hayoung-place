package com.millo.hayoungplace.party.dto

import com.millo.hayoungplace.party.domain.PartyStatus
import java.time.LocalDateTime

data class PartyCreateRequest(
    val title: String,
    val description: String,
    val location: String,
    val date: LocalDateTime,
    val maxMembers: Int? = null,
    val tags: List<String> = emptyList(),
    val nickname: String,
    val password: String
)

data class PartyUpdateRequest(
    val title: String,
    val description: String,
    val location: String,
    val date: LocalDateTime,
    val maxMembers: Int? = null,
    val tags: List<String> = emptyList(),
    val status: PartyStatus? = null
)

data class PartyResponse(
    val id: String?,
    val title: String,
    val status: PartyStatus,
    val description: String,
    val location: String,
    val date: LocalDateTime,
    val maxMembers: Int?,
    val currentMembers: Int,
    val tags: List<String>,
    val nickname: String,
    val createdAt: LocalDateTime,
    val dDay: Long? = null
)

data class PartyMemberRequest(
    val nickname: String,
    val password: String
)

data class PartyMemberResponse(
    val id: String?,
    val nickname: String,
    val isCreator: Boolean,
    val joinedAt: LocalDateTime
)

data class PasswordRequest(
    val password: String
)
