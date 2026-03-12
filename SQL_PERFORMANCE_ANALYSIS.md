# SQL Query Performance Analysis & Optimization

**Database:** fusio  
**Main Table:** dbo.u_smlouvy (contracts/agreements)  
**Execution Date:** 2026-01-26  
**Estimated Total Cost:** 1735.9  
**Estimated Rows:** 985.788  

---

## Executive Summary

This query retrieves contract data with complex business logic calculations. The high cost (1735.9) indicates significant performance issues. Since the query cannot be modified, optimization must focus on **indexing strategy** and **statistics management**.

### Key Findings:
- ⚠️ **HIGH COST**: Total subtree cost of 1735.9 is extremely high for ~986 rows
- 🔍 **MISSING INDEXES**: Multiple LEFT OUTER JOINs likely missing covering indexes
- 🐌 **NESTED CASE STATEMENTS**: Complex conditional logic evaluated per row
- 📊 **PARAMETER SNIFFING**: 259+ parameters may cause plan cache issues

---

## Execution Plan Breakdown

### 1. Main Operations

```
ComputeScalar (Cost: 0.0000985788)
├─ Multiple nested CASE statements
├─ ISNULL operations
├─ Complex conditional evaluations
└─ Data type conversions (ISNUMERIC, CONVERT)
```

### 2. Tables Involved (Based on Aliases)

| Alias | Likely Table | Purpose |
|-------|-------------|---------|
| S0_u_smlouvy | u_smlouvy (main) | Contracts/Agreements |
| S1_attachment_subquery | Aggregated attachment counts | File attachments |
| S2_f_contact | f_contact | Contact information |
| S4_f_contact | f_contact | Secondary contact |
| S6_sys_user | sys_user | User information |
| S8_u_obchodni_prilezitosti | u_obchodni_prilezitosti | Business opportunities |
| S10_u_smlouvy | u_smlouvy (self-join) | Parent contract data |
| S12_u_obchodni_prilezitosti | u_obchodni_prilezitosti | Additional business data |
| S14_u_schvalovani | u_schvalovani | Approval workflows |
| S16_sys_user | sys_user | Additional user |
| S18_u_strediska | u_strediska | Cost centers |
| S20_u_smlouvy | u_smlouvy (self-join) | Related contract calculations |
| S26_u_smlouvy | u_smlouvy (self-join) | Amendment contract data |
| S32_u_smlouvy | u_smlouvy (self-join) | Additional contract sum |
| S34_u_smlouvy | u_smlouvy (self-join) | Amendment sum |

**Note:** Multiple self-joins on `u_smlouvy` suggest hierarchical or amendment relationships.

---

## Bottleneck Analysis

### 🔴 Critical Issues

#### 1. **Multiple Self-Joins on u_smlouvy**
- **Impact:** At least 5+ self-joins on the same table
- **Pattern:** Likely joining on `dodatek_smlouvy_id` (amendment relationship)
- **Cost:** Each additional join multiplies the access cost

#### 2. **Complex CASE Statement Evaluations**
```sql
CASE WHEN ISNUMERIC(@P17)=1 THEN CAST(@P17 AS INT) END = @P18 
  THEN [odbytova_cena]
WHEN [column] = @P19 THEN [odbytova_cena]
WHEN [column] = @P20 THEN [odbytova_cena]
-- ... 13+ conditions
ELSE @P16 
END
```
- **Impact:** Evaluated for every row (985 times)
- **Contains:** Type conversions, repeated column access

#### 3. **Nested Conditional Logic**
- **Pattern:** CASE statements nested 3-4 levels deep
- **Impact:** Each level checks `dodatek_smlouvy_id IS NULL/IS NOT NULL`
- **Repetition:** Same logic duplicated multiple times in SELECT list

### 🟡 Moderate Issues

#### 4. **No Memory Grant Needed (GrantedMemory=0)**
- **Positive:** No sorts or hash operations
- **Implication:** Likely relying on NESTED LOOPS joins (index-dependent)

