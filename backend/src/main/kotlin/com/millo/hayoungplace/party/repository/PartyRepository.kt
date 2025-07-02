package com.millo.hayoungplace.party.repository

import com.millo.hayoungplace.party.domain.Party
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.MongoRepository

interface PartyRepository : MongoRepository<Party, String> {
    fun findAllByOrderByCreatedAtDesc(pageable: Pageable): Page<Party>
}
