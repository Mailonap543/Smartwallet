package com.smartwallet.b3.dto;

import java.util.List;
import java.util.Map;

public final class B3Dtos {

    private B3Dtos() {
    }

    public record B3ApiDefinition(
        String id,
        String name,
        String fileName,
        String category,
        String status
    ) {
    }

    public record B3StatusResponse(
        boolean enabled,
        String environment,
        int registeredApis,
        boolean baseUrlConfigured,
        boolean credentialsConfigured,
        String mode,
        List<B3ApiDefinition> apis
    ) {
    }

    public record B3ProxyRequest(
        String apiId,
        String method,
        String path,
        Map<String, String> queryParams,
        Object body
    ) {
    }

    public record B3ProxyResponse(
        int statusCode,
        Object data
    ) {
    }
}
