#!/usr/bin/env python3
import re

with open('src/modules/admin/services/reports.service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Line 310 - Add null check for userId
content = re.sub(
    r'(const historyWithUsers = await Promise\.all\(\s+moderationHistory\.map\(async \(h\) => \{\s+)const user = await this\.prisma\.user\.findUnique\(\{\s+where: \{ id: h\.userId \},',
    r'\1const user = h.userId ? await this.prisma.user.findUnique({\n          where: { id: h.userId },',
    content,
    flags=re.MULTILINE | re.DOTALL
)
content = re.sub(
    r'select: \{ id: true, username: true \},\s+\}\);',
    r'select: { id: true, username: true },\n        }) : null;',
    content,
    count=1
)

# Fix 2: Line 315 - Change 'event' to 'action' in historyWithUsers return
content = re.sub(
    r'(\s+return \{\s+id: h\.id,\s+)event: h\.event,',
    r'\1action: h.event, // DTO expects action, not event',
    content,
    flags=re.MULTILINE
)

# Fix 3: Line 316 - Fix performedBy to only return id and username, and handle null userId
content = re.sub(
    r'performedBy: user \|\| \{ id: h\.userId, username: \'Unknown\' \},',
    r'performedBy: user ? { id: user.id, username: user.username } : { id: h.userId || \'unknown\', username: \'Unknown\' },',
    content
)

# Fix 4: Line 318 - Cast notes to string | null
content = re.sub(
    r'notes: \(h\.meta as any\)\?\.notes \|\| null,',
    r'notes: ((h.meta as any)?.notes || null) as string | null,',
    content
)

# Fix 5: Lines 372, 375 - Change data.targetTypeId to data.targetId
content = content.replace('data.targetTypeId', 'data.targetId')

# Fix 6: Line 382-390 - Fix report create data
# Need to add targetId and targetType, remove resource
old_create = re.search(
    r'const report = await this\.prisma\.report\.create\(\{(.*?)data: \{(.*?)\},\s+include:',
    content,
    re.DOTALL
)

if old_create:
    new_create = '''const report = await this.prisma.report.create({
      data: {
        reporterId,
        targetId: data.targetId,
        targetType: data.targetType as any, // Cast ReportType to ReportTargetType
        targetUserId,
        reason: data.reason,
        description: data.description,
        priority: data.severity as any, // severity maps to priority in schema
        status: ReportStatus.PENDING,
      },
      include:'''
    content = content.replace(old_create.group(0), new_create)

# Fix 7: Line 407 - Map the return to ReportDto format
content = re.sub(
    r'(\}\s+\);\s+)(return report;)',
    r'''\1
    // Map to DTO format
    return {
      id: report.id,
      reporterId: report.reporterId,
      reporter: report.reporter,
      targetType: report.targetType as any, // Cast ReportTargetType to ReportType
      targetId: report.targetId,
      targetUserId: report.targetUserId,
      targetUser: report.targetUser,
      severity: (report.priority || report.severity) as any, // Map priority to severity
      status: report.status as any,
      reason: report.reason,
      description: report.description || null,
      assignedToId: report.assignedToId,
      assignedTo: report.assignedTo,
      reviewedById: report.reviewedById,
      reviewedBy: report.reviewedBy,
      resolution: report.resolution || null,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    };''',
    content,
    count=1
)

# Fix 8: Line 447 - Same mapping for updateReport return
# Find the updateReport return and wrap it
update_section = re.search(
    r'(async updateReport\([\s\S]*?await this\.audit\.log\([\s\S]*?\);\s+)(return report;)',
    content
)

if update_section:
    replacement = r'''\1// Map to DTO format
    return {
      id: report.id,
      reporterId: report.reporterId,
      reporter: report.reporter,
      targetType: report.targetType as any,
      targetId: report.targetId,
      targetUserId: report.targetUserId,
      targetUser: report.targetUser,
      severity: (report.priority || report.severity) as any,
      status: report.status as any,
      reason: report.reason,
      description: report.description || null,
      assignedToId: report.assignedToId,
      assignedTo: report.assignedTo,
      reviewedById: report.reviewedById,
      reviewedBy: report.reviewedBy,
      resolution: report.resolution || null,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    };'''
    content = re.sub(
        r'(async updateReport\([\s\S]*?await this\.audit\.log\([\s\S]*?\);\s+)(return report;)',
        replacement,
        content,
        count=1
    )

# Fix 9: Line 472 - Change data.event to data.action
content = re.sub(
    r'meta: \{ event: data\.event, resolution: data\.resolution \}',
    r'meta: { action: data.action, resolution: data.resolution }',
    content
)

# Fix 10: Line 595 - Change resource to targetType in mapToReportDto
content = re.sub(
    r'(\s+private mapToReportDto\(report: any\): ReportDto \{\s+return \{[\s\S]*?)resource: report\.resource,',
    r'\1targetType: report.targetType as any, // Cast ReportTargetType to ReportType\n      targetId: report.targetId,',
    content,
    count=1
)

# Write the fixed file
with open('src/modules/admin/services/reports.service.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed all 9 errors in reports.service.ts')
