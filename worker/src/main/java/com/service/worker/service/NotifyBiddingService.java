package com.service.worker.service;

import com.service.worker.dto.BlackListEvent;
import com.service.worker.dto.CreateAnswerEvent;
import com.service.worker.dto.CreateQuestionEvent;
import com.service.worker.dto.ProductCurrentPriceUpdatedEvent;
import com.service.worker.dto.ProductEndedEvent;
import com.service.worker.dto.UpdateProductDescriptionEvent;

public interface NotifyBiddingService {
    void notifyBiddingPriceChange(ProductCurrentPriceUpdatedEvent event);
    void notifyBlackList(BlackListEvent event);
    void notifyProductEnded(ProductEndedEvent event);
    void notifyQuestionCreated(CreateQuestionEvent event);
    void notifyAnswerCreated(CreateAnswerEvent event);
    void notifyProductDescriptionUpdated(UpdateProductDescriptionEvent event);
}
