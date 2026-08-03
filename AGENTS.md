# AGENTS.md — Narau Microlearning

## Required agent execution protocol

- Do not preserve backward compatibility.
- Choose the simplest implementation that fully meets the current requirements.
- Prefer stablished, well-maintained libraries over custom implementations unless told to do not.
- Write the tests first.
- Use `docker compose` to run commands
- When completed, tasks must succeed the rebuild of the container with `docker compose up -d --build` command
- Tasks must pass tests
- For UI/UX related tasks, always reach out to impeccable skill