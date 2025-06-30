package org.cardano.foundation.voting.service.leader_board;

import com.bloxbean.cardano.client.crypto.Bech32;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.vavr.control.Either;
import org.cardano.foundation.voting.client.BlackfrostIntegrationClient;
import org.cardano.foundation.voting.client.ChainFollowerClient;
import org.cardano.foundation.voting.client.GovToolsClient;
import org.cardano.foundation.voting.domain.CandidatePayload;
import org.cardano.foundation.voting.domain.Leaderboard;
import org.cardano.foundation.voting.domain.entity.Vote;
import org.cardano.foundation.voting.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Problem;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toMap;
import static org.zalando.problem.Status.*;

@Service
@Qualifier("db_leaderboard_winners_service")
public class DBLeaderboardWinnersService extends AbstractWinnersService implements LeaderboardWinnersService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private GovToolsClient govToolsClient;

    @Autowired
    private BlackfrostIntegrationClient blackfrostIntegrationClient;

    @Override
    @Transactional(readOnly = true)
    public Either<Problem, Optional<Leaderboard.ByProposalsInCategoryStats>> getCategoryLeaderboard(String event,
                                                                                                    String category,
                                                                                                    boolean forceLeaderboard) {
        var eventDetailsE = chainFollowerClient.getEventDetails(event);
        if (eventDetailsE.isEmpty()) {
            return Either.left(Problem.builder()
                    .withTitle("ERROR_GETTING_EVENT_DETAILS")
                    .withDetail("Unable to get event details from chain-tip follower service, event:" + event)
                    .withStatus(INTERNAL_SERVER_ERROR)
                    .build()
            );
        }
        var maybeEventDetails = eventDetailsE.get();
        if (maybeEventDetails.isEmpty()) {
            return Either.left(Problem.builder()
                    .withTitle("UNRECOGNISED_EVENT")
                    .withDetail("Unrecognised event, event:" + event)
                    .withStatus(BAD_REQUEST)
                    .build()
            );
        }
        var eventDetails = maybeEventDetails.orElseThrow();

        var maybeCategory = eventDetails.categoryDetailsById(category);

        if (maybeCategory.isEmpty()) {
            return Either.left(Problem.builder()
                    .withTitle("UNRECOGNISED_CATEGORY")
                    .withDetail("Unrecognised category, category:" + category)
                    .withStatus(BAD_REQUEST)
                    .build()
            );
        }
        var categoryDetails = maybeCategory.orElseThrow();

        return getCategoryLeaderboard(eventDetails, categoryDetails, forceLeaderboard);
    }

    @Override
    public Either<Problem, List<Leaderboard.ByProposalsInCategoryStats>> getAllCategoriesLeaderboard(String event,
                                                                                                     boolean forceLeaderboard) {
        var eventDetailsE = chainFollowerClient.getEventDetails(event);
        if (eventDetailsE.isEmpty()) {
            return Either.left(Problem.builder()
                    .withTitle("ERROR_GETTING_EVENT_DETAILS")
                    .withDetail("Unable to get event details from chain-tip follower service, event:" + event)
                    .withStatus(INTERNAL_SERVER_ERROR)
                    .build()
            );
        }
        var maybeEventDetails = eventDetailsE.get();
        if (maybeEventDetails.isEmpty()) {
            return Either.left(Problem.builder()
                    .withTitle("UNRECOGNISED_EVENT")
                    .withDetail("Unrecognised event, event:" + event)
                    .withStatus(BAD_REQUEST)
                    .build()
            );
        }
        var eventDetails = maybeEventDetails.orElseThrow();

        return getCategoryLeaderboardForAllCategories(eventDetails, forceLeaderboard);
    }

    @Override
    public Either<Problem, Optional<Leaderboard.ByProposalsInCategoryStats>> getCategoryLeaderboard(ChainFollowerClient.EventDetailsResponse eventDetails,
                                                                                                    ChainFollowerClient.CategoryDetailsResponse categoryDetails,
                                                                                                    boolean forceLeaderboard) {
        var categoryLeaderboardAvailableE = isCategoryLeaderboardAvailable(eventDetails, forceLeaderboard);
        if (categoryLeaderboardAvailableE.isEmpty()) {
            return Either.left(categoryLeaderboardAvailableE.getLeft());
        }

        var isCategoryLeaderBoardAvailable = categoryLeaderboardAvailableE.get();
        if (!isCategoryLeaderBoardAvailable) {
            return Either.left(Problem.builder()
                    .withTitle("VOTING_RESULTS_NOT_AVAILABLE")
                    .withDetail("Category level voting results not available until results can be revealed!")
                    .withStatus(FORBIDDEN)
                    .build()
            );
        }

        var votes = voteRepository.getCategoryLevelStats(eventDetails.id(), categoryDetails.id());

        var proposalResultsMap = votes.stream()
                .collect(toMap(VoteRepository.CategoryLevelStats::getProposalId, v -> {
                    var totalVotesCount = Optional.ofNullable(v.getTotalVoteCount()).orElse(0L);
                    var totalVotingPower = Optional.ofNullable(v.getTotalVotingPower()).map(String::valueOf).orElse("0");

                    var b = Leaderboard.Votes.builder();
                    b.votes(totalVotesCount);

                    switch (eventDetails.votingEventType()) {
                        case BALANCE_BASED, STAKE_BASED -> b.votingPower(totalVotingPower);
                    }

                    return b.build();
                }));

        return Either.right(Optional.of(Leaderboard.ByProposalsInCategoryStats.builder()
                .category(categoryDetails.id())
                .proposals(reInitialiseResultsToEmptyIfMissing(categoryDetails, proposalResultsMap, eventDetails))
                .build()));
    }

    public Either<Problem, List<Leaderboard.ByProposalsInCategoryStats>> getCategoryLeaderboardForAllCategories(ChainFollowerClient.EventDetailsResponse eventDetails,
                                                                                                                boolean forceLeaderboard) {
        var categoryLeaderboardAvailableE = isCategoryLeaderboardAvailable(eventDetails, forceLeaderboard);
        if (categoryLeaderboardAvailableE.isEmpty()) {
            return Either.left(categoryLeaderboardAvailableE.getLeft());
        }

        var isCategoryLeaderBoardAvailable = categoryLeaderboardAvailableE.get();
        if (!isCategoryLeaderBoardAvailable) {
            return Either.left(Problem.builder()
                    .withTitle("VOTING_RESULTS_NOT_AVAILABLE")
                    .withDetail("Category level voting results not available until results can be revealed!")
                    .withStatus(FORBIDDEN)
                    .build()
            );
        }

        var allResultsForAllCategories = eventDetails.categories()
                .stream()
                .map(categoryDetails -> {
                    var categoryStats = voteRepository.getCategoryLevelStats(eventDetails.id(), categoryDetails.id());

                    var results = categoryStats.stream()
                            .collect(toMap(VoteRepository.CategoryLevelStats::getProposalId, v -> {
                                var totalVotesCount = Optional.ofNullable(v.getTotalVoteCount()).orElse(0L);
                                var totalVotingPower = Optional.ofNullable(v.getTotalVotingPower()).map(String::valueOf).orElse("0");

                                var b = Leaderboard.Votes.builder();
                                b.votes(totalVotesCount);

                                switch (eventDetails.votingEventType()) {
                                    case BALANCE_BASED, STAKE_BASED -> b.votingPower(totalVotingPower);
                                }

                                return b.build();
                            }));

                    return Leaderboard.ByProposalsInCategoryStats.builder()
                            .category(categoryDetails.id())
                            .proposals(reInitialiseResultsToEmptyIfMissing(categoryDetails, results, eventDetails))
                            .build();
                })
                .toList();

        return Either.right(allResultsForAllCategories);
    }

    @Override
    @Transactional
    public Either<Problem, Optional<Leaderboard.ByCandidatesInCategoryStats>> getCategoryLeaderboardCandidate(String event,
                                                                                                             String category,
                                                                                                             boolean forceLeaderboard) {
        var eventDetailsE = chainFollowerClient.getEventDetails(event);
        if (eventDetailsE.isEmpty()) {
            return Either.left(Problem.builder()
                    .withTitle("ERROR_GETTING_EVENT_DETAILS")
                    .withDetail("Unable to get event details from chain-tip follower service, event:" + event)
                    .withStatus(INTERNAL_SERVER_ERROR)
                    .build()
            );
        }
        var maybeEventDetails = eventDetailsE.get();
        if (maybeEventDetails.isEmpty()) {
            return Either.left(Problem.builder()
                    .withTitle("UNRECOGNISED_EVENT")
                    .withDetail("Unrecognised event, event:" + event)
                    .withStatus(BAD_REQUEST)
                    .build()
            );
        }
        var eventDetails = maybeEventDetails.orElseThrow();

        var maybeCategory = eventDetails.categoryDetailsById(category);

        if (maybeCategory.isEmpty()) {
            return Either.left(Problem.builder()
                    .withTitle("UNRECOGNISED_CATEGORY")
                    .withDetail("Unrecognised category, category:" + category)
                    .withStatus(BAD_REQUEST)
                    .build()
            );
        }
        var categoryDetails = maybeCategory.orElseThrow();

        return getCategoryLeaderboardCandidate(eventDetails, categoryDetails, forceLeaderboard);
    }

    @Override
    public Either<Problem, Optional<Leaderboard.ByCandidatesInCategoryStats>> getCategoryLeaderboardCandidate(ChainFollowerClient.EventDetailsResponse eventDetails,
                                                                                                    ChainFollowerClient.CategoryDetailsResponse categoryDetails,
                                                                                                    boolean forceLeaderboard) {
        var categoryLeaderboardAvailableE = isCategoryLeaderboardAvailableForCandidates(eventDetails, forceLeaderboard);
        if (categoryLeaderboardAvailableE.isEmpty()) {
            return Either.left(categoryLeaderboardAvailableE.getLeft());
        }

        var isCategoryLeaderBoardAvailable = categoryLeaderboardAvailableE.get();
        if (!isCategoryLeaderBoardAvailable) {
            return Either.left(Problem.builder()
                    .withTitle("VOTING_RESULTS_NOT_AVAILABLE")
                    .withDetail("Category level voting results not available until results can be revealed!")
                    .withStatus(FORBIDDEN)
                    .build()
            );
        }

        var allVotes = voteRepository.findAllByEventIdAndCategoryId(eventDetails.id(), categoryDetails.id());

        Map<String, Leaderboard.Votes> votes = new HashMap<>();

        allVotes.forEach(vote -> {
            try {
                var payload = objectMapper.readValue(vote.getPayload().get(), CandidatePayload.class);
                List<Long> options;
                String walletId;
                if (payload.getData() != null) {
                    options = payload.getData().getVotes();
                    walletId = payload.getData().getWalletId();
                } else {
                    var chainPayload = objectMapper.readValue(vote.getPayload().get(), BlackfrostIntegrationClient.BlackfrostTransactionResponse.class);
                    options = chainPayload.getJson_metadata().getData().getVotes();
                    walletId = vote.getWalletId();
                }
                var hexDrepId = bytesToHex(Bech32.decode(walletId).data);
                var votingPower = vote.getVotingPower().isPresent() ? vote.getVotingPower().get() : govToolsClient.getDRepVotingPower(hexDrepId).get();
                vote.setVotingPower(Optional.of(votingPower));

                for (var option : options) {
                    var candidateVotes = votes.get(option.toString());
                    if (candidateVotes == null) {
                        candidateVotes = Leaderboard.Votes.builder().votes(0L).votingPower("0").build();
                    }
                    candidateVotes.setVotes(candidateVotes.getVotes() + 1);
                    candidateVotes.setVotingPower(Long.toString(Long.parseLong(candidateVotes.getVotingPower()) + votingPower));
                    votes.put(option.toString(), candidateVotes);
                }

            } catch (JsonProcessingException ex) {
                throw new RuntimeException(ex);
            }
        });

        var transactions = blackfrostIntegrationClient.getCastVoteTransactions(eventDetails.id(), categoryDetails.id());
        if (transactions.isRight()) {
            var votesIds = allVotes.stream().map(Vote::getId).collect(Collectors.toSet());
            transactions.get().forEach(e -> {
                if (votesIds.contains(e.getJson_metadata().getData().getId())) {
                    return;
                }
                var dRepId = blackfrostIntegrationClient.getDRepIdByTx(e.getTx_hash());
                var slot = blackfrostIntegrationClient.getSlotByTx(e.getTx_hash());
                if (dRepId.isRight() && slot.isRight()) {
                    var options = e.getJson_metadata().getData().getVotes();
                    var hexDRepId = bytesToHex(Bech32.decode(dRepId.get()).data);
                    var votingPower = govToolsClient.getDRepVotingPower(hexDRepId).get();

                    for (var option : options) {
                        var candidateVotes = votes.get(option.toString());
                        if (candidateVotes == null) {
                            candidateVotes = Leaderboard.Votes.builder().votes(0L).votingPower("0").build();
                        }
                        candidateVotes.setVotes(candidateVotes.getVotes() + 1);
                        candidateVotes.setVotingPower(Long.toString(Long.parseLong(candidateVotes.getVotingPower()) + votingPower));
                        votes.put(option.toString(), candidateVotes);
                    }

                    try {
                        allVotes.add(Vote.builder()
                                .eventId(eventDetails.id())
                                .categoryId(categoryDetails.id())
                                .id(e.getJson_metadata().getData().getId())
                                .votingPower(votingPower)
                                .proposalId(e.getJson_metadata().getData().getProposal())
                                .walletType(e.getJson_metadata().getData().getWalletType())
                                .walletId(dRepId.get())
                                .payload(objectMapper.writeValueAsString(e))
                                .votedAtSlot(slot.get())
                                .signature("NOT AVAILABLE - VOTE FROM CHAIN")
                                .publicKey("NOT AVAILABLE - VOTE FROM CHAIN")
                                .build());
                    } catch (JsonProcessingException ex) {
                        throw new RuntimeException(ex);
                    }
                }
            });
        }

        voteRepository.saveAllAndFlush(allVotes);

        return Either.right(Optional.of(Leaderboard.ByCandidatesInCategoryStats.builder()
                .category(categoryDetails.id())
                .candidatesResults(votes)
                .allVotes(allVotes)
                .build()));
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

}
