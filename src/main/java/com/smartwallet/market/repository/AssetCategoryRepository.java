package com.smartwallet.market.repository;

import com.smartwallet.market.entity.AssetCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetCategoryRepository extends JpaRepository<AssetCategory, Long> {

    Optional<AssetCategory> findByCode(String code);
    
    List<AssetCategory> findAllByOrderByDisplayOrder();
    
    List<AssetCategory> findByIsActiveTrueOrderByDisplayOrder();
}