#### 5. **Plan from Cache (RetrievedFromCache=true)**
- **Risk:** Parameter sniffing with 259+ parameters
- **Potential Issue:** Cached plan may not be optimal for all parameter value combinations

#### 6. **Data Type Conversions**
- Multiple `CONVERT_IMPLICIT` operations
- `ISNUMERIC()` function calls
- May prevent index usage on converted columns

---

## Index Recommendations

### 🎯 High Priority Indexes

#### Index 1: Main Table Covering Index
```sql
-- Primary filtering and join optimization for u_smlouvy
CREATE NONCLUSTERED INDEX IX_u_smlouvy_Covering_Main
ON dbo.u_smlouvy (
    id,
    dodatek_smlouvy_id,
    deleted,
    locked,
    zavod,
    druh_smlouvy_enum_item_id,
    stav_smlouvy_enum_item_id,
    zpusob_podpisu_enum_item_id,
    mena_id,
    stav_schvalovani_ref_enum_item_id
)
INCLUDE (
    cislo_smlouvy,
    popis_nazev_smlouvy,
    platnost_do,
    datum_podpisu_smlouvy,
    datum_a_cas_vytvoreni,
    odbytova_cena,
    dodavatelska_cena
)
WITH (FILLFACTOR = 90, ONLINE = ON);
```

**Rationale:**
- Covers most SELECT columns
- Supports self-joins on `dodatek_smlouvy_id`
- Includes filtering columns (`deleted`, `locked`, `zavod`)

---

#### Index 2: Self-Join Optimization
```sql
-- Optimize self-joins on dodatek_smlouvy_id (parent-child relationship)
CREATE NONCLUSTERED INDEX IX_u_smlouvy_Dodatek_SmlouvyID
ON dbo.u_smlouvy (dodatek_smlouvy_id)
INCLUDE (
    id,
    odbytova_cena,
    dodavatelska_cena
)
WHERE dodatek_smlouvy_id IS NOT NULL
WITH (FILLFACTOR = 90, ONLINE = ON);
```

**Rationale:**
- Filtered index for amendment contracts
- Smaller, more efficient for LEFT OUTER JOINs
- Includes calculated price columns

---

#### Index 3: Business Opportunity Lookups
```sql
-- Optimize joins to u_obchodni_prilezitosti
CREATE NONCLUSTERED INDEX IX_u_obchodni_prilezitosti_Covering
ON dbo.u_obchodni_prilezitosti (
    id
)
INCLUDE (
    -- Add columns referenced in CASE statements
    -- These appear to be status/category columns based on pattern
    [column_matching_C26_ID1377],
    [column_matching_C27_ID1376],
    [column_matching_C28_ID1078],
    [column_matching_C29_ID1375],
    [column_matching_C30_ID1374],
    [column_matching_C31_ID1388],
    [column_matching_C32_ID1373]
)
WITH (FILLFACTOR = 90, ONLINE = ON);
```

**Note:** Replace `[column_matching_*]` with actual column names from your schema.

---

#### Index 4: Foreign Key Indexes
```sql
-- Ensure foreign keys have supporting indexes

-- Contact references
CREATE NONCLUSTERED INDEX IX_u_smlouvy_ContactFK
ON dbo.u_smlouvy ([contact_id_column])
WITH (FILLFACTOR = 90, ONLINE = ON);

-- User references  
CREATE NONCLUSTERED INDEX IX_u_smlouvy_UserFK
ON dbo.u_smlouvy ([user_id_column])
WITH (FILLFACTOR = 90, ONLINE = ON);

-- Business opportunity reference
CREATE NONCLUSTERED INDEX IX_u_smlouvy_ObchodniPrilezitostFK
ON dbo.u_smlouvy ([obchodni_prilezitost_id])
WITH (FILLFACTOR = 90, ONLINE = ON);

-- Cost center reference
CREATE NONCLUSTERED INDEX IX_u_smlouvy_StredikaFK  
ON dbo.u_smlouvy ([strediska_id])
WITH (FILLFACTOR = 90, ONLINE = ON);
```

