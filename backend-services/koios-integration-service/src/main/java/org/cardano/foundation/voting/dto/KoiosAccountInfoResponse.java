package org.cardano.foundation.voting.dto;

import lombok.Data;

@Data
public class KoiosAccountInfoResponse {
    private String stake_address;
    private String status;
    private String delegated_pool;
    private String delegated_drep;
    private String total_balance;
    private String utxo;
    private String rewards;
    private String withdrawals;
    private String rewards_available;
    private String deposit;
    private String reserves;
    private String treasury;
    private String proposal_refund;
}