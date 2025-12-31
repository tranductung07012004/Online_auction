package com.service.main.service.impl;

import com.service.main.constants.ErrorCodes;
import com.service.main.dto.BidRequestResponse;
import com.service.main.dto.UserInfo;
import com.service.main.dto.UserInfoResponse;
import com.service.main.entity.BidRequest;
import com.service.main.entity.Product;
import com.service.main.exception.ApplicationException;
import com.service.main.repository.BidRequestRepository;
import com.service.main.repository.ProductRepository;
import com.service.main.service.BidRequestService;
import com.service.main.service.UserServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

import static com.service.main.service.impl.ProductServiceImpl.formatUserInfo;

@Service
@RequiredArgsConstructor
public class BidRequestServiceImpl implements BidRequestService {

    private final BidRequestRepository bidRequestRepository;
    private final UserServiceClient userServiceClient;
    private final ProductRepository productRepository;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createBidRequest(Long bidderId, Long productId, Long sellerId) {
        BidRequest req = BidRequest.builder()
                .bidderId(bidderId)
                .productId(productId)
                .sellerId(sellerId)
                .verified(false)
                .createdAt(OffsetDateTime.now())
                .build();

        bidRequestRepository.save(req);
    }

    @Override
    public Page<BidRequestResponse> getBidRequestsByProductId(Long productId, Pageable pageable) {
        Page<BidRequest> bidRequestPage = this.bidRequestRepository.findByProductId(productId, pageable);
        return bidRequestPage.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public BidRequestResponse verifyBidRequest(Long bidderId, Long productId, Long sellerId) {
        UserInfoResponse bidderInfo = userServiceClient.getUserBasicInfo(bidderId);
        if (bidderInfo == null) {
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Bidder not found");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Product not found"));

        if (!product.getSellerId().equals(sellerId)) {
            throw new ApplicationException(ErrorCodes.UNAUTHORIZED, "Only the product seller can verify bid requests");
        }

        BidRequest bidRequest = bidRequestRepository.findByProductIdAndBidderId(productId, bidderId)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Bid request not found"));

        // Update verified = true
        bidRequest.setVerified(true);
        BidRequest savedBidRequest = bidRequestRepository.save(bidRequest);

        return mapToResponse(savedBidRequest);
    }

    private BidRequestResponse mapToResponse(BidRequest bidRequest) {
        UserInfoResponse bidderInfoRes = userServiceClient.getUserBasicInfo(bidRequest.getBidderId());
        UserInfo bidder = formatUserInfo(bidderInfoRes);

        BidRequestResponse response = new BidRequestResponse();
        response.setId(bidRequest.getId());
        response.setProductId(bidRequest.getProductId());
        response.setBidder(bidder);
        response.setSellerId(bidRequest.getSellerId());
        response.setVerified(bidRequest.getVerified());
        response.setCreatedAt(bidRequest.getCreatedAt());
        return response;
    }
}

