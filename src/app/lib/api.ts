const BASE_URL = 'http://localhost:8000';

function getToken(): string | null {
  return localStorage.getItem('dtu_token');
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string | number | undefined>,
  isFormData = false,
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    localStorage.removeItem('dtu_token');
    localStorage.removeItem('dtu_user');
    window.location.reload();
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }

  // Handle empty responses (204, delete etc.)
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

// =================== AUTH ===================
export const authApi = {
  login: (email: string, password: string) =>
    request<{
      access_token: string;
      user_id: string;
      user_name: string;
      email: string;
      roles: string[];
      department?: string;
    }>('POST', '/auth/login', { email, password }),

  logout: () => request<void>('POST', '/auth/logout'),
};

// =================== USERS ===================
export interface UserData {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  type: string;
  roles: string[];
  is_active: boolean;
  department?: string;
}

export const usersApi = {
  getAll: (type?: string) => request<UserData[]>('GET', '/users/', undefined, type ? { type } : undefined),

  create: (data: {
    user_id: string;
    name: string;
    email: string;
    phone?: string;
    type: string;
    password: string;
    roles: string[];
    department?: string;
  }) => request<UserData>('POST', '/users/', data),

  update: (userId: string, data: Partial<UserData>) =>
    request<UserData>('PUT', `/users/${userId}`, data),

  resetPassword: (userId: string, newPassword: string) =>
    request<{ message: string }>('POST', `/users/${userId}/reset-password`, { new_password: newPassword }),

  delete: (userId: string) =>
    request<{ message: string }>('DELETE', `/users/${userId}`),
};

// =================== BOS ===================
export interface FacultyEntry {
  employee_id: string;
  employee_name: string;
  role: 'examiner' | 'external_examiner' | 'cpes';
  section?: string;
}

export interface BOSEntry {
  id: string;
  session: string;
  program: string;
  semester: number;
  department: string;
  course_code: string;
  course_name: string;
  faculty_entries: FacultyEntry[];
  status: 'not_started' | 'submitted' | 'recommended' | 'approved' | 'rejected';
  created_by?: string;
  recommended_by?: string;
  approved_by?: string;
  rejected_by?: string;
  reject_reason?: string;
}

export const bosApi = {
  getAll: (params?: { session?: string; department?: string; semester?: number; status?: string }) =>
    request<BOSEntry[]>('GET', '/bos/', undefined, params as Record<string, string | number | undefined>),

  create: (data: Omit<BOSEntry, 'id' | 'status' | 'created_by' | 'recommended_by' | 'approved_by' | 'rejected_by' | 'reject_reason'>) =>
    request<BOSEntry>('POST', '/bos/', data),

  update: (id: string, data: Partial<BOSEntry>) =>
    request<BOSEntry>('PUT', `/bos/${id}`, data),

  delete: (id: string) =>
    request<{ message: string }>('DELETE', `/bos/${id}`),

  submit: (id: string) =>
    request<{ message: string }>('PATCH', `/bos/${id}/submit`),

  recommend: (id: string) =>
    request<{ message: string }>('PATCH', `/bos/${id}/recommend`),

  approve: (id: string) =>
    request<{ message: string }>('PATCH', `/bos/${id}/approve`),

  reject: (id: string, reason?: string) =>
    request<{ message: string }>('PATCH', `/bos/${id}/reject`, { reason }),

  uploadExcel: (session: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<BOSEntry[]>('POST', `/bos/upload-excel?session=${encodeURIComponent(session)}`, form, undefined, true);
  },

  copyFromLastYear: (targetSession: string, department?: string) =>
    request<{ copied: number; source_session: string; target_session: string }>(
      'POST', '/bos/copy-from-last-year', { target_session: targetSession, department }
    ),
};

// =================== REPORTS ===================
export interface ReportSummary {
  session: string;
  overall_total: number;
  overall_submitted: number;
  overall_non_submitted: number;
  departments: Array<{
    department: string;
    total: number;
    submitted?: number;
    recommended?: number;
    approved?: number;
    not_started?: number;
    rejected?: number;
  }>;
}

export const reportsApi = {
  getSummary: (session: string) =>
    request<ReportSummary>('GET', '/reports/summary', undefined, { session }),

  getSubmitted: (session: string, department?: string) =>
    request<BOSEntry[]>('GET', '/reports/submitted', undefined, { session, department }),

  getNonSubmitted: (session: string, department?: string) =>
    request<BOSEntry[]>('GET', '/reports/non-submitted', undefined, { session, department }),

  exportUrl: (session: string, format: 'xlsx' | 'pdf', department?: string) => {
    const token = getToken();
    const params = new URLSearchParams({ session, format });
    if (department) params.set('department', department);
    return `${BASE_URL}/reports/export?${params.toString()}&token=${token}`;
  },

  export: async (session: string, format: 'xlsx' | 'pdf', department?: string) => {
    const params: Record<string, string> = { session, format };
    if (department) params.department = department;
    const url = new URL(`${BASE_URL}/reports/export`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const headers: Record<string, string> = {};
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url.toString(), { headers });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `BOS_${session.replace(' ', '_')}.${format}`;
    link.click();
  },
};
