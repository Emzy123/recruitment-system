type Judge0RunInput = {
  languageId: number;
  sourceCode: string;
  stdin?: string;
  expectedOutput?: string;
};

export async function runCodeWithJudge0(input: Judge0RunInput) {
  const apiUrl = process.env.JUDGE0_API_URL;
  const apiKey = process.env.JUDGE0_API_KEY;

  if (!apiUrl) {
    return {
      passed: false,
      stdout: "",
      stderr: "JUDGE0_API_URL is not configured",
      status: "config_error",
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) headers["X-Auth-Token"] = apiKey;

  let createRes: Response;
  try {
    createRes = await fetch(`${apiUrl}/submissions?base64_encoded=false&wait=true`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        language_id: input.languageId,
        source_code: input.sourceCode,
        stdin: input.stdin ?? "",
        expected_output: input.expectedOutput ?? "",
      }),
    });
  } catch (e: any) {
    return {
      passed: false,
      stdout: "",
      stderr: e?.message ? String(e.message) : "Judge0 fetch failed",
      status: "request_error",
    };
  }

  const data = await createRes.json().catch(() => null);
  if (!createRes.ok || !data) {
    return {
      passed: false,
      stdout: "",
      stderr: "Judge0 request failed",
      status: "request_error",
    };
  }

  const stdout = (data.stdout ?? "").toString().trim();
  const stderr = (data.stderr ?? "").toString().trim();
  const expected = (input.expectedOutput ?? "").toString().trim();
  const passed = expected ? stdout === expected && !stderr : !stderr;

  return {
    passed,
    stdout,
    stderr,
    status: data.status?.description ?? "done",
  };
}

export function languageToJudge0Id(language: string) {
  const key = language.toLowerCase();
  if (key.includes("python")) return 71;
  if (key.includes("javascript")) return 63;
  if (key.includes("typescript")) return 74;
  if (key.includes("java")) return 62;
  if (key.includes("c++") || key.includes("cpp")) return 54;
  return 71;
}

