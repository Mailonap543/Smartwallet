package com.smartwallet.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class AssetTypeConverter implements AttributeConverter<AssetType, String> {

    @Override
    public String convertToDatabaseColumn(AssetType attribute) {
        return attribute != null ? attribute.name() : AssetType.OTHER.name();
    }

    @Override
    public AssetType convertToEntityAttribute(String dbData) {
        return AssetType.fromValue(dbData);
    }
}
