package com.millo.hayoungplace.party.service

import com.millo.hayoungplace.party.domain.Party
import com.millo.hayoungplace.party.domain.PartyMember
import com.millo.hayoungplace.party.domain.PartyStatus
import com.millo.hayoungplace.party.dto.*
import com.millo.hayoungplace.party.repository.PartyRepository
import com.millo.hayoungplace.party.repository.PartyMemberRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit

@Service
@Transactional
class PartyService(
    private val partyRepository: PartyRepository,
    private val partyMemberRepository: PartyMemberRepository
) {

    fun getAllParties(pageable: Pageable): Page<PartyResponse> {
        return partyRepository.findAllByOrderByCreatedAtDesc(pageable)
            .map { party -> convertToResponse(party) }
    }

    fun getPartyById(id: String): PartyResponse {
        val party = partyRepository.findById(id)
            .orElseThrow { IllegalArgumentException("파티를 찾을 수 없습니다.") }
        return convertToResponse(party)
    }

    fun createParty(request: PartyCreateRequest): PartyResponse {
        val party = Party(
            title = request.title,
            description = request.description,
            location = request.location,
            date = request.date,
            maxMembers = request.maxMembers,
            tags = request.tags,
            nickname = request.nickname,
            password = request.password
        )

        val savedParty = partyRepository.save(party)

        // 파티 생성자를 파티원으로 추가
        val creator = PartyMember(
            partyId = savedParty.id!!,
            nickname = request.nickname,
            password = request.password,
            isCreator = true
        )
        partyMemberRepository.save(creator)

        return convertToResponse(savedParty)
    }

    fun updateParty(id: String, request: PartyUpdateRequest, password: String): PartyResponse {
        val party = partyRepository.findById(id)
            .orElseThrow { IllegalArgumentException("파티를 찾을 수 없습니다.") }

        if (party.password != password) {
            throw IllegalArgumentException("비밀번호가 일치하지 않습니다.")
        }

        val updatedParty = party.copy(
            title = request.title,
            description = request.description,
            location = request.location,
            date = request.date,
            maxMembers = request.maxMembers,
            tags = request.tags,
            status = request.status ?: party.status,
            updatedAt = LocalDateTime.now()
        )

        val savedParty = partyRepository.save(updatedParty)
        return convertToResponse(savedParty)
    }

    fun deleteParty(id: String, password: String) {
        val party = partyRepository.findById(id)
            .orElseThrow { IllegalArgumentException("파티를 찾을 수 없습니다.") }

        if (party.password != password) {
            throw IllegalArgumentException("비밀번호가 일치하지 않습니다.")
        }

        partyMemberRepository.deleteByPartyId(id)
        partyRepository.deleteById(id)
    }

    fun joinParty(partyId: String, request: PartyMemberRequest): PartyMemberResponse {
        val party = partyRepository.findById(partyId)
            .orElseThrow { IllegalArgumentException("파티를 찾을 수 없습니다.") }

        if (party.status == PartyStatus.COMPLETED) {
            throw IllegalArgumentException("모집이 완료된 파티입니다.")
        }

        // 이미 참여한 회원인지 확인
        val existingMember = partyMemberRepository.findByPartyIdAndNickname(partyId, request.nickname)
        if (existingMember != null) {
            throw IllegalArgumentException("이미 참여한 파티입니다.")
        }

        // 최대 인원 확인
        val currentMemberCount = partyMemberRepository.countByPartyId(partyId)
        if (party.maxMembers != null && currentMemberCount >= party.maxMembers) {
            throw IllegalArgumentException("파티 인원이 가득 찼습니다.")
        }

        val member = PartyMember(
            partyId = partyId,
            nickname = request.nickname,
            password = request.password,
            isCreator = false
        )

        val savedMember = partyMemberRepository.save(member)

        // 파티가 가득 찬 경우 상태를 모집완료로 변경
        val newMemberCount = currentMemberCount + 1
        if (party.maxMembers != null && newMemberCount >= party.maxMembers) {
            val completedParty = party.copy(status = PartyStatus.COMPLETED, updatedAt = LocalDateTime.now())
            partyRepository.save(completedParty)
        }

        return PartyMemberResponse(
            id = savedMember.id,
            nickname = savedMember.nickname,
            isCreator = savedMember.isCreator,
            joinedAt = savedMember.joinedAt
        )
    }

    fun leaveParty(partyId: String, nickname: String, password: String) {
        val member = partyMemberRepository.findByPartyIdAndNickname(partyId, nickname)
            ?: throw IllegalArgumentException("파티원을 찾을 수 없습니다.")

        if (member.password != password) {
            throw IllegalArgumentException("비밀번호가 일치하지 않습니다.")
        }

        if (member.isCreator) {
            throw IllegalArgumentException("파티장은 탈퇴할 수 없습니다.")
        }

        partyMemberRepository.deleteByPartyIdAndNickname(partyId, nickname)

        // 파티 상태를 모집중으로 변경 (모집완료였던 경우)
        val party = partyRepository.findById(partyId)
            .orElseThrow { IllegalArgumentException("파티를 찾을 수 없습니다.") }

        if (party.status == PartyStatus.COMPLETED) {
            val reopenedParty = party.copy(status = PartyStatus.RECRUITING, updatedAt = LocalDateTime.now())
            partyRepository.save(reopenedParty)
        }
    }

    fun getPartyMembers(partyId: String): List<PartyMemberResponse> {
        return partyMemberRepository.findByPartyIdOrderByJoinedAtAsc(partyId)
            .map { member ->
                PartyMemberResponse(
                    id = member.id,
                    nickname = member.nickname,
                    isCreator = member.isCreator,
                    joinedAt = member.joinedAt
                )
            }
    }

    private fun convertToResponse(party: Party): PartyResponse {
        val currentMembers = partyMemberRepository.countByPartyId(party.id!!).toInt()
        val dDay = calculateDDay(party.date)

        return PartyResponse(
            id = party.id,
            title = party.title,
            status = party.status,
            description = party.description,
            location = party.location,
            date = party.date,
            maxMembers = party.maxMembers,
            currentMembers = currentMembers,
            tags = party.tags,
            nickname = party.nickname,
            createdAt = party.createdAt,
            dDay = dDay
        )
    }

    private fun calculateDDay(partyDate: LocalDateTime): Long {
        val now = LocalDateTime.now()
        return ChronoUnit.DAYS.between(now.toLocalDate(), partyDate.toLocalDate())
    }
}