---

### 🎯 Medium Priority Indexes

#### Index 5: Approval Workflow Lookups
```sql
CREATE NONCLUSTERED INDEX IX_u_schvalovani_Covering
ON dbo.u_schvalovani (
    id
)
INCLUDE (
    [approval_status_column] -- Column referenced as C34_ID1040
)
WITH (FILLFACTOR = 90, ONLINE = ON);
```

---

#### Index 6: Contact Table
```sql
CREATE NONCLUSTERED INDEX IX_f_contact_Covering
ON dbo.f_contact (
    id
)
INCLUDE (
    [name_or_display_column] -- Column referenced as C10_ID190, C13_ID786
)
WITH (FILLFACTOR = 90, ONLINE = ON);
```

---

#### Index 7: User Table
```sql
CREATE NONCLUSTERED INDEX IX_sys_user_Covering
ON dbo.sys_user (
    id
)
INCLUDE (
    [name_or_username_column], -- C17_ID27, C41_ID1372
    [avatar_or_profile_column]
)
WITH (FILLFACTOR = 90, ONLINE = ON);
```

---

#### Index 8: Cost Center Table
```sql
CREATE NONCLUSTERED INDEX IX_u_strediska_Covering
ON dbo.u_strediska (
    id
)
INCLUDE (
    [name_or_code_column] -- C44_ID394
)
WITH (FILLFACTOR = 90, ONLINE = ON);
```

---

## Statistics Management

### Update Statistics
```sql
-- Ensure statistics are current
UPDATE STATISTICS dbo.u_smlouvy WITH FULLSCAN;
UPDATE STATISTICS dbo.u_obchodni_prilezitosti WITH FULLSCAN;
UPDATE STATISTICS dbo.f_contact WITH FULLSCAN;
UPDATE STATISTICS dbo.sys_user WITH FULLSCAN;
UPDATE STATISTICS dbo.u_schvalovani WITH FULLSCAN;
UPDATE STATISTICS dbo.u_strediska WITH FULLSCAN;
```

### Auto-Update Statistics Configuration
```sql
-- Check if AUTO_UPDATE_STATISTICS is enabled
SELECT name, is_auto_update_stats_on, is_auto_update_stats_async_on
FROM sys.databases
WHERE name = 'fusio';

-- If not enabled:
ALTER DATABASE fusio SET AUTO_UPDATE_STATISTICS ON;
ALTER DATABASE fusio SET AUTO_UPDATE_STATISTICS_ASYNC ON;
```

---

## Additional Optimization Strategies

### 1. **Query Store Analysis**
```sql
-- Enable Query Store to monitor parameter sniffing
ALTER DATABASE fusio SET QUERY_STORE = ON;
ALTER DATABASE fusio SET QUERY_STORE (
    OPERATION_MODE = READ_WRITE,
    MAX_STORAGE_SIZE_MB = 1000,
    QUERY_CAPTURE_MODE = AUTO
);

-- Find this query in Query Store
SELECT 
    q.query_id,
    qt.query_sql_text,
    rs.avg_duration/1000.0 AS avg_duration_ms,
    rs.avg_logical_io_reads,
    rs.count_executions
FROM sys.query_store_query q
JOIN sys.query_store_query_text qt ON q.query_text_id = qt.query_text_id
JOIN sys.query_store_plan p ON q.query_id = p.query_id
JOIN sys.query_store_runtime_stats rs ON p.plan_id = rs.plan_id
WHERE qt.query_sql_text LIKE '%u_smlouvy%'
ORDER BY rs.avg_duration DESC;
```

---

### 2. **Parameter Sniffing Mitigation**

Since you have 259+ parameters and cannot change the query, consider:

```sql
-- Option A: Use OPTIMIZE FOR UNKNOWN hint (requires query modification)
-- Not applicable since query cannot be changed

-- Option B: Clear plan cache for this specific query
-- Get the SQL handle from execution plan
DBCC FREEPROCCACHE (0x09005FF70A3DFCB092A691FA4BB006B1C8BF0000000000000000000000000000000000000000000000000000);

-- Option C: Recompile on each execution (database level - use cautiously)
-- This forces fresh plan each time
ALTER DATABASE SCOPED CONFIGURATION SET PARAMETER_SNIFFING = OFF;
```

