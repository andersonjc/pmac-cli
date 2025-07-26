# Jira-PMaC Integration Architecture Specification

## Overview

This specification defines the architecture for bidirectional synchronization between Jira projects and PMaC (Project Management as Code) backlogs. The integration maintains Jira as the authoritative source for complex project management data while enabling teams to use PMaC methodology for day-to-day task management.

## Core Principles

1. **Jira is Master**: Complex organizational changes are made in Jira, then imported to PMaC
2. **PMaC for Daily Management**: Simple field updates (status, priority, hours) happen in PMaC
3. **Git Tracks Changes**: All PMaC changes are version-controlled and auditable
4. **Creation Flexibility**: New tasks can be fully specified in PMaC during planning
5. **Protection After Sync**: Complex fields become Jira-protected after first sync

## Field Protection Model

### Always PMaC Writable → Sync to Jira
These fields can always be updated in PMaC and will sync to Jira:

| PMaC Field | Jira Field | Description |
|------------|------------|-------------|
| `title` | `summary` | Task title/name |
| `status` | `status` | Workflow status (cannot trigger phase changes) |
| `priority` | `priority` | Task priority level |
| `estimated_hours` | `timeoriginalestimate` | Original time estimate |
| `actual_hours` | `timespent` | Time actually spent |
| `notes` | `comments` | Bidirectional sync with accurate timestamps |

### Creation-Time Writable, Then Jira Master
These fields can be set when creating new tasks in PMaC, but become Jira-protected after first sync:

| PMaC Field | Jira Field | Creation Behavior | Post-Sync Behavior |
|------------|------------|-------------------|-------------------|
| `id` | `key` | PMaC assigns using project sequence | Jira owns, no changes allowed |
| `phase` | `epic_link` + `components` | PMaC can assign to phase | Changes require Jira modification + re-import |
| `requirements` | `description` + structured data | PMaC can specify | Must be updated in Jira |
| `acceptance_criteria` | `description` + structured data | PMaC can specify | Must be updated in Jira |
| `dependencies` | `issuelinks` (depends_on) | PMaC can specify | Must be updated in Jira |
| `blocks` | `issuelinks` (blocks) | PMaC can specify | Must be updated in Jira |
| `assignee` | `assignee` | PMaC can assign | Must be updated in Jira |

### System Managed Fields
These fields are managed programmatically and not user-editable:

| PMaC Field | Description |
|------------|-------------|
| `jira_id` | Reference to Jira issue key |
| `last_updated` | Timestamp of last modification (programmatic only) |
| `last_synced` | Timestamp of last sync with Jira (programmatic only) |
| `jira_synced` | Boolean flag indicating if local changes need sync |

## API Integration

### Jira REST API v3
- **Authentication**: API tokens with Basic Auth (base64 encoded)
- **Scope**: Single Jira instance, single project per configuration
- **Rate Limiting**: Pre-operation estimation with user warnings
- **Error Handling**: Comprehensive error categorization with actionable messages

### Field Mapping Strategy
- **Status Mapping**: Configurable mapping between Jira and PMaC workflow states
- **Priority Mapping**: Configurable mapping between priority systems
- **Phase Detection**: Epic-based phase mapping with "development" fallback
- **Custom Fields**: Focus only on fields that map to PMaC schema

## Three-Operation Model

### 1. Import (`pmac jira import`)
**Purpose**: Pull all changes from Jira (after organizational changes)

**Behavior**:
- Fetch all Jira issues for configured project
- Import existing Jira comments as PMaC notes with accurate timestamps
- Update ALL fields in PMaC from Jira data
- Delete PMaC tasks for archived/deleted Jira issues (tracked in git)
- Reset `jira_synced` flags to true
- Update `last_synced` timestamp

**Use Cases**:
- Initial project import
- After major reorganization in Jira
- After dependency/phase changes made in Jira
- Periodic full sync validation

### 2. Export (`pmac jira export`)
**Purpose**: Push PMaC changes to Jira (respecting field protection)

**Behavior**:
- Find tasks with `jira_synced = false` or new tasks without `jira_id`
- **For new tasks**: Create Jira issue with ALL PMaC fields (including complex ones)
- **For existing tasks**: Update only always-writable fields
- After successful creation, complex fields become Jira-protected in PMaC
- Append new notes as Jira comments with accurate timestamps
- Prevent phase changes via status updates on existing tasks
- Set `jira_synced = true` on successful export
- Update `last_synced` timestamp

**Use Cases**:
- Creating new tasks planned in PMaC
- Pushing daily status/priority/hours updates
- Syncing new notes and comments

### 3. Sync (`pmac jira sync`)
**Purpose**: Bidirectional sync (export first, then import)

**Behavior**:
- Execute export operation first (push PMaC changes)
- Then execute import operation (pull Jira updates)
- Handle deletions from Jira (remove from PMaC, git tracks deletion)
- Handle new issues in Jira (add to PMaC)
- Handle dependency/phase/assignment changes from Jira
- Maintain accurate timestamps throughout process

**Use Cases**:
- Regular team sync workflow
- Before important project meetings
- End-of-day reconciliation

### 4. Status (`pmac jira status`)
**Purpose**: Show sync status and history

**Information Displayed**:
- Last sync timestamp
- Number of locally modified tasks (jira_synced = false)
- Tasks with protection status (new vs existing)
- Recent sync history summary
- Configuration validation status

## Configuration Management

### Configuration Structure
```yaml
# Added to existing PMaC configuration
jira:
  api_url: "https://company.atlassian.net"
  project_key: "PROJ"
  
  # Credentials via environment variables
  # JIRA_EMAIL and JIRA_API_TOKEN
  
  # Field mappings
  status_mapping:
    "To Do": "ready"
    "In Progress": "in_progress"
    "In Review": "testing"
    "Done": "completed"
    "Blocked": "blocked"
    
  priority_mapping:
    "Highest": "critical"
    "High": "high"
    "Medium": "medium"
    "Low": "low"
```

