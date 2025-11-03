#!/usr/bin/env python3
import re

with open('src/modules/admin/services/reports.service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Change IN_REVIEW to UNDER_REVIEW
content = content.replace('ReportStatus.IN_REVIEW', 'ReportStatus.UNDER_REVIEW')

# Fix 2: Remove the "updatedAt: { not: null }" filter (line 187)
# updatedAt is never null in Prisma, so this filter is invalid
content = re.sub(
    r'where: \{\s+status: ReportStatus\.RESOLVED,\s+updatedAt: \{ not: null \},\s+\}',
    'where: {\n        status: ReportStatus.RESOLVED,\n      }',
    content
)

# Fix 3: Change report.resourceId to report.targetId (lines 267, 279)
content = content.replace('report.resourceId', 'report.targetId')

# Fix 4: Fix h.userId null check (line 311)
# Change: where: { id: h.userId }
# To: where: { id: h.userId || '' }
# Or better: only fetch if userId is not null
old_history_map = re.search(
    r'(const historyWithUsers = await Promise\.all\(\s+moderationHistory\.map\(async \(h\) => \{)([\s\S]*?)(\}\s+\)\s+\);)',
    content,
    re.MULTILINE
)

if old_history_map:
    new_history_map = '''const historyWithUsers = await Promise.all(
      moderationHistory.map(async (h) => {
        const user = h.userId ? await this.prisma.user.findUnique({
          where: { id: h.userId },
          select: { id: true, username: true },
        }) : null;
        return {
          id: h.id,
          action: h.event, // DTO expects 'action' not 'event'
          performedBy: user || { id: h.userId || 'unknown', username: 'Unknown' },
          timestamp: h.createdAt.toISOString(),
          notes: ((h.meta as any)?.notes || null) as string | null,
        };
      })
    );'''
    content = content.replace(old_history_map.group(0), new_history_map)

# Fix 5: Fix relatedReports status type (line 352)
# Cast status to the DTO enum
content = re.sub(
    r'relatedReports: relatedReports\.map\(\(r\) => \(\{\s+\.\.\.r,\s+createdAt: r\.createdAt\.toISOString\(\),\s+\}\)\)',
    '''relatedReports: relatedReports.map((r) => ({
        id: r.id,
        reason: r.reason,
        status: r.status as any, // Cast Prisma enum to DTO enum
        createdAt: r.createdAt.toISOString(),
      }))''',
    content,
    flags=re.MULTILINE
)

# Fix 6: Change data.resource to data.targetType (line 370)
content = content.replace('data.resource', 'data.targetType')

# Write the fixed file
with open('src/modules/admin/services/reports.service.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed reports.service.ts')
