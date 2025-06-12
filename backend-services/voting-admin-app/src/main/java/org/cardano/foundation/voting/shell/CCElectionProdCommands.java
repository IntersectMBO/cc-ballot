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

import static org.cardano.foundation.voting.domain.CardanoNetwork.MAIN;
import static org.cardano.foundation.voting.domain.SchemaVersion.V1;
import static org.cardano.foundation.voting.domain.VotingEventType.USER_BASED;
import static org.cardano.foundation.voting.utils.MoreUUID.shortUUID;

@ShellComponent
@Slf4j
@RequiredArgsConstructor
public class CCElectionProdCommands {

    private final static String EVENT_NAME = "CC-Elections-2025";

    private final L1SubmissionService l1SubmissionService;

    private final CardanoNetwork network;

    @ShellMethod(key = "create_prod_test_vote", value = "Create My Voting Event on a MAINNET network.")
    public String createMyVotingEvent() {
        if (network != MAIN) {
            return "This command can only be run on MAINNET network!";
        }

        var createEventCommand = CreateEventCommand.builder()
                .id(EVENT_NAME)
                .startSlot(Optional.of(93787979L))
                .endSlot(Optional.of(98778727L))
                .votingPowerAsset(Optional.empty())
                .organisers("IntersectMBO")
                .votingEventType(USER_BASED)
                .schemaVersion(V1)
                .allowVoteChanging(true)
                .highLevelEventResultsWhileVoting(true)
                .highLevelCategoryResultsWhileVoting(true)
                .categoryResultsWhileVoting(false)
                .proposalsRevealSlot(Optional.of(98878727L))
                .build();

        l1SubmissionService.submitEvent(createEventCommand);

        return "Created My Event: " + createEventCommand;
    }

    @ShellMethod(key = "create_my_voting_category1-prod", value = "Create a my voting category1 on Mainnet.")
    public String create1Category1(@ShellOption String event) {
        if (network != MAIN) {
            return "This command can only be run on a MAINNET network!";
        }

        Proposal n1 = Proposal.builder()
                .id(UUID.randomUUID().toString())
                .name("Option 1")
                .build();

        List<Proposal> allProposals = List.of(n1);

        CreateCategoryCommand createCategoryCommand = CreateCategoryCommand.builder()
                .id("CATEGORY" + "_" + shortUUID(4))
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