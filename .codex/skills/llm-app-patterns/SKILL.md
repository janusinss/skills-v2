---
name: "llm-app-patterns"
description: "Architect production LLM apps with RAG pipelines, prompt chaining, guardrails, caching, and fallbacks. Use when designing end-to-end LLM application backends."
metadata:
  upstream-risk: "critical"
  upstream-source: "community"
  upstream-date_added: "2026-02-27"
---

# 🤖 LLM Application Patterns

> Production-ready patterns for building LLM applications, inspired by [Dify](https://github.com/langgenius/dify) and industry best practices.

## When to Use This Skill

Use this skill when:

- Designing LLM-powered applications
- Implementing RAG (Retrieval-Augmented Generation)
- Building AI agents with tools
- Setting up LLMOps monitoring
- Choosing between agent architectures

---

## 1. RAG Pipeline Architecture

### Overview

RAG (Retrieval-Augmented Generation) grounds LLM responses in your data.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Ingest    │────▶│   Retrieve  │────▶│   Generate  │
│  Documents  │     │   Context   │     │   Response  │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
 ┌─────────┐       ┌───────────┐       ┌───────────┐
 │ Chunking│       │  Vector   │       │    LLM    │
 │Embedding│       │  Search   │       │  + Context│
 └─────────┘       └───────────┘       └───────────┘
```

### 1.1 Document Ingestion

```python
# Chunking strategies
class ChunkingStrategy:
    # Fixed-size chunks (simple but may break context)
    FIXED_SIZE = "fixed_size"  # e.g., 512 tokens

    # Semantic chunking (preserves meaning)
    SEMANTIC = "semantic"      # Split on paragraphs/sections

    # Recursive splitting (tries multiple separators)
    RECURSIVE = "recursive"    # ["\n\n", "\n", " ", ""]

    # Document-aware (respects structure)
    DOCUMENT_AWARE = "document_aware"  # Headers, lists, etc.

# Recommended settings
CHUNK_CONFIG = {
    "chunk_size": 512,       # tokens
    "chunk_overlap": 50,     # token overlap between chunks
    "separators": ["\n\n", "\n", ". ", " "],
}
```

### 1.2 Embedding & Storage

```python
# Vector database selection
VECTOR_DB_OPTIONS = {
    "pinecone": {
        "use_case": "Production, managed service",
        "scale": "Billions of vectors",
        "features": ["Hybrid search", "Metadata filtering"]
    },
    "weaviate": {
        "use_case": "Self-hosted, multi-modal",
        "scale": "Millions of vectors",
        "features": ["GraphQL API", "Modules"]
    },
    "chromadb": {
        "use_case": "Development, prototyping",
        "scale": "Thousands of vectors",
        "features": ["Simple API", "In-memory option"]
    },
    "pgvector": {
        "use_case": "Existing Postgres infrastructure",
        "scale": "Millions of vectors",
        "features": ["SQL integration", "ACID compliance"]
    }
}

# Embedding model selection
EMBEDDING_MODELS = {
    "openai/text-embedding-3-small": {
        "dimensions": 1536,
        "cost": "$0.02/1M tokens",
        "quality": "Good for most use cases"
    },
    "openai/text-embedding-3-large": {
        "dimensions": 3072,
        "cost": "$0.13/1M tokens",
        "quality": "Best for complex queries"
    },
    "local/bge-large": {
        "dimensions": 1024,
        "cost": "Free (compute only)",
        "quality": "Comparable to OpenAI small"
    }
}
```

### 1.3 Retrieval Strategies

```python
# Basic semantic search
def semantic_search(query: str, top_k: int = 5):
    query_embedding = embed(query)
    results = vector_db.similarity_search(
        query_embedding,
        top_k=top_k
    )
    return results

# Hybrid search (semantic + keyword)
def hybrid_search(query: str, top_k: int = 5, alpha: float = 0.5):
    """
    alpha=1.0: Pure semantic
    alpha=0.0: Pure keyword (BM25)
    alpha=0.5: Balanced
    """
    semantic_results = vector_db.similarity_search(query)
    keyword_results = bm25_search(query)

    # Reciprocal Rank Fusion
    return rrf_merge(semantic_results, keyword_results, alpha)

# Multi-query retrieval
def multi_query_retrieval(query: str):
    """Generate multiple query variations for better recall"""
    queries = llm.generate_query_variations(query, n=3)
    all_results = []
    for q in queries:
        all_results.extend(semantic_search(q))
    return deduplicate(all_results)

# Contextual compression
def compressed_retrieval(query: str):
    """Retrieve then compress to relevant parts only"""
    docs = semantic_search(query, top_k=10)
    compressed = llm.extract_relevant_parts(docs, query)
    return compressed
```

### 1.4 Generation with Context

```python
RAG_PROMPT_TEMPLATE = """
Answer the user's question based ONLY on the following context.
If the context doesn't contain enough information, say "I don't have enough information to answer that."

Context:
{context}

Question: {question}

Answer:"""

def generate_with_rag(question: str):
    # Retrieve
    context_docs = hybrid_search(question, top_k=5)
    context = "\n\n".join([doc.content for doc in context_docs])

    # Generate
    prompt = RAG_PROMPT_TEMPLATE.format(
        context=context,
        question=question
    )

    response = llm.generate(prompt)

    # Return with citations
    return {
        "answer": response,
        "sources": [doc.metadata for doc in context_docs]
    }
```

---

## 2. Agent Architectures

### 2.1 ReAct Pattern (Reasoning + Acting)

```
Thought: I need to search for information about X
Action: search("X")
Observation: [search results]
Thought: Based on the results, I should...
Action: calculate(...)
Observation: [calculation result]
Thought: I now have enough information
Action: final_answer("The answer is...")
```

```python
REACT_PROMPT = """
You are an AI assistant that can use tools to answer questions.

Available tools:
{tools_description}

Use this format:
Thought: [your reasoning about what to do next]
Action: [tool_name(arguments)]
Observation: [tool result - this will be filled in]
... (repeat Thought/Action/Observation as needed)
Thought: I have enough information to answer
Final Answer: [your final response]

Question: {question}
"""

class ReActAgent:
    def __init__(self, tools: list, llm):
        self.tools = {t.name: t for t in tools}
        self.llm = llm
        self.max_iterations = 10

    def run(self, question: str) -> str:
        prompt = REACT_PROMPT.format(
            tools_description=self._format_tools(),
            question=question
        )

        for _ in range(self.max_iterations):
            response = self.llm.generate(prompt)

            if "Final Answer:" in response:
                return self._extract_final_answer(response)

            action = self._parse_action(response)
            observation = self._execute_tool(action)
            prompt += f"\nObservation: {observation}\n"

        return "Max iterations reached"
```

### 2.2 Function Calling Pattern

```python
# Define tools as functions with schemas
TOOLS = [
    {
        "name": "search_web",
        "description": "Search the web for current information",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query"
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "calculate",
        "description": "Perform mathematical calculations",
        "parameters": {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "Math expression to evaluate"
                }
            },
            "required": ["expression"]
        }
    }
]

