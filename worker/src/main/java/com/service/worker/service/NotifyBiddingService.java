package com.service.worker.service;

import com.service.worker.dto.BlackListEvent;
import com.service.worker.dto.ProductCurrentPriceUpdatedEvent;
import com.service.worker.dto.ProductEndedEvent;

public interface NotifyBiddingService {
    void notifyBiddingPriceChange(ProductCurrentPriceUpdatedEvent event);
    void notifyBlackList(BlackListEvent event);
    void notifyProductEnded(ProductEndedEvent event);
}