**Recommendation:** Start with **Option B** (clear specific plan) and monitor. Option C is drastic.

---

### 3. **Computed Columns for Complex Logic**

Since CASE statements cannot be changed in query, add persisted computed columns:

```sql
-- Example: Pre-calculate odbytova_cena logic
ALTER TABLE dbo.u_smlouvy
ADD odbytova_cena_calculated AS (
    ISNULL(
        CASE 
            WHEN [some_condition] THEN odbytova_cena
            WHEN [another_condition] THEN odbytova_cena
            ELSE 0
        END,
        0
    )
) PERSISTED;

-- Then create index on computed column
CREATE NONCLUSTERED INDEX IX_u_smlouvy_ComputedPrice
ON dbo.u_smlouvy (odbytova_cena_calculated);
```

**Note:** This requires knowing the exact business logic. Coordinate with application developers.

---

### 4. **Indexed Views (Materialized Views)**

For subqueries like `S1_attachment_subquery`:

```sql
-- Create indexed view for attachment counts
CREATE VIEW dbo.vw_u_smlouvy_AttachmentCounts
WITH SCHEMABINDING
AS
SELECT 
    smlouvy_id,
    COUNT_BIG(*) AS attachment_count
FROM dbo.attachments_table -- Replace with actual table
GROUP BY smlouvy_id;
GO

-- Create unique clustered index to materialize view
CREATE UNIQUE CLUSTERED INDEX IX_vw_AttachmentCounts
ON dbo.vw_u_smlouvy_AttachmentCounts (smlouvy_id);
```

**Benefit:** SQL Server can use this automatically even if query doesn't reference view directly.

---

## Monitoring & Validation

### 1. **Missing Index Recommendations**
```sql
-- Check what SQL Server recommends
SELECT 
    migs.avg_user_impact,
    migs.avg_total_user_cost,
    migs.user_seeks + migs.user_scans AS total_reads,
    mid.statement,
    mid.equality_columns,
    mid.inequality_columns,
    mid.included_columns
FROM sys.dm_db_missing_index_groups mig
JOIN sys.dm_db_missing_index_group_stats migs ON mig.index_group_handle = migs.group_handle
JOIN sys.dm_db_missing_index_details mid ON mig.index_handle = mid.index_handle
WHERE mid.database_id = DB_ID('fusio')
  AND mid.statement LIKE '%u_smlouvy%'
ORDER BY migs.avg_user_impact DESC;
```

---

### 2. **Execution Plan Analysis**
```sql
-- Capture actual execution plan
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

-- Run your query here
-- [PASTE YOUR QUERY]

SET STATISTICS IO OFF;
SET STATISTICS TIME OFF;
```

Monitor for:
- **Logical reads** > 10,000 per table (indicates missing indexes)
- **Scans** instead of **Seeks**
- **High CPU time** (complex calculations)

---

### 3. **Wait Statistics**
```sql
-- Check what query is waiting on
SELECT 
    wait_type,
    wait_time_ms,
    waiting_tasks_count,
    wait_time_ms / waiting_tasks_count AS avg_wait_ms
FROM sys.dm_os_wait_stats
WHERE wait_type NOT IN (
    'CLR_SEMAPHORE', 'LAZYWRITER_SLEEP', 'RESOURCE_QUEUE',
    'SLEEP_TASK', 'SLEEP_SYSTEMTASK', 'SQLTRACE_BUFFER_FLUSH', 'WAITFOR'
)
ORDER BY wait_time_ms DESC;
```

---

## Performance Expectations

### Before Optimization
- **Estimated Cost:** 1735.9
- **Estimated Rows:** 985.788
- **Execution Time:** Likely 2-5+ seconds

