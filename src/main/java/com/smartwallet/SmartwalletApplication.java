package com.smartwallet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = {
    "com.smartwallet.entity",
    "com.smartwallet.market.entity",
    "com.smartwallet.audit.entity",
    "com.smartwallet.audit.model",
    "com.smartwallet.alert.entity",
    "com.smartwallet.news.entity",
    "com.smartwallet.watchlist.entity",
    "com.smartwallet.notification",
    "com.smartwallet.portfolio.model"
})
@EnableJpaRepositories(basePackages = {
    "com.smartwallet.repository",
    "com.smartwallet.portfolio.repository",
    "com.smartwallet.market.repository"
})
public class SmartwalletApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartwalletApplication.class, args);
    }
}
