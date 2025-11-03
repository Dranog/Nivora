'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/components/admin/Toast'
import { useState } from 'react'
import { AlertCircle, FileText, Image as ImageIcon, Video, Calendar, User, Flag } from 'lucide-react'

export interface Report {
  id: string
  reportedUser: { id: string; name: string; email: string; avatar: string }
  reportedBy: { id: string; name: string; email: string; avatar: string }
  reason: string
  description: string
  category: string
  priority: 'Critical'|'High'|'Medium'|'Low'
  status: 'Open'|'Resolved'|'Rejected'
  evidence: number
  timestamp: string
  evidenceFiles?: Array<{ id: string; type: 'image'|'video'|'document'; url: string; name: string }>
  reportHistory?: Array<{ action: string; actor: string; timestamp: string; note?: string }>
}

interface Props {
  report: Report | null
  open: boolean
  onClose: () => void
  onApprove: (id: string, note: string) => void
  onReject: (id: string, note: string) => void
  onDelete: (id: string) => void
}

export function ReportDetailModal({ report, open, onClose, onApprove, onReject, onDelete }: Props) {
  const { showToast } = useToast()
  const [actionNote, setActionNote] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedAction, setSelectedAction] = useState<'approve'|'reject'|'delete'|null>(null)

  if (!report) return null

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }
  const getCategoryColor = (category: string) => {
    const map: Record<string,string> = {
      Spam: 'bg-orange-100 text-orange-800 border-orange-200',
      Harassment: 'bg-red-100 text-red-800 border-red-200',
      'Inappropriate Content': 'bg-purple-100 text-purple-800 border-purple-200',
      'Fake Account': 'bg-blue-100 text-blue-800 border-blue-200',
      Copyright: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    }
    return map[category] ?? 'bg-gray-100 text-gray-800 border-gray-200'
  }
  const getPriorityColor = (priority: string) => {
    const map: Record<string,string> = {
      Critical: 'bg-red-100 text-red-800 border-red-300',
      High: 'bg-orange-100 text-orange-800 border-orange-300',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Low: 'bg-green-100 text-green-800 border-green-300',
    }
    return map[priority] ?? 'bg-gray-100 text-gray-800'
  }

  const approve = async () => {
    if (!actionNote.trim()) {
      showToast({ type: 'error', title: 'Note Required', message: 'Please provide a reason for approving this report' })
      return
    }
    const confirmed = confirm(`⚠️ APPROVE REPORT & BAN USER?\n\nThis will:\n• Ban ${report.reportedUser.name}\n• Remove all their content\n• Notify them\n• Close this report as "Resolved"\n\nAre you sure?`)
    if (!confirmed) return
    setIsProcessing(true); setSelectedAction('approve')
    await new Promise(r=>setTimeout(r,600))
    onApprove(report.id, actionNote)
    showToast({ type: 'success', title: 'Report Approved', message: `${report.reportedUser.name} has been banned and notified` })
    setActionNote(''); setIsProcessing(false); setSelectedAction(null); onClose()
  }

  const reject = async () => {
    if (!actionNote.trim()) {
      showToast({ type: 'error', title: 'Note Required', message: 'Please provide a reason for rejecting this report' })
      return
    }
    const confirmed = confirm(`Reject this report?\n\nThis will:\n• Close the report as "Rejected"\n• No action against ${report.reportedUser.name}\n• Notify ${report.reportedBy.name}`)
    if (!confirmed) return
    setIsProcessing(true); setSelectedAction('reject')
    await new Promise(r=>setTimeout(r,600))
    onReject(report.id, actionNote)
    showToast({ type: 'info', title: 'Report Rejected', message: 'Report has been closed without action' })
    setActionNote(''); setIsProcessing(false); setSelectedAction(null); onClose()
  }

  const remove = async () => {
    const confirmed = confirm(`⚠️ PERMANENTLY DELETE REPORT?\n\nThis action CANNOT be undone. Report #${report.id} will be removed.`)
    if (!confirmed) return
    const doubleConfirm = prompt('Type "DELETE" to confirm:')
    if (doubleConfirm !== 'DELETE') { showToast({ type: 'error', title: 'Deletion Cancelled', message: 'Text did not match' }); return }
    setIsProcessing(true); setSelectedAction('delete')
    await new Promise(r=>setTimeout(r,600))
    onDelete(report.id)
    showToast({ type: 'success', title: 'Report Deleted', message: 'Report has been permanently removed' })
    setIsProcessing(false); setSelectedAction(null); onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-brand" />
            <span>Report Details - #{report.id}</span>
            <Badge className={getPriorityColor(report.priority)}>{report.priority} Priority</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div><p className="text-xs text-gray-500 mb-1">Report ID</p><p className="font-mono text-sm font-medium">#{report.id}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Submitted</p><p className="text-sm font-medium">{report.timestamp}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Evidence</p><p className="text-sm font-medium">{report.evidence} files</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Status</p><Badge variant="outline">{report.status}</Badge></div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3"><User className="w-4 h-4 text-gray-500" /><h3 className="text-sm font-semibold text-gray-700 uppercase">Reported User</h3></div>
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <Avatar className="w-12 h-12"><AvatarImage src={report.reportedUser.avatar} /><AvatarFallback>{report.reportedUser.name[0]}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{report.reportedUser.name}</p>
                  <p className="text-sm text-gray-600">{report.reportedUser.email}</p>
                  <button className="text-xs text-brand hover:underline mt-1" onClick={() => window.open(`/admin/users/${report.reportedUser.id}`, '_blank')}>View Full Profile →</button>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3"><Flag className="w-4 h-4 text-gray-500" /><h3 className="text-sm font-semibold text-gray-700 uppercase">Reported By</h3></div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Avatar className="w-12 h-12"><AvatarImage src={report.reportedBy.avatar} /><AvatarFallback>{report.reportedBy.name[0]}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{report.reportedBy.name}</p>
                  <p className="text-sm text-gray-600">{report.reportedBy.email}</p>
                  <button className="text-xs text-brand hover:underline mt-1" onClick={() => window.open(`/admin/users/${report.reportedBy.id}`, '_blank')}>View Full Profile →</button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Category & Reason</h3>
              <div className="flex gap-2 mb-3"><Badge className={getCategoryColor(report.category)}>{report.category}</Badge></div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-900 mb-2">{report.reason}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{report.description}</p>
              </div>
            </div>

            {report.evidenceFiles && report.evidenceFiles.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Evidence Files ({report.evidenceFiles.length})</h3>
                <div className="grid grid-cols-3 gap-3">
                  {report.evidenceFiles.map(f => (
                    <div key={f.id} className="p-3 border border-gray-200 rounded-lg hover:border-brand transition-colors cursor-pointer group" onClick={() => window.open(f.url, '_blank')}>
                      <div className="flex items-center gap-2 mb-2">{getEvidenceIcon(f.type)}<span className="text-xs font-medium text-gray-600 uppercase">{f.type}</span></div>
                      <p className="text-sm text-gray-900 truncate group-hover:text-brand">{f.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.reportHistory && report.reportHistory.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Report History</h3>
                <div className="space-y-2">
                  {report.reportHistory.map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1"><span className="text-sm font-medium text-gray-900">{item.action}</span><span className="text-xs text-gray-500">by {item.actor}</span></div>
                        <p className="text-xs text-gray-600">{item.timestamp}</p>
                        {item.note && (<p className="text-sm text-gray-700 mt-2 italic">"{item.note}"</p>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Action Note *</label>
            <textarea value={actionNote} onChange={e=>setActionNote(e.target.value)} placeholder="Provide a detailed reason for your decision..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent resize-none" rows={4} disabled={isProcessing} />
            <p className="text-xs text-gray-500 mt-1">This note will be logged in the report history and included in notifications</p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button onClick={approve} disabled={isProcessing} className="flex-1 bg-gradient-to-r from-brand-start to-brand-end text-white">
              {isProcessing && selectedAction==='approve' ? 'Processing...' : 'Approve & Ban User'}
            </Button>
            <Button onClick={reject} disabled={isProcessing} variant="outline" className="flex-1">
              {isProcessing && selectedAction==='reject' ? 'Processing...' : 'Reject Report'}
            </Button>
            <Button onClick={remove} disabled={isProcessing} variant="destructive" className="flex-1">
              {isProcessing && selectedAction==='delete' ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
