package com.millo.hayoungplace.party.repository

import com.millo.hayoungplace.party.domain.PartyMember
import org.springframework.data.mongodb.repository.MongoRepository

interface PartyMemberRepository : MongoRepository<PartyMember, String> {
    fun findByPartyIdOrderByJoinedAtAsc(partyId: String): List<PartyMember>
    fun findByPartyIdAndNickname(partyId: String, nickname: String): PartyMember?
    fun countByPartyId(partyId: String): Long
    fun deleteByPartyId(partyId: String)
    fun deleteByPartyIdAndNickname(partyId: String, nickname: String)
}
