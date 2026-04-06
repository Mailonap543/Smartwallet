package com.smartwallet

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class SmartwalletApplication

fun main(args: Array<String>) {
    runApplication<SmartwalletApplication>(*args)
}