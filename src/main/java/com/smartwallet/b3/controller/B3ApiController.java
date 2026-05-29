package com.smartwallet.b3.controller;

import com.smartwallet.b3.dto.B3Dtos.B3ApiDefinition;
import com.smartwallet.b3.dto.B3Dtos.B3ProxyRequest;
import com.smartwallet.b3.dto.B3Dtos.B3ProxyResponse;
import com.smartwallet.b3.dto.B3Dtos.B3StatusResponse;
import com.smartwallet.b3.service.B3ApiService;
import com.smartwallet.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/b3")
public class B3ApiController {

    private final B3ApiService service;

    public B3ApiController(B3ApiService service) {
        this.service = service;
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<B3StatusResponse>> status() {
        return ResponseEntity.ok(ApiResponse.success(service.status()));
    }

    @GetMapping("/catalog")
    public ResponseEntity<ApiResponse<List<B3ApiDefinition>>> catalog() {
        return ResponseEntity.ok(ApiResponse.success(service.catalog()));
    }

    @PostMapping("/proxy")
    public ResponseEntity<ApiResponse<B3ProxyResponse>> proxy(@RequestBody B3ProxyRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.execute(request)));
    }
}
