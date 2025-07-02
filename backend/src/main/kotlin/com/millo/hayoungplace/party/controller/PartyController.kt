package com.millo.hayoungplace.party.controller

import com.millo.hayoungplace.party.dto.*
import com.millo.hayoungplace.party.service.PartyService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/parties")
@CrossOrigin(origins = ["*"])
class PartyController(
    private val partyService: PartyService
) {

    @GetMapping
    fun getAllParties(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "5") size: Int
    ): ResponseEntity<Page<PartyResponse>> {
        val pageable: Pageable = PageRequest.of(page, size)
        val parties = partyService.getAllParties(pageable)
        return ResponseEntity.ok(parties)
    }

    @GetMapping("/{id}")
    fun getPartyById(@PathVariable id: String): ResponseEntity<PartyResponse> {
        val party = partyService.getPartyById(id)
        return ResponseEntity.ok(party)
    }

    @PostMapping
    fun createParty(@RequestBody request: PartyCreateRequest): ResponseEntity<PartyResponse> {
        val party = partyService.createParty(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(party)
    }

    @PutMapping("/{id}")
    fun updateParty(
        @PathVariable id: String,
        @RequestBody request: PartyUpdateRequest,
        @RequestHeader("X-Password") password: String
    ): ResponseEntity<PartyResponse> {
        val party = partyService.updateParty(id, request, password)
        return ResponseEntity.ok(party)
    }

    @DeleteMapping("/{id}")
    fun deleteParty(
        @PathVariable id: String,
        @RequestBody request: PasswordRequest
    ): ResponseEntity<Void> {
        partyService.deleteParty(id, request.password)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{id}/join")
    fun joinParty(
        @PathVariable id: String,
        @RequestBody request: PartyMemberRequest
    ): ResponseEntity<PartyMemberResponse> {
        val member = partyService.joinParty(id, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(member)
    }

    @DeleteMapping("/{id}/leave")
    fun leaveParty(
        @PathVariable id: String,
        @RequestParam nickname: String,
        @RequestBody request: PasswordRequest
    ): ResponseEntity<Void> {
        partyService.leaveParty(id, nickname, request.password)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{id}/members")
    fun getPartyMembers(@PathVariable id: String): ResponseEntity<List<PartyMemberResponse>> {
        val members = partyService.getPartyMembers(id)
        return ResponseEntity.ok(members)
    }
}
