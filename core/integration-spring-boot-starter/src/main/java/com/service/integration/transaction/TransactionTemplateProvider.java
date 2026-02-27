package com.service.integration.transaction;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.transaction.support.TransactionTemplate;

public class TransactionTemplateProvider {
    private final TransactionTemplate requiredNewReadCommitted;

    private final TransactionTemplate requiredReadCommitted;

    public TransactionTemplateProvider(
            @Qualifier("requiredNew_ReadCommitted") TransactionTemplate requiredNewReadCommitted,
            @Qualifier("required_ReadCommitted") TransactionTemplate requiredReadCommitted
    ) {
        this.requiredNewReadCommitted = requiredNewReadCommitted;
        this.requiredReadCommitted = requiredReadCommitted;
    }

    public TransactionTemplate getRequiredNewReadCommitted() {
        return this.requiredNewReadCommitted;
    }

    public TransactionTemplate getRequiredReadCommitted() {
        return this.requiredReadCommitted;
    }
}
