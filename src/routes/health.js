/**
 * Health & System Metadata Route Handler
 *
 * Endpoint: GET /api/health
 *
 * Returns:
 * - status: Current operational status of the service ("online")
 * - framework: The underlying framework name ("@harshitclub/nodeframe")
 * - timestamp: ISO-8601 formatted UTC timestamp
 * - uptimeSeconds: Process uptime in seconds
 * - memoryUsageMB: Heap memory consumed in Megabytes (MB)
 *
 * @param {import("http").IncomingMessage} req - Incoming HTTP request
 * @param {import("http").ServerResponse} res - Enhanced NodeFrame response
 */
export function handleHealth(req, res) {
  // Collect process telemetry
  const uptimeSeconds = Math.floor(process.uptime());
  const memoryUsageMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

  // Return health payload with HTTP 200
  res.status(200).json({
    status: "online",
    framework: "@harshitclub/nodeframe",
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    memoryUsageMB
  });
}
