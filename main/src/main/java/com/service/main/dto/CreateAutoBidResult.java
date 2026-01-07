package com.service.main.dto;

import com.service.main.entity.AutoBid;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class CreateAutoBidResult {
    public AutoBid autoBidRes;
    public boolean hasEndAtChange;
    public boolean hasCurrentPriceChange;
    public BigDecimal newCurrentPrice;
    public OffsetDateTime newEndAt;

    public CreateAutoBidResult(
            AutoBid newAutoBid,
            boolean hasEndAtChange,
            boolean currentPriceChange,
            BigDecimal newCurrentPrice,
            OffsetDateTime newEndAt) {
        this.autoBidRes = newAutoBid;
        this.hasEndAtChange = hasEndAtChange;
        this.hasCurrentPriceChange = currentPriceChange;
        this.newCurrentPrice = newCurrentPrice;
        this.newEndAt = newEndAt;
    }
}