package com.smartwallet.dto.wallet;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateWalletRequest(
    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 1, max = 255, message = "Nome deve ter entre 1 e 255 caracteres")
    String name,

    String description
) {}