import { publicSecurityRules } from "../../../../lib/security/rules";

export async function GET() {
  return Response.json({ rules: publicSecurityRules });
}
