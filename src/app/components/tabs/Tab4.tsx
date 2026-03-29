import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import {
  Settings, Plus, Edit, Trash2, Search, Loader2, Key, CheckCircle, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { usersApi, UserData } from '../../lib/api';

const ALL_ROLES = ['admin', 'hod', 'ee_incharge', 'tt_incharge', 'examiner', 'faculty'];
const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'MAE', 'BT', 'EN', 'EP'];

type FormState = {
  user_id: string; name: string; email: string; phone: string;
  type: string; password: string; roles: string[]; department: string;
};

const emptyForm = (): FormState => ({
  user_id: '', name: '', email: '', phone: '', type: 'Faculty', password: '', roles: [], department: '',
});

export const Tab4: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [resetUser, setResetUser] = useState<UserData | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [form, setForm] = useState<FormState>(emptyForm());
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.user_id.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRole = (role: string) => {
    setForm(p => ({
      ...p,
      roles: p.roles.includes(role) ? p.roles.filter(r => r !== role) : [...p.roles, role],
    }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.user_id || !form.name || !form.email || !form.password) {
      toast.error('User ID, Name, Email and Password are required');
      return;
    }
    if (form.roles.length === 0) { toast.error('Select at least one role'); return; }
    setSubmitting(true);
    try {
      await usersApi.create({ ...form, roles: form.roles as any });
      toast.success('User created successfully!');
      setShowAdd(false);
      setForm(emptyForm());
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (u: UserData) => {
    setEditUser(u);
    setForm({ user_id: u.user_id, name: u.name, email: u.email, phone: u.phone || '', type: u.type, password: '', roles: [...u.roles], department: u.department || '' });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setSubmitting(true);
    try {
      await usersApi.update(editUser.user_id, {
        name: form.name, email: form.email, phone: form.phone,
        type: form.type as any, roles: form.roles as any, department: form.department,
      });
      toast.success('User updated!');
      setEditUser(null);
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersApi.delete(userId);
      toast.success('User deleted');
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleResetPassword = async () => {
    if (!resetUser || !newPassword) { toast.error('Enter new password'); return; }
    setSubmitting(true);
    try {
      await usersApi.resetPassword(resetUser.user_id, newPassword);
      toast.success(`Password reset for ${resetUser.name}`);
      setResetUser(null);
      setNewPassword('');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const RoleCheckboxes = () => (
    <div className="flex flex-wrap gap-2">
      {ALL_ROLES.map(role => (
        <button
          key={role}
          type="button"
          onClick={() => toggleRole(role)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            form.roles.includes(role)
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
          }`}
        >
          {role}
        </button>
      ))}
    </div>
  );

  const UserFormFields = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>User ID / Employee ID *</Label>
        <Input placeholder="ADMIN001" value={form.user_id} onChange={e => setForm(p => ({...p, user_id: e.target.value}))} disabled={!!editUser} />
      </div>
      <div className="space-y-2">
        <Label>Full Name *</Label>
        <Input placeholder="Dr. Jane Smith" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
      </div>
      <div className="space-y-2 col-span-2">
        <Label>Email *</Label>
        <Input type="email" placeholder="user@dtu.ac.in" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} />
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input placeholder="9876543210" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
      </div>
      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={form.type} onValueChange={v => setForm(p => ({...p, type: v}))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Faculty">Faculty</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Department</Label>
        <Select value={form.department} onValueChange={v => setForm(p => ({...p, department: v}))}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {!editUser && (
        <div className="space-y-2">
          <Label>Password *</Label>
          <Input type="password" placeholder="Set password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} />
        </div>
      )}
      <div className="space-y-2 col-span-2">
        <Label>Roles *</Label>
        <RoleCheckboxes />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" /> User Management
          </h2>
          <p className="text-muted-foreground text-sm">Admin-only — create and manage all portal users</p>
        </div>
        <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => { setForm(emptyForm()); setShowAdd(true); }}>
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users ({filtered.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name, email, ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>User ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(u => (
                    <TableRow key={u.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-sm">{u.user_id}</TableCell>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-sm">{u.email}</TableCell>
                      <TableCell><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{u.type}</span></TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {u.roles.map(r => (
                            <span key={r} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs border">{r}</span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {u.is_active
                          ? <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle className="w-3 h-3" /> Active</span>
                          : <span className="flex items-center gap-1 text-red-600 text-xs"><XCircle className="w-3 h-3" /> Inactive</span>
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => openEdit(u)}>
                            <Edit className="w-3 h-3" /> Edit
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => { setResetUser(u); setNewPassword(''); }}>
                            <Key className="w-3 h-3" /> Reset PW
                          </Button>
                          <Button size="sm" variant="destructive" className="h-7" onClick={() => handleDelete(u.user_id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
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

      {/* Add User Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 py-2">
            <UserFormFields />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={open => !open && setEditUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit User — {editUser?.name}</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 py-2">
            <UserFormFields />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetUser} onOpenChange={open => !open && setResetUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset Password — {resetUser?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetUser(null)}>Cancel</Button>
            <Button onClick={handleResetPassword} className="bg-blue-600 hover:bg-blue-700" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
