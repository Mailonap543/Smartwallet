package com.smartwallet.bank.repository;

import com.smartwallet.bank.entity.BankPaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BankPaymentOrderRepository extends JpaRepository<BankPaymentOrder, Long> {
    List<BankPaymentOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
}
