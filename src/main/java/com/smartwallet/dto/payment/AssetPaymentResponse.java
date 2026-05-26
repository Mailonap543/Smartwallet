package com.smartwallet.dto.payment;

import com.smartwallet.bank.dto.BankDtos;
import com.smartwallet.dto.asset.AssetResponse;
import com.smartwallet.dto.transaction.TransactionResponse;

public record AssetPaymentResponse(
        BankDtos.PaymentResponse payment,
        AssetResponse asset,
        TransactionResponse transaction
) {}
