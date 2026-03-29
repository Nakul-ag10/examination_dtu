import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { LayoutDashboard, Download, Loader2, FileText, FileSpreadsheet, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { reportsApi, ReportSummary } from '../../lib/api';

const SESSIONS = ['May 2026', 'Nov 2025', 'May 2025', 'Nov 2024', 'May 2024'];

const STATUS_COLORS: Record<string, string> = {
  not_started: 'text-gray-600',
  submitted: 'text-blue-600',
  recommended: 'text-amber-600',
  approved: 'text-green-600',
  rejected: 'text-red-600',
};

export const Tab3: React.FC = () => {
  const [session, setSession] = useState('May 2026');
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<'xlsx' | 'pdf' | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await reportsApi.getSummary(session);
      setSummary(data);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, [session]);

  const handleExport = async (format: 'xlsx' | 'pdf') => {
    setExporting(format);
    try {
      await reportsApi.export(session, format);
      toast.success(`${format.toUpperCase()} downloaded!`);
    } catch (e: any) {
      toast.error(e.message || 'Export failed');
    } finally {
      setExporting(null);
    }
  };

  const submittedPct = summary
    ? Math.round((summary.overall_submitted / Math.max(summary.overall_total, 1)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-blue-600" /> Reports
          </h2>
          <p className="text-muted-foreground text-sm">BOS submission status and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={session} onValueChange={setSession}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>{SESSIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport('xlsx')} disabled={!!exporting}>
            {exporting === 'xlsx' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Excel
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport('pdf')} disabled={!!exporting}>
            {exporting === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Subjects', value: summary?.overall_total ?? '—', sub: 'Registered this session', color: 'blue' },
          { label: 'Submitted', value: summary?.overall_submitted ?? '—', sub: `${submittedPct}% completion`, color: 'green' },
          { label: 'Non-Submitted', value: summary?.overall_non_submitted ?? '—', sub: 'Pending BOS forms', color: 'red' },
        ].map(card => (
          <Card key={card.label} className={`shadow-md border-l-4 border-l-${card.color}-500`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className={`text-4xl font-bold text-${card.color}-600 mt-1`}>{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                </div>
                <TrendingUp className={`w-10 h-10 text-${card.color}-200`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Bar */}
      {summary && summary.overall_total > 0 && (
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Overall Submission Progress</span>
              <span className="text-muted-foreground">{summary.overall_submitted} / {summary.overall_total}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-700"
                style={{ width: `${submittedPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{submittedPct}% submitted</p>
          </CardContent>
        </Card>
      )}

      {/* Department-wise Table */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Department-wise Status — {session}</CardTitle>
          <CardDescription>Breakdown of BOS entries by department and status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : !summary || summary.departments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <LayoutDashboard className="w-16 h-16 mx-auto mb-4 text-primary/20" />
              <p>No data for {session}</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Department</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center text-gray-600">Not Started</TableHead>
                    <TableHead className="text-center text-blue-600">Submitted</TableHead>
                    <TableHead className="text-center text-amber-600">Recommended</TableHead>
                    <TableHead className="text-center text-green-600">Approved</TableHead>
                    <TableHead className="text-center text-red-600">Rejected</TableHead>
                    <TableHead className="text-center">Completion %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.departments.map(dept => {
                    const submitted = (dept.submitted || 0) + (dept.recommended || 0) + (dept.approved || 0);
                    const pct = Math.round((submitted / Math.max(dept.total, 1)) * 100);
                    return (
                      <TableRow key={dept.department} className="hover:bg-muted/30">
                        <TableCell className="font-semibold">{dept.department}</TableCell>
                        <TableCell className="text-center">{dept.total}</TableCell>
                        <TableCell className="text-center text-gray-600">{dept.not_started || 0}</TableCell>
                        <TableCell className="text-center text-blue-600">{dept.submitted || 0}</TableCell>
                        <TableCell className="text-center text-amber-600">{dept.recommended || 0}</TableCell>
                        <TableCell className="text-center text-green-600">{dept.approved || 0}</TableCell>
                        <TableCell className="text-center text-red-600">{dept.rejected || 0}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs w-8">{pct}%</span>
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
    </div>
  );
};
