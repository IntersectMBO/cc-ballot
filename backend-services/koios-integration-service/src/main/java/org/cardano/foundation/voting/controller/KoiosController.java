package org.cardano.foundation.voting.controller;

import lombok.RequiredArgsConstructor;
import org.cardano.foundation.voting.client.KoiosClient;
import org.cardano.foundation.voting.dto.KoiosAccountInfoResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class KoiosController {

    private final KoiosClient koiosClient;

    @GetMapping("/account-info")
    public ResponseEntity<KoiosAccountInfoResponse> getAccountInfo(@RequestParam String stakeAddress) {
        return koiosClient.getAccountInfo(stakeAddress)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
