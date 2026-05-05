package com.smartwallet;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration("entityScanTestConfig")
@EntityScan(basePackages = {
    "com.smartwallet.entity",
    "com.smartwallet.market.entity",
    "com.smartwallet.alert.entity",
    "com.smartwallet.watchlist.entity",
    "com.smartwallet.notification",
    "com.smartwallet.portfolio.model",
    "com.smartwallet.market.model",
    "com.smartwallet.watchlist.model",
    "com.smartwallet.news.entity",
    "com.smartwallet.audit.model"
})
@EnableJpaRepositories(basePackages = "com.smartwallet")
public class TestConfig {
    // This configuration overrides entity scanning for tests
    // to avoid conflict between Java Asset and Kotlin PortfolioAsset
}
