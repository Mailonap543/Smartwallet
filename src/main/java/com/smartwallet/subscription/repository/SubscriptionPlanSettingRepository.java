package com.smartwallet.subscription.repository;

import com.smartwallet.subscription.entity.SubscriptionPlanSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanSettingRepository extends JpaRepository<SubscriptionPlanSetting, Long> {
    Optional<SubscriptionPlanSetting> findByPlanName(String planName);
    List<SubscriptionPlanSetting> findByActiveTrueOrderByDisplayOrderAsc();
}
