package com.smartwallet.b3.service;

import com.smartwallet.b3.config.B3ApiProperties;
import com.smartwallet.b3.dto.B3Dtos.B3ApiDefinition;
import com.smartwallet.b3.dto.B3Dtos.B3ProxyRequest;
import com.smartwallet.b3.dto.B3Dtos.B3ProxyResponse;
import com.smartwallet.b3.dto.B3Dtos.B3StatusResponse;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class B3ApiService {

    private final B3ApiProperties properties;
    private final B3ApiCatalog catalog;
    private final B3ApiClient client;

    public B3ApiService(B3ApiProperties properties, B3ApiCatalog catalog, B3ApiClient client) {
        this.properties = properties;
        this.catalog = catalog;
        this.client = client;
    }

    public B3StatusResponse status() {
        List<B3ApiDefinition> apis = catalog.list();
        return new B3StatusResponse(
            properties.isEnabled(),
            properties.getEnvironment(),
            apis.size(),
            StringUtils.hasText(properties.getBaseUrl()),
            hasCredential(),
            properties.isEnabled() ? "ACTIVE" : "STANDBY",
            apis
        );
    }

    public List<B3ApiDefinition> catalog() {
        return catalog.list();
    }

    public B3ProxyResponse execute(B3ProxyRequest request) {
        if (request == null || !catalog.exists(request.apiId())) {
            throw new IllegalArgumentException("API B3 nao cadastrada no catalogo");
        }
        return client.execute(request);
    }

    private boolean hasCredential() {
        return StringUtils.hasText(properties.getAccessToken())
            || (StringUtils.hasText(properties.getClientId()) && StringUtils.hasText(properties.getClientSecret()));
    }
}
