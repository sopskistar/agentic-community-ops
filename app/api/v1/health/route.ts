export async function GET() {
  return Response.json({
    service: "AgenticOps AI",
    status: "healthy",
    version: "1.0.0",
    deterministicEngine: true,
  });
}
