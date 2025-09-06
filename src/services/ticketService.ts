export interface Ticket {
  id: string;
  title: string;
  description?: string;
  status?: 'open' | 'closed' | 'pending';
  createdAt?: string;
  updatedAt?: string;
}

const BASE = '/api/tickets';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
	const text = await res.text().catch(() => '');
	throw new Error(text || res.statusText || `HTTP ${res.status}`);
  }
  if (res.status === 204) {
	// No Content
	return undefined as unknown as T;
  }
  return res.json() as Promise<T>;
}

export async function getTickets(): Promise<Ticket[]> {
  const res = await fetch(BASE, { method: 'GET' });
  return handleResponse<Ticket[]>(res);
}

export async function getTicket(id: string): Promise<Ticket> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, { method: 'GET' });
  return handleResponse<Ticket>(res);
}

export async function createTicket(data: Partial<Ticket>): Promise<Ticket> {
  const res = await fetch(BASE, {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify(data),
  });
  return handleResponse<Ticket>(res);
}

export async function updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
	method: 'PATCH',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify(data),
  });
  return handleResponse<Ticket>(res);
}

export async function deleteTicket(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
  await handleResponse<void>(res);
}
