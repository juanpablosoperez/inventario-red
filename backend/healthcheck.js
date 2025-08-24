#!/usr/bin/env node

/**
 * Health check para Docker
 * Verifica que la aplicación esté funcionando correctamente
 */

import http from "http";

const options = {
    host: "localhost",
    port: process.env.PORT || 3000,
    path: "/api/health",
    timeout: 2000,
};

const request = http.request(options, (res) => {
    if (res.statusCode === 200) {
        process.exit(0);
    } else {
        process.exit(1);
    }
});

request.on("error", () => {
    process.exit(1);
});

request.on("timeout", () => {
    request.destroy();
    process.exit(1);
});

request.end();