### After Index Implementation
- **Expected Cost Reduction:** 60-80% (to ~350-690)
- **Execution Time:** Should drop to <500ms
- **Key Improvements:**
  - Self-joins use index seeks instead of scans
  - Foreign key lookups optimized
  - Computed values pre-materialized

---

## Implementation Plan

### Phase 1: Quick Wins (Day 1)
1. ✅ Update statistics on all tables
2. ✅ Create **Index 1** (Main covering index)
3. ✅ Create **Index 2** (Self-join optimization)
4. ✅ Test query performance

### Phase 2: Foreign Key Indexes (Day 2)
1. ✅ Create **Index 4** (All FK indexes)
2. ✅ Test query performance
3. ✅ Monitor for improvements

### Phase 3: Lookup Table Indexes (Day 3)
1. ✅ Create **Index 3, 5, 6, 7, 8** (Lookup tables)
2. ✅ Update statistics again
3. ✅ Capture new execution plan

### Phase 4: Advanced Optimization (Week 2)
1. ✅ Analyze Query Store data
2. ✅ Consider indexed views if needed
3. ✅ Evaluate computed columns
4. ✅ Address parameter sniffing if still an issue

---

## Maintenance Recommendations

### Weekly
```sql
-- Rebuild fragmented indexes (>30% fragmentation)
SELECT 
    OBJECT_NAME(ips.object_id) AS TableName,
    i.name AS IndexName,
    ips.avg_fragmentation_in_percent,
    'ALTER INDEX ' + i.name + ' ON ' + OBJECT_NAME(ips.object_id) + ' REBUILD;' AS RebuildCommand
FROM sys.dm_db_index_physical_stats(DB_ID('fusio'), NULL, NULL, NULL, 'LIMITED') ips
JOIN sys.indexes i ON ips.object_id = i.object_id AND ips.index_id = i.index_id
WHERE ips.avg_fragmentation_in_percent > 30
  AND i.name IS NOT NULL;
```

### Monthly
```sql
-- Update statistics with full scan
EXEC sp_updatestats;
```

---

## Risk Assessment

| Change | Risk Level | Mitigation |
|--------|-----------|------------|
| Create indexes | 🟢 LOW | Use `ONLINE = ON`, test in staging first |
| Update statistics | 🟢 LOW | Standard maintenance operation |
| Clear plan cache | 🟡 MEDIUM | Do during low-traffic period, clears ALL plans |
| Indexed views | 🟡 MEDIUM | Test thoroughly, affects INSERT/UPDATE performance |
| Computed columns | 🟡 MEDIUM | Requires schema change, coordinate with dev team |
| Disable parameter sniffing | 🔴 HIGH | Affects all queries, only if proven necessary |

---

## Success Metrics

Track these KPIs before and after optimization:

```sql
-- Query execution statistics
SELECT 
    execution_count,
    total_elapsed_time / 1000.0 AS total_elapsed_ms,
    total_elapsed_time / execution_count / 1000.0 AS avg_elapsed_ms,
    total_logical_reads / execution_count AS avg_logical_reads,
    total_worker_time / execution_count / 1000.0 AS avg_cpu_ms
FROM sys.dm_exec_query_stats
WHERE sql_handle = 0x09005FF70A3DFCB092A691FA4BB006B1C8BF0000000000000000000000000000000000000000000000000000
ORDER BY last_execution_time DESC;
```

**Target Goals:**
- ✅ Avg elapsed time < 500ms
- ✅ Avg logical reads < 5,000
- ✅ Avg CPU time < 200ms
- ✅ Cost reduction to < 500

---

## Contact & Next Steps

1. **Review this analysis** with your DBA team
2. **Test indexes in staging** environment first
3. **Capture baseline metrics** before making changes
4. **Implement Phase 1** and measure impact
5. **Iterate** based on results

**Need Help?** Share the actual execution plan XML and schema to get more specific column-level index recommendations.

---

*Analysis Date: 2026-01-26*  
*Analyst: Antigravity AI Assistant*  
*Query Plan Hash: 0x29571D6FA680626E*