### Security Model
- **Credentials**: Stored in environment variables (JIRA_EMAIL, JIRA_API_TOKEN)
- **Config Sharing**: Configuration files committed to git (without credentials)
- **Team Collaboration**: Standard version control workflows for config changes

## Schema Extensions

### PMaC Task Schema Updates
```typescript
interface PMaCTask {
  // Existing fields...
  
  // New Jira integration fields
  jira_id?: string;           // Jira issue key (PROJECT-123)
  last_updated?: string;      // ISO timestamp (programmatic only)
  last_synced?: string;       // ISO timestamp (programmatic only)
  jira_synced?: boolean;      // Local changes flag
}
```

### Validation Rules
- `jira_id` must match format: `[A-Z]+-\d+` when present
- Timestamps must be ISO 8601 format
- `jira_synced` defaults to `false` for new/modified tasks

## Notes and Comments Synchronization

### Bidirectional Notes Sync
- **PMaC → Jira**: Each new note becomes a Jira comment with attribution
- **Jira → PMaC**: Import ALL existing comments as notes with attribution
- **Timestamp Accuracy**: All timestamps programmatically generated, never manual
- **Attribution Format**: 
  - To Jira: "Added via PMaC by [user]"
  - From Jira: "Author: [jira_user] via Jira"

### Deduplication Strategy
- Mark imported notes to prevent re-export
- Maintain comment/note mapping for sync integrity
- Preserve conversation order and threading

## Task ID Management

### New Task Creation
- PMaC assigns ID using project key sequence (e.g., PROJ-123)
- Create Jira issue with PMaC-assigned ID on export
- ID becomes protected after successful Jira creation
- Fail task creation if ID cannot be reserved in Jira

### Existing Task Import
- PMaC task ID must equal Jira issue key exactly
- Import preserves Jira key as authoritative ID
- No ID conflicts possible - Jira is source of truth

### Deletion Handling
- Jira deletion → remove task from PMaC backlog YAML
- Git commit shows deleted tasks clearly
- No archiving - clean removal for clarity and git tracking

## Error Handling and Resilience

### Transaction Model
- **Atomic Operations**: Complete success or complete rollback
- **No Partial Failures**: Avoid inconsistent state between systems
- **Pre-validation**: Check requirements before starting operations

### Rate Limiting
- **Pre-operation Check**: Estimate API calls needed vs limits
- **User Warnings**: Clear notifications when approaching limits
- **Hard Limits**: Refuse operations that would exceed quotas

### Error Categories
1. **Configuration Errors**: Invalid credentials, missing fields
2. **Validation Errors**: Missing required fields, invalid formats
3. **API Errors**: Network issues, authentication failures, rate limits
4. **Data Errors**: Conflicts, missing dependencies, invalid references

### Recovery Strategy
- **Clear Error Messages**: Specific field and task identification
- **Resolution Guidance**: Actionable steps to fix issues
- **Rollback Capability**: Return to consistent state on failures

## CLI Command Interface

### Configuration
```bash
# One-time setup
pmac jira init
```

### Operations (all use configuration for parameters)
```bash
# Import from Jira (after organizational changes)
pmac jira import [--dry-run]

# Export PMaC changes to Jira
pmac jira export [--dry-run]

# Bidirectional sync (export then import)
pmac jira sync [--dry-run]

# Show sync status and history
pmac jira status
```

### Dry-Run Mode
- Available for all operations
- Shows exactly what would change without making changes
- Validates configuration and data before execution
- Provides detailed operation preview

## Implementation Timeline

### Phase 1: Foundation (Week 1)
- **JIRA-001**: Schema extensions with field protection tracking
- **JIRA-002**: Configuration management and secure credential storage

### Phase 2: Core Integration (Week 2)
- **JIRA-003**: Jira API client with v3 authentication
- **JIRA-004**: Data protection engine with creation vs existing task rules

### Phase 3: Commands & Polish (Week 3)
- **JIRA-005**: Three-operation command implementation
- **JIRA-006**: Documentation and testing

**Total Effort**: 66 hours over 2-3 weeks

## Success Criteria

### Technical
- Creation-time field flexibility with post-creation protection maintains Jira authority
- Three-operation model (import/export/sync) provides clear workflow separation
- Notes bidirectional sync preserves conversation history across platforms
- Atomic operations ensure complete success or complete rollback
- Programmatic timestamp management enables reliable sync tracking
- Task deletion tracking via git provides clear audit trail

### Business
- Teams can fully specify new tasks in PMaC during planning phase
- Complex field changes remain visible in Jira for project management
- Simple field updates sync seamlessly for day-to-day task management
- Git-committed configuration enables team collaboration
- Data protection prevents accidental complex updates on existing tasks

### PMaC Methodology
- Complete development audit trail maintained in Git + prompt logs
- All requirements traceable from architectural decisions to implementation
- Jira integration enhances PMaC without compromising methodology principles
- Simplified approach reduces maintenance burden and complexity

## Risk Mitigation

### High Risk
- **Large project imports exceeding API rate limits**
  - Mitigation: Pre-import estimation with user warnings and hard limits

- **Field protection state confusion between new vs existing tasks**
  - Mitigation: Clear schema tracking and validation with helpful error messages

### Medium Risk
- **Notes sync conflicts with timestamp accuracy requirements**
  - Mitigation: Programmatic timestamp management with bidirectional conflict detection

- **Task deletion causing data loss concerns**
  - Mitigation: Git tracking provides complete audit trail and recovery capability