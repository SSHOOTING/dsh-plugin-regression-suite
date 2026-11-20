# dsh-plugin-regression-suite

**Save a task input and acceptance criteria, then compare quality, cost and latency across model/plugin versions to see if changes helped.**

This is one of 14 read-only observability plugins for the DSH agent lifecycle (theme: **Task Regression Suite**). It reads only metadata from session events — never prompts, tool bodies, or file contents — and makes no network calls.

## Install

```powershell
dsh plugin --profile web add dsh-plugin-regression-suite
```

Requires Node `^22.19.0 || >=24` and DSH `>=0.2.0-rc.2 <0.3.0`.

## 30-second demo

1. Use DSH normally for a few turns.
2. In any session, type `/regression`.
3. You get a compact, read-only report; use `/regression --json` for machine-readable output.

```text
[regression] 3 version(s) compared · cheapest=default
  0.1.0  1 call(s)  ~900 tokens  0 error(s)
  default  8 call(s)  ~340 tokens  1 error(s)
  hy4-flash-free  1 call(s)  ~1200 tokens  0 error(s)
Replay the saved input across versions to compare quality.
```

## What it reads

Session event metadata only: event types, tool names, token counts, and route names. Credential-looking values are redacted before display. No file contents or prompts are read, stored, or transmitted.

## License

MIT — SSHOOTING.
