package com.smartwallet.subscription;

import com.smartwallet.entity.User;
import com.smartwallet.exception.BusinessException;
import com.smartwallet.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlanServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PlanService planService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setFullName("Test User");
        testUser.setPlan(PlanType.FREE);
    }

    @Test
    void getUserPlan_FreeUser_ReturnsFree() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        
        PlanType result = planService.getUserPlan(1L);
        
        assertEquals(PlanType.FREE, result);
    }

    @Test
    void getUserPlan_PremiumUser_ReturnsPremium() {
        testUser.setPlan(PlanType.PREMIUM);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        
        PlanType result = planService.getUserPlan(1L);
        
        assertEquals(PlanType.PREMIUM, result);
    }

    @Test
    void getUserPlan_UserNotFound_ThrowsException() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());
        
        assertThrows(BusinessException.class, () -> planService.getUserPlan(999L));
    }

    @Test
    void validateWalletCreation_FreeUserWith5Wallets_ThrowsException() {
        testUser.setPlan(PlanType.FREE);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.countWalletsByUserId(1L)).thenReturn(5);
        
        assertThrows(BusinessException.class, () -> planService.validateWalletCreation(1L));
    }

    @Test
    void validateWalletCreation_FreeUserWith4Wallets_Success() {
        testUser.setPlan(PlanType.FREE);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.countWalletsByUserId(1L)).thenReturn(4);
        
        assertDoesNotThrow(() -> planService.validateWalletCreation(1L));
    }

    @Test
    void validateWalletCreation_PremiumUser_Success() {
        testUser.setPlan(PlanType.PREMIUM);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.countWalletsByUserId(1L)).thenReturn(100);
        
        assertDoesNotThrow(() -> planService.validateWalletCreation(1L));
    }

    @Test
    void validateAiAnalysisAccess_FreeUser_ThrowsException() {
        testUser.setPlan(PlanType.FREE);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        
        assertThrows(BusinessException.class, () -> planService.validateAiAnalysisAccess(1L));
    }

    @Test
    void validateAiAnalysisAccess_PremiumUser_Success() {
        testUser.setPlan(PlanType.PREMIUM);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        
        assertDoesNotThrow(() -> planService.validateAiAnalysisAccess(1L));
    }

    @Test
    void validateAssetCreation_FreeUserWith10Assets_ThrowsException() {
        testUser.setPlan(PlanType.FREE);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.countAssetsByUserId(1L)).thenReturn(10);
        
        assertThrows(BusinessException.class, () -> planService.validateAssetCreation(1L));
    }

    @Test
    void upgradePlan_ChangesUserPlan() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any())).thenReturn(testUser);
        
        planService.upgradePlan(1L, PlanType.PREMIUM);
        
        verify(userRepository).save(testUser);
        assertEquals(PlanType.PREMIUM, testUser.getPlan());
    }

    @Test
    void cancelSubscription_ReturnsToFree() {
        testUser.setPlan(PlanType.PREMIUM);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any())).thenReturn(testUser);
        
        planService.cancelSubscription(1L);
        
        verify(userRepository).save(testUser);
        assertEquals(PlanType.FREE, testUser.getPlan());
    }
}