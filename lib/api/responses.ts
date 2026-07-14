import type { ZodIssue } from "zod";

type ApiIssue = {
  path: string;
  message: string;
};

export function apiErrorResponse({
  code,
  message,
  status,
  issues,
}: {
  code: string;
  message: string;
  status: number;
  issues?: ApiIssue[];
}) {
  return Response.json(
    {
      error: {
        code,
        message,
        ...(issues ? { issues } : {}),
      },
    },
    { status },
  );
}

export function zodIssuesToApiIssues(issues: ZodIssue[]) {
  return issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
