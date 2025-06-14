package com.cardano.foundation.candidateapp.dto.candidate;

import com.cardano.foundation.candidateapp.model.candidate.CandidateType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateResponseDto {
    private Long id;
    private CandidateType candidateType;
    private String name;
    private String email;
    private String country;

    private String coldCredentials;
    private String governanceActionRationale;

    private String socialX;
    private String socialLinkedin;
    private String socialDiscord;
    private String socialTelegram;
    private String socialOther;
    private String socialWebsite;

    private String publicContact;

    private String about;
    private String bio;
    private String additionalInfo;
    private String videoPresentationLink;

    private String reasonToServe;
    private String governanceExperience;
    private String communicationStrategy;
    private String ecosystemContributions;
    private String legalExpertise;

    private String weeklyCommitmentHours;

    private String XVerification;
    private String conflictOfInterest;
    private String drepId;
    private String stakeId;

    private String walletAddress;
    private boolean verified;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
