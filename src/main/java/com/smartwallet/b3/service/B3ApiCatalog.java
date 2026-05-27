package com.smartwallet.b3.service;

import com.smartwallet.b3.dto.B3Dtos.B3ApiDefinition;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class B3ApiCatalog {

    private static final String STANDBY = "STANDBY";

    private final List<B3ApiDefinition> apis = List.of(
        api("di", "DI", "DI.json", "Derivativos e juros"),
        api("cfa-deposito-retirada", "CFA - Operacoes de Deposito e Retirada", "CFA - Operações de Depósito e Retirada.json", "Balcoes e fundos"),
        api("cdb-v2", "CDB", "CDB (1).json", "Renda fixa"),
        api("ccb-plataforma-balcao", "CCB - Plataforma Balcao", "CCB - Plataforma Balcão.json", "Credito privado"),
        api("ccb-nome-v2", "CCB - NoMe", "CCB - NoMe (1).json", "Credito privado"),
        api("transfer", "Transfer", "Transfer.json", "Movimentacao"),
        api("rde-agenda", "RDE - Agenda", "RDE - Agenda.json", "Agenda e eventos"),
        api("plataforma-distribuicao-acompanhar-oferta", "Plataforma de Distribuicao - Acompanhar Oferta", "Plataforma de Distribuição - Acompanhar Oferta.json", "Ofertas"),
        api("lci", "LCI", "LCI.json", "Renda fixa"),
        api("lca", "LCA", "LCA.json", "Renda fixa"),
        api("custom-data", "Custom Data", "Custom Data.json", "Dados customizados"),
        api("positions", "Positions", "Positions.json", "Posicoes e custodia"),
        api("orders", "Orders", "Orders.json", "Ordens"),
        api("bonds", "Bonds", "Bonds.json", "Renda fixa"),
        api("collateral-v2", "Collateral", "Collateral (1).json", "Garantias"),
        api("collateral", "Collateral", "Collateral.json", "Garantias"),
        api("conciliacao-ccb", "Conciliacao de CCB", "Conciliação de CCB.json", "Conciliacao"),
        api("cff-deposito-retirada", "CFF - Operacoes de Deposito e Retirada", "CFF - Operações de Depósito e Retirada.json", "Balcoes e fundos"),
        api("cdb", "CDB", "CDB.json", "Renda fixa"),
        api("cfa-operacoes", "CFA - Operacoes", "CFA - Operações.json", "Balcoes e fundos"),
        api("ccb-nome", "CCB - NoMe", "CCB - NoMe.json", "Credito privado"),
        api("block-incorporadora-mapa-vendas", "Block - Incorporadora Mapa de Vendas", "Block - Incorporadora Mapa de Vendas.json", "Imobiliario"),
        api("banco-b3-custodia-v2", "Banco B3 - API de Custodia", "Banco B3 - API de Custódia (1).json", "Banco B3"),
        api("b3-investidor-oferta-publica", "B3 Investidor - Oferta Publica", "B3 Investidor - Oferta Publica.json", "B3 Investidor"),
        api("b3-investidor-negociacao-ativos", "B3 Investidor - Negociacao de Ativos", "B3 Investidor - Negociação de Ativos.json", "B3 Investidor"),
        api("b3-investidor-pacote-acesso", "B3 Investidor - Pacote de Acesso", "B3 Investidor - Pacote de Acesso..json", "B3 Investidor"),
        api("b3-investidor-movimentacao", "B3 Investidor - Movimentacao", "B3 Investidor - Movimentação.json", "B3 Investidor"),
        api("imercado-tarifacao", "B3 iMercado Tarifacao API", "B3 iMercado Tarifação - API - Desenvolvido em .NET 6.json", "iMercado"),
        api("arquivos-conciliacao", "Arquivos de Conciliacao", "Arquivos de Conciliação.json", "Conciliacao"),
        api("simulacao-calculo-risco", "APIs Simulacao Calculo de Risco", "APIs Simulação Cálculo de Risco.json", "Risco"),
        api("conciliacao-contas-vinculos", "API para conciliacao de dados de contas e vinculos de contas", "API para conciliação de dados de contas e vínculos de contas..json", "Contas"),
        api("cadastro-unificado-comitentes", "API para Cadastro Unificado de Comitentes", "API para Cadastro Unificado de Comitentes - Cadastro de Acesso e Derivativos com CCP..json", "Cadastro"),
        api("imercado-line-trading-clearing-rejeicoes", "API iMercado Line - Trading, Clearing e Rejeicoes", "API iMercado Line - Trading, Clearing e Rejeições .json", "iMercado"),
        api("imercado-hft-market-maker", "API iMercado - HFT and Market Maker Incentive Details", "API iMercado - HFT and Market Maker Incentive Details .json", "iMercado"),
        api("imercado-equities-fee-details", "API iMercado - Equities Fee Details", "API iMercado - Equities Fee Details.json", "iMercado"),
        api("imbarq-sastoken", "API do IMBARQ - Gerador SasToken", "API do IMBARQ - Gerador SasToken.json", "IMBARQ"),
        api("core-calculation", "API for CORE calculation", "API for CORE calculation.json", "Risco"),
        api("b3-investidor-cadastro-fintechs", "B3 Investidor - Cadastro Investidor Fintechs", "B3 Investidor - Cadastro Investidor Fintechs.json", "B3 Investidor"),
        api("b3-investidor-autorizacao-fintech", "B3 Investidor - Autorizacao Fintech", "B3 Investidor - Autorização Fintech.json", "B3 Investidor"),
        api("b3-investidor-api-guia", "B3 Investidor - API Guia", "B3 Investidor - API Guia.json", "B3 Investidor"),
        api("banco-b3-liquidacao", "Banco B3 - API de Liquidacao", "Banco B3 - API de Liquidação.json", "Banco B3"),
        api("banco-b3-custodia", "Banco B3 - API de Custodia", "Banco B3 - API de Custódia.json", "Banco B3")
    );

    public List<B3ApiDefinition> list() {
        return apis;
    }

    public Optional<B3ApiDefinition> find(String id) {
        if (id == null || id.isBlank()) {
            return Optional.empty();
        }
        return apis.stream()
            .filter(api -> api.id().equalsIgnoreCase(id.trim()))
            .findFirst();
    }

    public boolean exists(String id) {
        return find(id).isPresent();
    }

    private static B3ApiDefinition api(String id, String name, String fileName, String category) {
        return new B3ApiDefinition(id, name, fileName, category, STANDBY);
    }
}
