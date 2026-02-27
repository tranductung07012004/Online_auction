package com.service.auction.dto;

import com.service.auction.entity.AutoBidInAuction;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class CreateAutoBidResult {
    public AutoBidInAuction autoBidRes;
    public boolean hasEndAtChange;
    public boolean hasCurrentPriceChange;
    public BigDecimal newCurrentPrice;
    public OffsetDateTime newEndAt;
    public Long oldTopBidderId;
    public boolean isTopBidderChange;
    public Long sellerId; // co the lay productId tu request xong roi query db, nhung tang tai len db, giam performance
    public Long newTopBidderId;

    public CreateAutoBidResult(
            AutoBidInAuction newAutoBid,
            boolean hasEndAtChange,
            boolean currentPriceChange,
            BigDecimal newCurrentPrice,
            OffsetDateTime newEndAt,
            Long oldTopBidderId,
            Long sellerId,
            boolean isTopBidderChange,
            Long newTopBidderId
        ) {
        this.autoBidRes = newAutoBid;
        this.hasEndAtChange = hasEndAtChange;
        this.hasCurrentPriceChange = currentPriceChange;
        this.newCurrentPrice = newCurrentPrice;
        this.newEndAt = newEndAt;
        this.oldTopBidderId = oldTopBidderId;
        this.sellerId = sellerId;
        this.isTopBidderChange = isTopBidderChange;
        this.newTopBidderId = newTopBidderId;
    }
}