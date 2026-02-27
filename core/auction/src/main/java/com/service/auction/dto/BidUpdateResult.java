package com.service.auction.dto;

import java.math.BigDecimal;

public class BidUpdateResult {
    public BigDecimal newCurrentPrice;
    public Long newTopBidderId;
    public int bidCountIncrement;

    public BidUpdateResult(BigDecimal newPrice, Long newTopId, int increment) {
        this.newCurrentPrice = newPrice;
        this.newTopBidderId = newTopId;
        this.bidCountIncrement = increment;
    }
}