class FunctionCallingAgent:
    def run(self, question: str) -> str:
        messages = [{"role": "user", "content": question}]

        while True:
            response = self.llm.chat(
                messages=messages,
                tools=TOOLS,
                tool_choice="auto"
            )

            if response.tool_calls:
                for tool_call in response.tool_calls:
                    result = self._execute_tool(
                        tool_call.name,
                        tool_call.arguments
                    )
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": str(result)
                    })
            else:
                return response.content
```

### 2.3 Plan-and-Execute Pattern

```python
class PlanAndExecuteAgent:
    """
    1. Create a plan (list of steps)
    2. Execute each step
    3. Replan if needed
    """

    def run(self, task: str) -> str:
        # Planning phase
        plan = self.planner.create_plan(task)
        # Returns: ["Step 1: ...", "Step 2: ...", ...]

        results = []
        for step in plan:
            # Execute each step
            result = self.executor.execute(step, context=results)
            results.append(result)

            # Check if replan needed
            if self._needs_replan(task, results):
                new_plan = self.planner.replan(
                    task,
                    completed=results,
                    remaining=plan[len(results):]
                )
                plan = new_plan

        # Synthesize final answer
        return self.synthesizer.summarize(task, results)
```

### 2.4 Multi-Agent Collaboration

```python
class AgentTeam:
    """
    Specialized agents collaborating on complex tasks
    """

    def __init__(self):
        self.agents = {
            "researcher": ResearchAgent(),
            "analyst": AnalystAgent(),
            "writer": WriterAgent(),
            "critic": CriticAgent()
        }
        self.coordinator = CoordinatorAgent()

    def solve(self, task: str) -> str:
        # Coordinator assigns subtasks
        assignments = self.coordinator.decompose(task)

        results = {}
        for assignment in assignments:
            agent = self.agents[assignment.agent]
            result = agent.execute(
                assignment.subtask,
                context=results
            )
            results[assignment.id] = result

        # Critic reviews
        critique = self.agents["critic"].review(results)

        if critique.needs_revision:
            # Iterate with feedback
            return self.solve_with_feedback(task, results, critique)

        return self.coordinator.synthesize(results)
```

---

## 3–5. Prompt IDE Patterns, LLMOps & Production Patterns

See [Prompt IDE Patterns, LLMOps & Observability, and Production Patterns](references/prompt-llmops-and-production.md).

## Architecture Decision Matrix

| Pattern              | Use When         | Complexity | Cost      |
| :------------------- | :--------------- | :--------- | :-------- |
| **Simple RAG**       | FAQ, docs search | Low        | Low       |
| **Hybrid RAG**       | Mixed queries    | Medium     | Medium    |
| **ReAct Agent**      | Multi-step tasks | Medium     | Medium    |
| **Function Calling** | Structured tools | Low        | Low       |
| **Plan-Execute**     | Complex tasks    | High       | High      |
| **Multi-Agent**      | Research tasks   | Very High  | Very High |

---

## Resources

- [Dify Platform](https://github.com/langgenius/dify)
- [LangChain Docs](https://python.langchain.com/)
- [LlamaIndex](https://www.llamaindex.ai/)
- [Anthropic Cookbook](https://github.com/anthropics/anthropic-cookbook)

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
