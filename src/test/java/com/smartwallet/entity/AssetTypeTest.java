package com.smartwallet.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AssetTypeTest {

    @Test
    void fromValueAcceptsPortugueseLabels() {
        assertThat(AssetType.fromValue("Ação")).isEqualTo(AssetType.STOCK);
        assertThat(AssetType.fromValue("ACAO")).isEqualTo(AssetType.STOCK);
        assertThat(AssetType.fromValue("RENDA_FIXA")).isEqualTo(AssetType.BOND);
        assertThat(AssetType.fromValue("Renda Fixa")).isEqualTo(AssetType.BOND);
        assertThat(AssetType.fromValue("FII")).isEqualTo(AssetType.FII);
    }
}
