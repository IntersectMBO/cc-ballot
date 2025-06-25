package org.cardano.foundation.voting.domain;

import lombok.*;
import org.cardano.foundation.voting.domain.entity.VoteMerkleProof;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class VoteMerkleProofForDRep {
    private String dRepId;
    private VoteMerkleProof proof;
}
