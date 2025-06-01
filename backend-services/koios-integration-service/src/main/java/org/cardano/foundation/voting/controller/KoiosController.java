package org.cardano.foundation.voting.controller;

import lombok.RequiredArgsConstructor;
import org.cardano.foundation.voting.client.KoiosClient;
import org.cardano.foundation.voting.dto.KoiosAccountInfoResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class KoiosController {

    private final KoiosClient koiosClient;

    @GetMapping("/account-info")
    public KoiosAccountInfoResponse getAccountInfo(@RequestParam String stakeAddress) {
        return koiosClient.getAccountInfo(stakeAddress);
    }
}