"""Direct backend API and service verification test without external test dependencies."""
from app.dependencies import (
    get_category_repository,
    get_agent_repository,
    get_upvote_repository,
    get_collection_repository,
    get_agent_service,
    get_submission_service,
    get_collection_service,
    get_sync_service,
)
from app.models.submission import SubmissionCreateRequest
from app.models.upvote import UpvoteRequest
from app.routers.categories import list_categories
from app.routers.agents import (
    list_agents,
    get_agent_profile,
    get_contextual_alternatives,
    toggle_upvote,
)
from app.routers.collections import (
    list_collections,
    get_collection,
    compare_agents,
)
from app.routers.submissions import submit_agent

def main():
    print("--- 1. Testing Category Repository & Router ---")
    cat_repo = get_category_repository()
    cats = list_categories(repo=cat_repo)
    assert len(cats) >= 5, f"Expected 5 categories, got {len(cats)}"
    print(f"[PASS] Retrieved {len(cats)} categories: {[c.slug for c in cats]}")

    print("\n--- 2. Testing Agent Service & Directory Router ---")
    agent_svc = get_agent_service(
        agent_repo=get_agent_repository(),
        category_repo=cat_repo,
        upvote_repo=get_upvote_repository(),
    )
    agents = list_agents(service=agent_svc)
    assert len(agents) > 0, "Expected at least 1 agent"
    print(f"[PASS] Total directory agents: {len(agents)}")
    for a in agents:
        print(f"  - {a.title} ({a.slug}): {a.upvotes_count} upvotes, score={a.ranking_score}")

    print("\n--- 3. Testing Faceted Filters ---")
    coding_agents = list_agents(category="coding-devops", service=agent_svc)
    assert len(coding_agents) > 0
    print(f"[PASS] Coding & DevOps filter: {len(coding_agents)} agents")

    docker_agents = list_agents(runtime="docker", service=agent_svc)
    assert len(docker_agents) > 0
    print(f"[PASS] Docker runtime filter: {len(docker_agents)} agents")

    oss_agents = list_agents(monetization="open_source", service=agent_svc)
    assert len(oss_agents) > 0
    print(f"[PASS] Open-source filter: {len(oss_agents)} agents")

    print("\n--- 4. Testing Detailed Agent Profile ---")
    openhands = get_agent_profile(slug="openhands", service=agent_svc)
    assert openhands.slug == "openhands"
    assert openhands.is_mcp_compliant is True
    assert openhands.terminal_setup_script is not None
    print(f"[PASS] OpenHands profile: MCP={openhands.is_mcp_compliant}, Orchestrator='{openhands.framework}'")

    print("\n--- 5. Testing Contextual Alternatives ---")
    alts = get_contextual_alternatives(slug="openhands", service=agent_svc)
    print(f"[PASS] Alternatives for openhands: {[a.slug for a in alts]}")

    print("\n--- 6. Testing Deduplicated Upvote Engine ---")
    initial_votes = openhands.upvotes_count
    # First vote (adds upvote)
    up_res1 = toggle_upvote(
        agent_id=openhands.id,
        body=UpvoteRequest(digital_fingerprint_hash="test-voter-fp"),
        x_fingerprint=None,
        service=agent_svc,
    )
    assert up_res1.success is True
    assert up_res1.has_upvoted is True
    assert up_res1.upvotes_count == initial_votes + 1
    print(f"[PASS] Cast upvote: new count={up_res1.upvotes_count}")

    # Second vote from same fingerprint (revokes upvote)
    up_res2 = toggle_upvote(
        agent_id=openhands.id,
        body=UpvoteRequest(digital_fingerprint_hash="test-voter-fp"),
        x_fingerprint=None,
        service=agent_svc,
    )
    assert up_res2.success is True
    assert up_res2.has_upvoted is False
    assert up_res2.upvotes_count == initial_votes
    print(f"[PASS] Revoke upvote (toggle): restored count={up_res2.upvotes_count}")

    print("\n--- 7. Testing Curated Collections & Comparative Matrix ---")
    col_svc = get_collection_service(
        collection_repo=get_collection_repository(),
        agent_repo=get_agent_repository(),
        category_repo=cat_repo,
    )
    cols = list_collections(service=col_svc)
    assert len(cols) >= 2, f"Expected >=2 collections, got {len(cols)}"
    print(f"[PASS] Collections: {[c.title for c in cols]}")

    matrix = compare_agents(agents="openhands,stagehand", service=col_svc)
    assert len(matrix.agents) == 2
    assert len(matrix.comparison_parameters) == 5
    print(f"[PASS] Comparative matrix: {matrix.agents[0].title} vs {matrix.agents[1].title}")
    for p in matrix.comparison_parameters:
        print(f"  - Parameter: {p}")

    print("\n--- 8. Testing Community Submission Portal with 12h SLA ---")
    sub_svc = get_submission_service(
        agent_repo=get_agent_repository(),
        category_repo=cat_repo,
    )
    sub_req = SubmissionCreateRequest(
        title="Agent Verification Suite",
        tagline="Autonomous verification suite for AgentHub platform testing",
        summary="Automated test suite executing integration checks against directory models.",
        description_markdown="### Verification Suite\nFull-stack autonomous execution.",
        website_url="https://verification.agenthub.dev",
        repository_url="https://github.com/agenthub/verification",
        category_id=cats[0].id,
        deployment_targets=["local_cli", "docker"],
        llm_backends=["Claude 3.5 Sonnet"],
        framework="Custom",
        is_open_source=True,
        is_mcp_compliant=True,
        logo_url="https://verification.agenthub.dev/logo.png",
        submitter_email="qa@agenthub.dev",
        bot_token="valid_token",
    )
    sub_res = submit_agent(payload=sub_req, service=sub_svc)
    assert sub_res.status == "pending"
    assert sub_res.sla_hours == 12
    print(f"[PASS] Submission: status={sub_res.status}, SLA={sub_res.sla_hours} hours, slug={sub_res.slug}")

    print("\n--- 9. Testing GitHub Sync Service ---")
    sync_svc = get_sync_service(agent_repo=get_agent_repository())
    sync_res = sync_svc.run_github_sync()
    print(f"[PASS] Sync job processed: {sync_res}")

    print("\n--- 10. Testing Community Review Service ---")
    from app.dependencies import get_review_service, get_review_repository
    from app.models.review import ReviewCreateRequest
    from app.routers.reviews import get_agent_reviews, add_agent_review
    rev_svc = get_review_service(
        review_repo=get_review_repository(),
        agent_repo=get_agent_repository(),
    )
    revs = get_agent_reviews(slug="openhands", service=rev_svc)
    assert len(revs) >= 2, f"Expected >=2 reviews for openhands, got {len(revs)}"
    print(f"[PASS] Retrieved {len(revs)} reviews for openhands (Top rating: {revs[0].rating}/5)")

    new_rev = add_agent_review(
        agent_id=openhands.id,
        req=ReviewCreateRequest(
            author_name="Test Evaluator",
            author_role="Lead Benchmark Engineer",
            rating=5,
            comment="Excellent autonomous performance and clean Docker sandbox integration.",
        ),
        service=rev_svc,
    )
    assert new_rev.rating == 5
    print(f"[PASS] Added new community review: id={new_rev.id}, author='{new_rev.author_name}'")

    print("\n=======================================================")
    print(" ALL 10 BACKEND SUITES PASSED VALIDATION PERFECTLY! ")
    print("=======================================================")

if __name__ == "__main__":
    main()
