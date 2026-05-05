package com.smartwallet;

import org.hibernate.boot.model.naming.Identifier;
import org.hibernate.boot.model.naming.PhysicalNamingStrategy;
import org.hibernate.engine.jdbc.env.spi.JdbcEnvironment;

public class TestNamingStrategy implements PhysicalNamingStrategy {
    @Override
    public Identifier toPhysicalCatalogName(Identifier name, JdbcEnvironment context) {
        return name;
    }

    @Override
    public Identifier toPhysicalSchemaName(Identifier name, JdbcEnvironment context) {
        return name;
    }

    @Override
    public Identifier toPhysicalTableName(Identifier name, JdbcEnvironment context) {
        // Rename Asset table to legacy_asset in tests to avoid conflict with Kotlin PortfolioAsset
        if (name.getText().equalsIgnoreCase("portfolio_assets")) {
            // Check if the entity is the Java Asset (we can't easily know, but we can rename all)
            // Instead, let's suffix with _java only for the Asset entity.
            // But we don't have the entity class here. So this is a bit of a hack.
            // We'll rename any table named portfolio_assets to portfolio_assets_legacy for test.
            // However, Kotlin PortfolioAsset also uses that table. This would break Kotlin.
            // So we need to differentiate based on the entity class, which is not available.
            // Alternative: Change the table name for Java Asset only via its @Table annotation.
            // Since we cannot modify @Table conditionally, we need a different approach.
            // I think the better approach is to exclude Java Asset from entity scanning in tests.
            // That's what we'll do via TestConfig.
            return name;
        }
        return name;
    }

    @Override
    public Identifier toPhysicalSequenceName(Identifier name, JdbcEnvironment context) {
        return name;
    }

    @Override
    public Identifier toPhysicalColumnName(Identifier name, JdbcEnvironment context) {
        return name;
    }
}
