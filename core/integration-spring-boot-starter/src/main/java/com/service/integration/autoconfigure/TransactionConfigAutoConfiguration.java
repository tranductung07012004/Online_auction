package com.service.integration.autoconfigure;

import com.service.integration.transaction.TransactionTemplateProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

@Configuration
@ConditionalOnClass(TransactionTemplate.class)
public class TransactionConfigAutoConfiguration {
    @Bean
    // Li do la bi loi khi de ConditionalOnMissingBean cho ca 2 bean cung type
    // la TransactionTemplate, khien cho chi co 1 cai duoc khoi tao
    //@ConditionalOnMissingBean
    @Qualifier("requiredNew_ReadCommitted")
    public TransactionTemplate transactionTemplateRequiredNew(PlatformTransactionManager txManager) {
        TransactionTemplate template = new TransactionTemplate(txManager);
        template.setIsolationLevel(TransactionDefinition.ISOLATION_READ_COMMITTED);
        template.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        template.setTimeout(5);
        return template;
    }

    @Bean
    // Li do la bi loi khi de ConditionalOnMissingBean cho ca 2 bean cung type
    // la TransactionTemplate, khien cho chi co 1 cai duoc khoi tao
    //@ConditionalOnMissingBean
    @Qualifier("required_ReadCommitted")
    public TransactionTemplate transactionTemplate(PlatformTransactionManager txManager) {
        TransactionTemplate template = new TransactionTemplate(txManager);
        template.setIsolationLevel(TransactionDefinition.ISOLATION_READ_COMMITTED);
        template.setTimeout(5);
        return template;
    }

    @Bean
    @ConditionalOnMissingBean(TransactionTemplateProvider.class)
    public TransactionTemplateProvider transactionTemplateProvider(
            @Qualifier("requiredNew_ReadCommitted") TransactionTemplate requiredNewReadCommitted,
            @Qualifier("required_ReadCommitted") TransactionTemplate requiredReadCommitted
    ) {
        return new TransactionTemplateProvider(requiredNewReadCommitted, requiredReadCommitted);
    }
}

