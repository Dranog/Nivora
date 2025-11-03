#!/usr/bin/env python3
import re

with open('src/modules/admin/services/transactions.service.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Track line numbers as we modify (1-indexed to match displayed line numbers)
output = []
i = 0
while i < len(lines):
    line = lines[i]
    line_num = i + 1

    # Fix 1: Add creator to first include (after line 82)
    if line_num == 82 and 'user: { select: { id: true, username: true, email: true, avatar: true } },' in line:
        output.append(line)
        output.append('        creator: { select: { id: true, username: true, email: true, avatar: true } },\n')
        i += 1
        continue

    # Fix 2: Change "const items =" to "const items: TransactionDto[] ="
    if 'const items = transactions.map' in line:
        line = line.replace('const items = transactions.map', 'const items: TransactionDto[] = transactions.map')

    # Fix 3: Change currency line
    if "currency: (tx.currency || 'USD') as string," in line:
        line = line.replace("currency: (tx.currency || 'USD') as string,", "currency: String(tx.currency || 'EUR'),")

    # Fix 4: Add missing fields after user object (line 100, after the closing })
    if line_num == 100 and '      },' in line:
        output.append(line)
        output.append('      authorId: tx.creatorId,\n')
        output.append('      creator: tx.creator ? {\n')
        output.append('        id: tx.creator.id,\n')
        output.append('        username: tx.creator.username,\n')
        output.append('        email: tx.creator.email,\n')
        output.append('        avatar: tx.creator.avatar,\n')
        output.append('      } : null,\n')
        i += 1
        continue

    # Fix 5: Add paymentIntentId, last4 after paymentMethod (line 101)
    if line_num == 101 and 'paymentMethod: tx.paymentMethod as any,' in line:
        output.append(line)
        output.append('      paymentIntentId: tx.stripeChargeId || null,\n')
        output.append('      last4: null,\n')
        i += 1
        continue

    # Fix 6: Add metadata, failureReason after description (line 103)
    if line_num == 103 and 'description: tx.description,' in line:
        output.append(line)
        output.append('      metadata: (tx.metadata as any) || null,\n')
        output.append('      failureReason: null,\n')
        i += 1
        continue

    # Fix 7: Add creator to second include (after line 119)
    if line_num == 119 and 'user: { select: { id: true, username: true, email: true, avatar: true } },' in line:
        output.append(line)
        output.append('        creator: { select: { id: true, username: true, email: true, avatar: true } },\n')
        i += 1
        continue

    # Fix 8: Replace empty OR array (lines 130-131)
    if line_num == 130 and 'OR: [' in line:
        output.append(line)
        output.append('          { paymentId: transaction.id },\n')
        output.append("          { id: transaction.paymentId || '' },\n")
        i += 1
        continue

    # Fix 9: Skip the empty line 131 (closing bracket will be there)
    if line_num == 131 and '        ],' in line:
        output.append(line)
        i += 1
        continue

    # Fix 10: Change currency in detail return
    if "currency: transaction.currency || 'USD'," in line:
        line = line.replace("currency: transaction.currency || 'USD',", "currency: String(transaction.currency || 'EUR'),")

    # Fix 11: Add missing fields after user object in detail (line 168)
    if line_num == 168 and '      },' in line and i > 150:  # Make sure it's the right closing brace
        output.append(line)
        output.append('      authorId: transaction.creatorId,\n')
        output.append('      creator: transaction.creator ? {\n')
        output.append('        id: transaction.creator.id,\n')
        output.append('        username: transaction.creator.username,\n')
        output.append('        email: transaction.creator.email,\n')
        output.append('        avatar: transaction.creator.avatar,\n')
        output.append('      } : null,\n')
        i += 1
        continue

    # Fix 12: Add paymentIntentId, last4 after paymentMethod in detail (line 169)
    if line_num == 169 and 'paymentMethod: transaction.paymentMethod as any,' in line:
        output.append(line)
        output.append('      paymentIntentId: transaction.stripeChargeId || null,\n')
        output.append('      last4: null,\n')
        i += 1
        continue

    # Fix 13: Add metadata, failureReason after description in detail (line 171)
    if line_num == 171 and 'description: transaction.description,' in line:
        output.append(line)
        output.append('      metadata: (transaction.metadata as any) || null,\n')
        output.append('      failureReason: null,\n')
        i += 1
        continue

    # Fix 14: Add providerDetails before auditLog (look for the line before auditLog)
    if 'auditLog: auditLog.map' in line and i > 150:
        output.append('      providerDetails: null,\n')
        output.append(line)
        i += 1
        continue

    # Fix 15: Add amountCents after amount in refund create
    if 'amount: refundAmount,' in line and 'refund' in ''.join(lines[max(0, i-10):i]).lower():
        output.append(line)
        output.append('        amountCents: refundAmount,\n')
        i += 1
        continue

    # Fix 16: Add resourceId to audit logs
    if "event: 'ADMIN_REFUND_TRANSACTION'," in line:
        output.append(line)
        output.append('      resourceId: transactionId,\n')
        i += 1
        continue

    if "event: 'ADMIN_CANCEL_TRANSACTION'," in line:
        output.append(line)
        output.append('      resourceId: transactionId,\n')
        i += 1
        continue

    # Default: just add the line
    output.append(line)
    i += 1

# Write the fixed file
with open('src/modules/admin/services/transactions.service.ts', 'w', encoding='utf-8') as f:
    f.writelines(output)

print('Fixed transactions.service.ts')
