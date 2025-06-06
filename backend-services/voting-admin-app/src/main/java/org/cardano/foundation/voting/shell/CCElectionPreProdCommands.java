package org.cardano.foundation.voting.shell;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.cardano.foundation.voting.domain.*;
import org.cardano.foundation.voting.service.transaction_submit.L1SubmissionService;
import org.springframework.shell.standard.ShellComponent;
import org.springframework.shell.standard.ShellMethod;
import org.springframework.shell.standard.ShellOption;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.cardano.foundation.voting.domain.CardanoNetwork.PREPROD;
import static org.cardano.foundation.voting.domain.SchemaVersion.V1;
import static org.cardano.foundation.voting.domain.VotingEventType.STAKE_BASED;
import static org.cardano.foundation.voting.domain.VotingPowerAsset.ADA;
import static org.cardano.foundation.voting.utils.MoreUUID.shortUUID;
import static org.cardano.foundation.voting.domain.VotingEventType.USER_BASED;

@ShellComponent
@Slf4j
@RequiredArgsConstructor
public class CCElectionPreProdCommands {

    private final static String EVENT_NAME = "DREP_TEST_VOTE";

    private final L1SubmissionService l1SubmissionService;

    private final CardanoNetwork network;

    @ShellMethod(key = "create_pre_prod_test_vote", value = "Create My Voting Event on a PRE-PROD network.")
    public String createMyVotingEvent() {
        if (network != PREPROD) {
            return "This command can only be run on PRE-PROD network!";
        }
        log.info("Creating My Voting Event on PRE-PROD network...");

        long startSlot = 139544;
        long endSlot = startSlot + 1000000;

        var createEventCommand = CreateEventCommand.builder()
                .id(EVENT_NAME)
                .startSlot(Optional.of(startSlot))
                .endSlot(Optional.of(endSlot))
                .votingPowerAsset(Optional.empty())
                .organisers("RYAN")
                .votingEventType(USER_BASED)
                .schemaVersion(V1)
                .allowVoteChanging(true)
                .highLevelEventResultsWhileVoting(true)
                .highLevelCategoryResultsWhileVoting(true)
                .categoryResultsWhileVoting(false)
                .proposalsRevealSlot(Optional.of(endSlot + 1))
                .build();

        l1SubmissionService.submitEvent(createEventCommand);

        return "Created My Event: " + createEventCommand;
    }

    @ShellMethod(key = "create_my_voting_category1-pre-prod", value = "Create a my voting category1 on pre-prod.")
    public String create1Category1(@ShellOption String event) {
        if (network != PREPROD) {
            return "This command can only be run on a PRE-PROD network!";
        }

        List<Proposal> allProposals = List.of(
                Proposal.builder().id(UUID.randomUUID().toString()).name("Candidate 1").build(),
                Proposal.builder().id(UUID.randomUUID().toString()).name("Candidate 2").build(),
                Proposal.builder().id(UUID.randomUUID().toString()).name("Candidate 3").build(),
                Proposal.builder().id(UUID.randomUUID().toString()).name("Candidate 4").build(),
                Proposal.builder().id(UUID.randomUUID().toString()).name("Candidate 5").build(),
                Proposal.builder().id(UUID.randomUUID().toString()).name("Candidate 6").build(),
                Proposal.builder().id(UUID.randomUUID().toString()).name("Candidate 7").build(),
                Proposal.builder().id(UUID.randomUUID().toString()).name("Candidate 8").build(),
                Proposal.builder().id(UUID.randomUUID().toString()).name("Candidate 9").build(),
                Proposal.builder().id(UUID.randomUUID().toString()).name("Candidate 10").build(),
                Proposal.builder().id(UUID.randomUUID().toString()).name("Candidate 11").build(),
                Proposal.builder().id(UUID.randomUUID().toString()).name("Candidate 12").build(),
                Proposal.builder().id(UUID.randomUUID().toString()).name("Candidate 13").build(),
                Proposal.builder().id(UUID.randomUUID().toString()).name("Candidate 14").build(),
                Proposal.builder().id(UUID.randomUUID().toString()).name("Candidate 15").build(),
                Proposal.builder().id(UUID.randomUUID().toString()).name("Candidate 16").build(),
                Proposal.builder().id(UUID.randomUUID().toString()).name("Candidate 17").build(),
                Proposal.builder().id(UUID.randomUUID().toString()).name("Candidate 18").build(),
                Proposal.builder().id(UUID.randomUUID().toString()).name("Candidate 19").build()
        );

        CreateCategoryCommand createCategoryCommand = CreateCategoryCommand.builder()
                .id("DREP_VOTE_CATEGORY" + "_" + shortUUID(4))
                .event(event)
                .gdprProtection(true)
                .schemaVersion(V1)
                .proposals(allProposals)
                .build();

        if (allProposals.size() != new HashSet<>(allProposals).size()) {
            throw new RuntimeException("Duplicate proposals detected!");
        }

        l1SubmissionService.submitCategory(createCategoryCommand);

        return "Created category: " + createCategoryCommand;
    }
}