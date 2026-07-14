export async function GET() {
  return Response.json({
    service: "Agentic Community Ops",
    status: "healthy",
    version: "1.0.0",
    deterministicEngine: true,
  });
}
