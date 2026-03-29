import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Users, Plus, Search, Loader2, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { usersApi, UserData } from '../../lib/api';

const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'MAE', 'BT', 'EN', 'EP'];

export const Tab2: React.FC = () => {
  const [faculty, setFaculty] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    user_id: '', name: '', email: '', phone: '', department: '',
  });

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getAll('Faculty');
      setFaculty(data);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load faculty');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFaculty(); }, []);

  const filtered = faculty.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.email.toLowerCase().includes(search.toLowerCase()) ||
    (f.department || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.user_id || !form.name || !form.email) {
      toast.error('Employee ID, Name and Email are required');
      return;
    }
    setSubmitting(true);
    try {
      await usersApi.create({
        ...form,
        type: 'Faculty',
        password: 'dtu@123',  // default password, admin should reset
        roles: ['faculty'],
      });
      toast.success('Faculty added! Default password: dtu@123');
      setShowAdd(false);
      setForm({ user_id: '', name: '', email: '', phone: '', department: '' });
      fetchFaculty();
    } catch (e: any) {
      toast.error(e.message || 'Failed to add faculty');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Faculty Database
          </h2>
          <p className="text-muted-foreground text-sm">Manage faculty members and their details</p>
        </div>
        <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" /> Add Faculty
        </Button>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Faculty ({filtered.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name, email, dept..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-16 h-16 mx-auto mb-4 text-primary/20" />
              <p className="text-lg">No faculty members found</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Roles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(f => (
                    <TableRow key={f.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-sm">{f.user_id}</TableCell>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell className="text-sm">{f.email}</TableCell>
                      <TableCell className="text-sm">{f.phone || '—'}</TableCell>
                      <TableCell><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{f.department || '—'}</span></TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {f.roles.map(r => (
                            <span key={r} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{r}</span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Faculty Member</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employee ID *</Label>
                <Input placeholder="FAC001" value={form.user_id} onChange={e => setForm(p => ({ ...p, user_id: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input placeholder="Dr. John Doe" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="faculty@dtu.ac.in" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="9876543210" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={v => setForm(p => ({ ...p, department: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Default password will be set to <strong>dtu@123</strong></p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Faculty'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
