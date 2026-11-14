---
name: fastapi-templates
description: "Scaffold production FastAPI services with async dependencies, Pydantic v2 schemas, and structured errors. Use when building or refactoring FastAPI backends."
---

# FastAPI Project Templates

Starting-point FastAPI project structures with async patterns, dependency injection, middleware, and best practices for building high-performance APIs.

## Use this skill when

- Starting new FastAPI projects from scratch
- Implementing async REST APIs with Python
- Building high-performance web services and microservices
- Creating async applications with PostgreSQL, MongoDB
- Setting up API projects with proper structure and testing

## Do not use this skill when

- The task is unrelated to fastapi project templates
- You need a different domain or tool outside this scope

## Instructions

- Clarify goals, constraints, and required inputs.
- Apply relevant best practices and validate outcomes.
- Provide actionable steps and verification.
- If detailed examples are required, open `resources/implementation-playbook.md`.

## Example

```text
Create a PostgreSQL-backed user API using the playbook. First define request/output/internal schemas and object authorization, then test registration, inactive-token rejection and forbidden cross-user reads. Report missing project files before claiming a runnable service.
```

## Resources

- `resources/implementation-playbook.md` for detailed patterns and examples.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
