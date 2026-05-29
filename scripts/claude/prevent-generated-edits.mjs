import process from "node:process";

const blocked = [
  ".env",
  ".env.",
  ".vercel/",
  "node_modules/",
  ".next/",
  "out/",
  "build/",
  "dist/",
  "coverage/",
];

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  input += chunk;
});

process.stdin.on("end", () => {
  let payload;
  try {
    payload = JSON.parse(input || "{}");
  } catch {
    process.exit(0);
  }

  const toolInput = payload.tool_input ?? {};
  const candidates = [
    toolInput.file_path,
    toolInput.path,
    ...(Array.isArray(toolInput.edits) ? toolInput.edits.map((edit) => edit.file_path) : []),
  ].filter(Boolean);

  const denied = candidates.find((candidate) => {
    const normalized = String(candidate).replaceAll("\\", "/").replace(/^\.\//, "");
    return blocked.some((pattern) => normalized === pattern || normalized.startsWith(pattern));
  });

  if (!denied) process.exit(0);

  console.error(
    `Blocked edit to generated or sensitive path: ${denied}. Use source files only; generated output and secrets are out of scope.`,
  );
  process.exit(2);
});
