### Persistence with Checkpointer

Save and resume agent state

**When to use**: Multi-turn conversations, long-running agents

from langgraph.graph import StateGraph
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.checkpoint.postgres import PostgresSaver

# SQLite for development
memory = SqliteSaver.from_conn_string(":memory:")
# Or persistent file
memory = SqliteSaver.from_conn_string("agent_state.db")

# PostgreSQL for production
# memory = PostgresSaver.from_conn_string(DATABASE_URL)

# Compile with checkpointer
app = graph.compile(checkpointer=memory)

# Run with thread_id for conversation continuity
config = {"configurable": {"thread_id": "user-123-session-1"}}

# First message
result1 = app.invoke(
    {"messages": [("user", "My name is Alice")]},
    config=config
)

# Second message - agent remembers context
result2 = app.invoke(
    {"messages": [("user", "What's my name?")]},
    config=config
)
# Agent knows name is Alice!

# Get conversation history
state = app.get_state(config)
print(state.values["messages"])

# List all checkpoints
for checkpoint in app.get_state_history(config):
    print(checkpoint.config, checkpoint.values)

### Human-in-the-Loop

Pause for human approval before actions

**When to use**: Sensitive operations, review before execution

from langgraph.graph import StateGraph, START, END

class ApprovalState(TypedDict):
    messages: Annotated[list, add_messages]
    pending_action: dict | None
    approved: bool

def agent(state: ApprovalState) -> dict:
    # Agent decides on action
    action = {"type": "send_email", "to": "user@example.com"}
    return {
        "pending_action": action,
        "messages": [("assistant", f"I want to: {action}")]
    }

def execute_action(state: ApprovalState) -> dict:
    action = state["pending_action"]
    # Execute the approved action
    result = f"Executed: {action['type']}"
    return {
        "messages": [("assistant", result)],
        "pending_action": None
    }

def should_execute(state: ApprovalState) -> str:
    if state.get("approved"):
        return "execute"
    return END  # Wait for approval

# Build graph
graph = StateGraph(ApprovalState)
graph.add_node("agent", agent)
graph.add_node("execute", execute_action)

graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", should_execute, ["execute", END])
graph.add_edge("execute", END)

# Compile with interrupt_before for human review
app = graph.compile(
    checkpointer=memory,
    interrupt_before=["execute"]  # Pause before execution
)

# Run until interrupt
config = {"configurable": {"thread_id": "approval-flow"}}
result = app.invoke({"messages": [("user", "Send report")]}, config)

# Agent paused - get pending state
state = app.get_state(config)
pending = state.values["pending_action"]
print(f"Pending: {pending}")  # Human reviews

# Human approves - update state and continue
app.update_state(config, {"approved": True})
result = app.invoke(None, config)  # Resume

### Parallel Execution (Map-Reduce)

Run multiple branches in parallel

**When to use**: Parallel research, batch processing

from langgraph.graph import StateGraph, START, END, Send
from langgraph.constants import Send

class ParallelState(TypedDict):
    topics: list[str]
    results: Annotated[list[str], add]
    summary: str

def research_topic(state: dict) -> dict:
    """Research a single topic."""
    topic = state["topic"]
    result = f"Research on {topic}..."
    return {"results": [result]}

def summarize(state: ParallelState) -> dict:
    """Combine all research results."""
    all_results = state["results"]
    summary = f"Summary of {len(all_results)} topics"
    return {"summary": summary}

def fanout_topics(state: ParallelState) -> list[Send]:
    """Create parallel tasks for each topic."""
    return [
        Send("research", {"topic": topic})
        for topic in state["topics"]
    ]

# Build graph
graph = StateGraph(ParallelState)
graph.add_node("research", research_topic)
graph.add_node("summarize", summarize)

# Fan out to parallel research
graph.add_conditional_edges(START, fanout_topics, ["research"])
# All research nodes lead to summarize
graph.add_edge("research", "summarize")
graph.add_edge("summarize", END)

app = graph.compile()

result = app.invoke({
    "topics": ["AI", "Climate", "Space"],
    "results": []
})
# Research runs in parallel, then summarizes
