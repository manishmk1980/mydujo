import { API_BASE } from '../config';
import { getAdminToken, getPortalToken } from '../lib/authTokens';

function getPortalAuthHeaders() {
  const token = getPortalToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getAdminAuthHeaders() {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function buildCandidateUrls(path: string): string[] {
  const base = API_BASE.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const hasApiSuffix = /\/api$/i.test(base);
  if (hasApiSuffix) {
    return [`${base}${normalizedPath}`, `${base.replace(/\/api$/i, '')}${normalizedPath}`];
  }
  return [`${base}${normalizedPath}`, `${base}/api${normalizedPath}`];
}

async function fetchWithApiFallback(path: string, init: RequestInit): Promise<Response> {
  const urls = buildCandidateUrls(path);
  let lastResponse: Response | null = null;
  for (const url of urls) {
    const res = await fetch(url, init);
    lastResponse = res;
    if (res.status !== 404) return res;
  }
  return lastResponse as Response;
}

export type FeeRequestStatus = 'DRAFT' | 'ISSUED' | 'OVERDUE' | 'PAID' | 'CANCELLED';
export type PaymentSubmissionStatus = 'SUBMITTED' | 'NEEDS_INFO' | 'VERIFIED' | 'REJECTED' | 'CANCELLED';
export type PaymentMethod = 'UPI' | 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'OTHER';

export interface FeeRequestDTO {
  id: string;
  title: string;
  description?: string | null;
  student_name?: string | null;
  student_email?: string | null;
  amount_paise: number;
  currency: string;
  due_date: string;
  status: FeeRequestStatus;
  computed_status?: FeeRequestStatus;
  issued_at?: string | null;
  created_at?: string;
  updated_at?: string;
  student_id: string;
  created_by_user_id?: string;
  created_by_email?: string | null;
  created_by_display_name?: string | null;
  training_center_id?: string | null;
}

export interface PaymentSubmissionDTO {
  id: string;
  fee_request_id: string;
  student_id: string;
  method: PaymentMethod;
  amount_paise: number;
  paid_at?: string | null;
  reference?: string | null;
  proof_url?: string | null;
  notes_from_student?: string | null;
  status: PaymentSubmissionStatus;
  review_notes?: string | null;
  reviewed_at?: string | null;
  created_at?: string;
}

/** Fee requests where the student can open Pay / submit (ISSUED or OVERDUE, no blocking submission). */
export function countActionableStudentFeeRequests(
  requests: FeeRequestDTO[],
  payments: PaymentSubmissionDTO[]
): number {
  return requests.filter((r) => {
    const status = r.computed_status ?? r.status;
    const openForPayment = status === 'ISSUED' || status === 'OVERDUE';
    if (!openForPayment) return false;
    const latestPayment = payments
      .filter((p) => p.fee_request_id === r.id)
      .sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
      )[0];
    if (!latestPayment) return true;
    return latestPayment.status === 'REJECTED' || latestPayment.status === 'CANCELLED';
  }).length;
}

export const feesService = {
  // Student
  async getMyFeeRequests(): Promise<FeeRequestDTO[]> {
    const res = await fetchWithApiFallback('/fees/my/requests', {
      method: 'GET',
      headers: getPortalAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? `Failed to load fees: ${res.status}`);
    }
    const data = (await res.json()) as { fee_requests?: FeeRequestDTO[] };
    return data.fee_requests ?? [];
  },

  async getMySubmissions(): Promise<PaymentSubmissionDTO[]> {
    const res = await fetchWithApiFallback('/fees/my/submissions', {
      method: 'GET',
      headers: getPortalAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? `Failed to load payments: ${res.status}`);
    }
    const data = (await res.json()) as { submissions?: PaymentSubmissionDTO[] };
    return data.submissions ?? [];
  },

  async submitPayment(input: {
    feeRequestId: string;
    method: PaymentMethod;
    amountPaise: number;
    paidAt?: string | null;
    reference?: string | null;
    proofUrl?: string | null;
    notesFromStudent?: string | null;
  }): Promise<PaymentSubmissionDTO> {
    const res = await fetch(`${API_BASE}/fees/my/submissions`, {
      method: 'POST',
      headers: getPortalAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        fee_request_id: input.feeRequestId,
        method: input.method,
        amount_paise: input.amountPaise,
        paid_at: input.paidAt ?? null,
        reference: input.reference ?? null,
        proof_url: input.proofUrl ?? null,
        notes_from_student: input.notesFromStudent ?? null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data as { error?: string }).error ?? `Failed to submit payment: ${res.status}`);
    }
    return (data as { submission: PaymentSubmissionDTO }).submission;
  },

  async updateMySubmission(id: string, patch: Partial<{
    method: PaymentMethod;
    paidAt: string | null;
    reference: string | null;
    proofUrl: string | null;
    notesFromStudent: string | null;
  }>): Promise<PaymentSubmissionDTO> {
    const res = await fetch(`${API_BASE}/fees/my/submissions/${id}`, {
      method: 'PATCH',
      headers: getPortalAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        ...(patch.method ? { method: patch.method } : {}),
        ...(patch.paidAt !== undefined ? { paid_at: patch.paidAt } : {}),
        ...(patch.reference !== undefined ? { reference: patch.reference } : {}),
        ...(patch.proofUrl !== undefined ? { proof_url: patch.proofUrl } : {}),
        ...(patch.notesFromStudent !== undefined ? { notes_from_student: patch.notesFromStudent } : {}),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data as { error?: string }).error ?? `Failed to update submission: ${res.status}`);
    }
    return (data as { submission: PaymentSubmissionDTO }).submission;
  },

  // Admin
  async createFeeRequest(input: {
    studentId: string;
    title: string;
    description?: string | null;
    amountPaise: number;
    dueDate: string;
    status?: FeeRequestStatus;
    trainingCenterId?: string | null;
  }): Promise<FeeRequestDTO> {
    const res = await fetchWithApiFallback('/fees/requests', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        student_id: input.studentId,
        training_center_id: input.trainingCenterId ?? null,
        title: input.title,
        description: input.description ?? null,
        amount_paise: input.amountPaise,
        due_date: input.dueDate,
        status: input.status ?? 'ISSUED',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data as { error?: string }).error ?? `Failed to create fee request: ${res.status}`);
    }
    return (data as { fee_request: FeeRequestDTO }).fee_request;
  },

  async bulkGenerateFeeRequests(input: {
    trainingCenterId?: string | null;
    title: string;
    description?: string | null;
    amountPaise: number;
    dueDate: string;
    issueNow?: boolean;
  }): Promise<{ count: number; fee_requests: FeeRequestDTO[] }> {
    const res = await fetchWithApiFallback('/fees/requests/bulk', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        training_center_id: input.trainingCenterId ?? null,
        title: input.title,
        description: input.description ?? null,
        amount_paise: input.amountPaise,
        due_date: input.dueDate,
        issue_now: Boolean(input.issueNow),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data as { error?: string }).error ?? `Bulk generation failed: ${res.status}`);
    }
    return data as { count: number; fee_requests: FeeRequestDTO[] };
  },

  async listFeeRequests(filters?: Partial<{
    status: FeeRequestStatus;
    studentId: string;
    trainingCenterId: string;
    dueFrom: string;
    dueTo: string;
  }>): Promise<FeeRequestDTO[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.studentId) params.set('student_id', filters.studentId);
    if (filters?.trainingCenterId) params.set('training_center_id', filters.trainingCenterId);
    if (filters?.dueFrom) params.set('due_from', filters.dueFrom);
    if (filters?.dueTo) params.set('due_to', filters.dueTo);

    const path = `/fees/requests${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetchWithApiFallback(path, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? `Failed to list fee requests: ${res.status}`);
    }
    const data = (await res.json()) as { fee_requests?: FeeRequestDTO[] };
    return data.fee_requests ?? [];
  },

  async listSubmissions(filters?: Partial<{
    status: PaymentSubmissionStatus;
    studentId: string;
    feeRequestId: string;
    from: string;
    to: string;
  }>): Promise<PaymentSubmissionDTO[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.studentId) params.set('student_id', filters.studentId);
    if (filters?.feeRequestId) params.set('fee_request_id', filters.feeRequestId);
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);

    const path = `/fees/submissions${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetchWithApiFallback(path, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? `Failed to list submissions: ${res.status}`);
    }
    const data = (await res.json()) as { submissions?: PaymentSubmissionDTO[] };
    return data.submissions ?? [];
  },

  async reviewSubmission(id: string, input: { status: 'VERIFIED' | 'REJECTED' | 'NEEDS_INFO'; reviewNotes?: string | null }): Promise<PaymentSubmissionDTO> {
    const res = await fetchWithApiFallback(`/fees/submissions/${id}/review`, {
      method: 'PATCH',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        status: input.status,
        review_notes: input.reviewNotes ?? null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data as { error?: string }).error ?? `Failed to review submission: ${res.status}`);
    }
    return (data as { submission: PaymentSubmissionDTO }).submission;
  },

  async updateFeeRequest(
    id: string,
    patch: Partial<{
      title: string;
      amountPaise: number;
      dueDate: string;
      status: FeeRequestStatus;
    }>
  ): Promise<FeeRequestDTO> {
    const payload: Record<string, unknown> = {};
    if (patch.title !== undefined) payload.title = patch.title;
    if (patch.amountPaise !== undefined) payload.amount_paise = patch.amountPaise;
    if (patch.dueDate !== undefined) payload.due_date = patch.dueDate;
    if (patch.status !== undefined) payload.status = patch.status;

    const res = await fetchWithApiFallback(`/fees/requests/${id}`, {
      method: 'PATCH',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data as { error?: string }).error ?? `Failed to update fee request: ${res.status}`);
    }
    return (data as { fee_request: FeeRequestDTO }).fee_request;
  },

  async deleteFeeRequest(id: string): Promise<void> {
    const res = await fetchWithApiFallback(`/fees/requests/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data as { error?: string }).error ?? `Failed to delete fee request: ${res.status}`);
    }
  },
};

