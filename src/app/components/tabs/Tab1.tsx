import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import {
  Plus, Trash2, Edit, Search, Save, Upload, Copy, CheckCircle2,
  XCircle, ThumbsUp, Send, Loader2, BookOpen, RefreshCw, Lock as LockIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { bosApi, BOSEntry, FacultyEntry } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const SESSIONS = ['May 2026', 'Nov 2025', 'May 2025', 'Nov 2024', 'May 2024'];
const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'MAE', 'BT', 'EN', 'EP'];
const PROGRAMS = ['B.Tech', 'M.Tech', 'MBA', 'MCA', 'BBA'];
const FACULTY_ROLES = [
  { value: 'examiner', label: 'Examiner' },
  { value: 'external_examiner', label: 'External Examiner' },
  { value: 'cpes', label: 'CPES' },
];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  not_started: { label: 'Not Started', className: 'bg-gray-100 text-gray-600' },
  submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-700' },
  recommended: { label: 'Recommended', className: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
};

type FacultyRow = FacultyEntry & { _key: string };

const emptyFacultyRow = (): FacultyRow => ({
  _key: Date.now().toString() + Math.random(),
  employee_id: '',
  employee_name: '',
  role: 'examiner',
  section: '',
});

export const Tab1: React.FC = () => {
  const { hasRole, user } = useAuth();
  const isTTIncharge = hasRole('tt_incharge') && !hasRole('admin');
  const myDept = isTTIncharge ? (user?.department || '') : '';

  const [session, setSession] = useState('May 2026');
  const [filterDept, setFilterDept] = useState(myDept || 'all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [entries, setEntries] = useState<BOSEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    program: '', semester: '', department: myDept, course_code: '', course_name: '',
  });
  const [faculties, setFaculties] = useState<FacultyRow[]>([emptyFacultyRow()]);
  const [submitting, setSubmitting] = useState(false);

  // Copy from last year
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyDept, setCopyDept] = useState('');
  const [copying, setCopying] = useState(false);

  // Excel upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Reject dialog
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const canRecommend = hasRole('admin') || hasRole('hod');
  const canApprove = hasRole('admin') || hasRole('ee_incharge');

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await bosApi.getAll({
        session,
        department: filterDept === 'all' ? undefined : filterDept,
        status: filterStatus === 'all' ? undefined : filterStatus,
      });
      setEntries(data);
    } catch (e: any) {
      toast.error(e.message || 'Failed to fetch BOS entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, [session, filterDept, filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredEntries = entries.filter(e =>
    e.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ program: '', semester: '', department: myDept, course_code: '', course_name: '' });
    setFaculties([emptyFacultyRow()]);
    setEditingId(null);
  };

  const handleEdit = (entry: BOSEntry) => {
    setFormData({
      program: entry.program, semester: String(entry.semester),
      department: entry.department, course_code: entry.course_code, course_name: entry.course_name,
    });
    setFaculties(entry.faculty_entries.map(f => ({ ...f, _key: Math.random().toString() })));
    setEditingId(entry.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.program || !formData.semester || !formData.department || !formData.course_code || !formData.course_name) {
      toast.error('Please fill in all course details');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        session,
        program: formData.program,
        semester: parseInt(formData.semester),
        department: formData.department,
        course_code: formData.course_code,
        course_name: formData.course_name,
        faculty_entries: faculties.map(({ _key, ...f }) => f),
      };
      if (editingId) {
        await bosApi.update(editingId, payload);
        toast.success('BOS entry updated!');
      } else {
        await bosApi.create(payload);
        toast.success('BOS entry created!');
      }
      resetForm();
      setShowForm(false);
      fetchEntries();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this BOS entry?')) return;
    try {
      await bosApi.delete(id);
      toast.success('Deleted');
      fetchEntries();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleSubmitBOS = async (id: string) => {
    try {
      await bosApi.submit(id);
      toast.success('BOS submitted for review');
      fetchEntries();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleRecommend = async (id: string) => {
    try {
      await bosApi.recommend(id);
      toast.success('BOS recommended by HOD');
      fetchEntries();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await bosApi.approve(id);
      toast.success('BOS approved!');
      fetchEntries();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    try {
      await bosApi.reject(rejectId, rejectReason);
      toast.success('BOS rejected');
      setRejectId(null);
      setRejectReason('');
      fetchEntries();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await bosApi.uploadExcel(session, file);
      toast.success(`Imported ${result.length} entries from Excel`);
      fetchEntries();
    } catch (err: any) {
      toast.error(err.message || 'Excel import failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyFromLastYear = async () => {
    setCopying(true);
    try {
      const res = await bosApi.copyFromLastYear(session, copyDept || undefined);
      toast.success(`Copied ${res.copied} entries from ${res.source_session}`);
      setShowCopyModal(false);
      fetchEntries();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" /> BOS Management
          </h2>
          <p className="text-muted-foreground text-sm">Board of Studies — Course &amp; Faculty Assignments</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => { fileInputRef.current?.click(); }} disabled={uploading}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload Excel
          </Button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelUpload} />
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowCopyModal(true)}>
            <Copy className="w-4 h-4" /> Copy from Last Year
          </Button>
          <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> Add Entry
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label>Session</Label>
              <Select value={session} onValueChange={setSession}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SESSIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Department</Label>
              <div className="relative">
                <Select
                  value={filterDept}
                  onValueChange={isTTIncharge ? undefined : setFilterDept}
                  disabled={isTTIncharge}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                {isTTIncharge && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-muted-foreground flex items-center gap-1">
                    <LockIcon className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Course code, name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="shadow-lg border-blue-200 border animate-in slide-in-from-top duration-300">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit BOS Entry' : 'Add New BOS Entry'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitForm} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Program *</Label>
                  <Select value={formData.program} onValueChange={v => setFormData(p => ({ ...p, program: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{PROGRAMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Semester *</Label>
                  <Select value={formData.semester} onValueChange={v => setFormData(p => ({ ...p, semester: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{[1,2,3,4,5,6,7,8].map(s => <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={isTTIncharge ? undefined : v => setFormData(p => ({ ...p, department: v }))}
                    disabled={isTTIncharge}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {isTTIncharge && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <LockIcon className="w-3 h-3" /> Department locked to your branch ({myDept})
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Course Code *</Label>
                  <Input placeholder="e.g., CS301" value={formData.course_code} onChange={e => setFormData(p => ({ ...p, course_code: e.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Course Name *</Label>
                  <Input placeholder="e.g., Data Structures & Algorithms" value={formData.course_name} onChange={e => setFormData(p => ({ ...p, course_name: e.target.value }))} />
                </div>
              </div>

              {/* Faculty Rows */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Faculty Assignments</Label>
                  <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setFaculties(p => [...p, emptyFacultyRow()])}>
                    <Plus className="w-4 h-4" /> Add Faculty
                  </Button>
                </div>
                {faculties.map((f, idx) => (
                  <div key={f._key} className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg border">
                    <div className="space-y-1">
                      <Label className="text-xs">Employee ID</Label>
                      <Input placeholder="EMP001" value={f.employee_id} onChange={e => setFaculties(p => p.map((r, i) => i === idx ? {...r, employee_id: e.target.value} : r))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Employee Name</Label>
                      <Input placeholder="Dr. John Doe" value={f.employee_name} onChange={e => setFaculties(p => p.map((r, i) => i === idx ? {...r, employee_name: e.target.value} : r))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Role</Label>
                      <Select value={f.role} onValueChange={v => setFaculties(p => p.map((r, i) => i === idx ? {...r, role: v as FacultyEntry['role']} : r))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{FACULTY_ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Section</Label>
                      <div className="flex gap-2">
                        <Input placeholder="CSE-1" value={f.section || ''} onChange={e => setFaculties(p => p.map((r, i) => i === idx ? {...r, section: e.target.value} : r))} />
                        {faculties.length > 1 && (
                          <Button type="button" variant="destructive" size="icon" onClick={() => setFaculties(p => p.filter((_, i) => i !== idx))}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="gap-2 bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId ? 'Update' : 'Save Entry'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { resetForm(); setShowForm(false); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* BOS Table */}
      <Card className="shadow-lg border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>BOS Entries — {session}</CardTitle>
            <CardDescription>
              {filteredEntries.length} of {entries.length} entries
              {' · '}
              Submitted: {entries.filter(e => e.status !== 'not_started').length}
              {' · '}
              Pending: {entries.filter(e => e.status === 'not_started').length}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchEntries} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-primary/20" />
              <p className="text-lg">No BOS entries found</p>
              <p className="text-sm mt-1">Add entries using the form above or upload an Excel file</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Course</TableHead>
                    <TableHead>Dept / Sem</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right min-w-[280px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map(entry => {
                    const statusCfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.not_started;
                    return (
                      <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-medium">{entry.course_code}</div>
                          <div className="text-xs text-muted-foreground">{entry.course_name}</div>
                        </TableCell>
                        <TableCell>
                          <div>{entry.department}</div>
                          <div className="text-xs text-muted-foreground">Sem {entry.semester}</div>
                        </TableCell>
                        <TableCell className="text-sm">{entry.program}</TableCell>
                        <TableCell>
                          <span className="text-sm">{entry.faculty_entries.length} assigned</span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusCfg.className}`}>
                            {statusCfg.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end flex-wrap gap-1">
                            {entry.status === 'not_started' && (
                              <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => handleSubmitBOS(entry.id)}>
                                <Send className="w-3 h-3" /> Submit
                              </Button>
                            )}
                            {entry.status === 'submitted' && canRecommend && (
                              <Button size="sm" variant="outline" className="gap-1 text-xs h-7 text-amber-700 border-amber-300 hover:bg-amber-50" onClick={() => handleRecommend(entry.id)}>
                                <ThumbsUp className="w-3 h-3" /> Recommend
                              </Button>
                            )}
                            {entry.status === 'recommended' && canApprove && (
                              <>
                                <Button size="sm" variant="outline" className="gap-1 text-xs h-7 text-green-700 border-green-300 hover:bg-green-50" onClick={() => handleApprove(entry.id)}>
                                  <CheckCircle2 className="w-3 h-3" /> Approve
                                </Button>
                                <Button size="sm" variant="outline" className="gap-1 text-xs h-7 text-red-600 border-red-300 hover:bg-red-50" onClick={() => setRejectId(entry.id)}>
                                  <XCircle className="w-3 h-3" /> Reject
                                </Button>
                              </>
                            )}
                            {entry.status !== 'approved' && (
                              <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => handleEdit(entry)}>
                                <Edit className="w-3 h-3" /> Edit
                              </Button>
                            )}
                            {(hasRole('admin')) && (
                              <Button size="sm" variant="destructive" className="gap-1 text-xs h-7" onClick={() => handleDelete(entry.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Copy from Last Year Modal */}
      <Dialog open={showCopyModal} onOpenChange={setShowCopyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy from Last Year BOS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              This will copy BOS records from <strong>May {parseInt(session.split(' ')[1] || '2026') - 1}</strong> to <strong>{session}</strong>.
              Only entries that don't already exist will be copied.
            </p>
            <div className="space-y-2">
              <Label>Department (optional — leave blank to copy all)</Label>
              <Select value={copyDept || 'all'} onValueChange={v => setCopyDept(v === 'all' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="All Departments" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCopyModal(false)}>Cancel</Button>
            <Button onClick={handleCopyFromLastYear} disabled={copying} className="gap-2 bg-blue-600 hover:bg-blue-700">
              {copying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
              Copy Entries
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectId} onOpenChange={open => !open && setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject BOS Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Reason for rejection (optional)</Label>
            <Input
              placeholder="Please provide a reason..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} className="gap-2">
              <XCircle className="w-4 h-4" /> Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
