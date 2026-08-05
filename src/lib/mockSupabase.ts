'use client';

// Mock Supabase Database Client for local sandbox testing
// Simulates Auth, Database operations, and seeds initial HSC subjects in localStorage

import { User } from '@supabase/supabase-js';

const SEED_SUBJECTS = [
  { id: 'sub-eng-adv', name: 'English Advanced', code: 'ENG_ADV', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-eng-std', name: 'English Standard', code: 'ENG_STD', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-math-adv', name: 'Mathematics Advanced', code: 'MATH_ADV', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-math-ext1', name: 'Mathematics Extension 1', code: 'MATH_EXT1', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-math-ext2', name: 'Mathematics Extension 2', code: 'MATH_EXT2', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-chem', name: 'Chemistry', code: 'CHEM', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-phys', name: 'Physics', code: 'PHYS', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-biol', name: 'Biology', code: 'BIOL', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-econ', name: 'Economics', code: 'ECON', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-buss', name: 'Business Studies', code: 'BUSS', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-legl', name: 'Legal Studies', code: 'LEGL', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-hist-mod', name: 'Modern History', code: 'HIST_MOD', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-soft-eng', name: 'Software Engineering', code: 'SOFT_ENG', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-eng-stud', name: 'Engineering Studies', code: 'ENG_STUD', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-pdhpe', name: 'PDHPE', code: 'PDHPE', is_active: true, created_at: new Date().toISOString() },
];

class MockDB {
  private getStore(key: string): any[] {
    if (typeof window === 'undefined') return [];
    const val = localStorage.getItem(`girrastudy_db_${key}`);
    return val ? JSON.parse(val) : [];
  }

  private setStore(key: string, data: any[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`girrastudy_db_${key}`, JSON.stringify(data));
  }

  constructor() {
    if (typeof window !== 'undefined') {
      // Initialize subjects if empty
      if (this.getStore('subjects').length === 0) {
        this.setStore('subjects', SEED_SUBJECTS);
      }
      // Initialize users if empty (setup default admin)
      if (this.getStore('users').length === 0) {
        const adminId = 'admin-user-id';
        const defaultAdminAuth = { id: adminId, email: 'admin@girrastudy.com', role: 'admin' };
        const defaultAdminProfile = {
          id: adminId,
          email: 'admin@girrastudy.com',
          full_name: 'Administrator',
          year_group: 'Year 12',
          role: 'admin',
          created_at: new Date().toISOString(),
        };
        this.setStore('auth_users', [defaultAdminAuth]);
        this.setStore('users', [defaultAdminProfile]);
      }
    }
  }

  public getSession(): { session: { user: User } | null } {
    if (typeof window === 'undefined') return { session: null };
    const sessionUser = localStorage.getItem('girrastudy_session_user');
    if (!sessionUser) return { session: null };
    return { session: { user: JSON.parse(sessionUser) } };
  }

  public setSession(user: any | null) {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem('girrastudy_session_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('girrastudy_session_user');
    }
  }

  public getTableData(table: string): any[] {
    return this.getStore(table);
  }

  public setTableData(table: string, data: any[]) {
    this.setStore(table, data);
  }
}

const db = new MockDB();
const authCallbacks: Array<(event: string, session: any | null) => void> = [];

class QueryBuilder {
  private table: string;
  private filters: Array<(item: any) => boolean> = [];
  private selectFields: string = '*';
  private sortField: string | null = null;
  private sortAscending: boolean = true;
  private limitCount: number | null = null;

  // Deferred operation state
  private isInsert: boolean = false;
  private insertData: any = null;
  private isUpdate: boolean = false;
  private updateData: any = null;
  private isDelete: boolean = false;
  private isUpsert: boolean = false;
  private upsertData: any = null;
  private wantsSelect: boolean = false;

  constructor(table: string) {
    this.table = table;
  }




  eq(column: string, value: any) {
    this.filters.push((item) => item[column] === value);
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push((item) => item[column] !== value);
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push((item) => new Date(item[column]) < new Date(value));
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push((item) => new Date(item[column]) <= new Date(value));
    return this;
  }

  gt(column: string, value: any) {
    this.filters.push((item) => new Date(item[column]) > new Date(value));
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push((item) => new Date(item[column]) >= new Date(value));
    return this;
  }

  ilike(column: string, pattern: string) {
    const cleanPattern = pattern.replace(/%/g, '').toLowerCase();
    this.filters.push((item) => String(item[column] || '').toLowerCase().includes(cleanPattern));
    return this;
  }

  or(filterStr: string) {
    // e.g. "title.ilike.%query%,topic.ilike.%query%"
    const parts = filterStr.split(',');
    this.filters.push((item) => {
      return parts.some((part) => {
        const [col, op, val] = part.split('.');
        const cleanVal = (val || '').replace(/%/g, '').toLowerCase();
        return String(item[col] || '').toLowerCase().includes(cleanVal);
      });
    });
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.sortField = column;
    this.sortAscending = ascending;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  // Insert operation (deferred)
  insert(insertData: any | any[]) {
    this.isInsert = true;
    this.insertData = insertData;
    return this;
  }

  // Upsert operation (deferred)
  upsert(upsertData: any | any[]) {
    this.isUpsert = true;
    this.upsertData = upsertData;
    return this;
  }

  // Select after insert/update — marks that caller wants data back
  select(_fields = '*', _options?: any) {
    if (this.isInsert || this.isUpdate || this.isUpsert) {
      this.wantsSelect = true;
    } else {
      this.selectFields = _fields;
    }
    return this;
  }

  // Update operation (deferred)
  update(updateData: any) {
    this.isUpdate = true;
    this.updateData = updateData;
    return this;
  }

  // Delete operation (deferred)
  delete() {
    this.isDelete = true;
    return this;
  }

  private executeInsert(): { data: any | any[]; error: any } {
    const current = db.getTableData(this.table);
    const rows = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
    const newRows = rows.map((r) => ({
      id: r.id || `mock-${this.table}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      ...r,
    }));

    db.setTableData(this.table, [...current, ...newRows]);

    // Handle cascading triggers / auto creations
    for (const row of newRows) {
      if (this.table === 'assessments' && row.status === 'Overdue') {
        const notifications = db.getTableData('notifications');
        db.setTableData('notifications', [
          ...notifications,
          {
            id: `mock-notif-${Math.random().toString(36).substr(2, 9)}`,
            user_id: row.user_id,
            message: `Assessment "${row.name}" is overdue! Please complete it.`,
            type: 'assessment_overdue',
            is_read: false,
            created_at: new Date().toISOString(),
            related_assessment_id: row.id,
          },
        ]);
      }
    }

    const result = Array.isArray(this.insertData) ? newRows : newRows[0];
    return { data: result, error: null };
  }

  private executeUpsert(): { data: any | any[]; error: any } {
    const current = db.getTableData(this.table);
    const rows = Array.isArray(this.upsertData) ? this.upsertData : [this.upsertData];
    let updatedList = [...current];
    const resultRows: any[] = [];
    for (const row of rows) {
      const idx = updatedList.findIndex((r) => r.id === row.id);
      const newRow = {
        id: row.id || `mock-${this.table}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        ...row,
        updated_at: new Date().toISOString(),
      };
      if (idx !== -1) {
        updatedList[idx] = newRow;
      } else {
        updatedList.push(newRow);
      }
      resultRows.push(newRow);
    }
    db.setTableData(this.table, updatedList);
    return { data: Array.isArray(this.upsertData) ? resultRows : resultRows[0], error: null };
  }

  private executeUpdate(): { data: any[]; error: any } {
    const current = db.getTableData(this.table);
    const updatedRows: any[] = [];
    const nextList = current.map((item) => {
      const matches = this.filters.every((filter) => filter(item));
      if (matches) {
        const updated = { ...item, ...this.updateData, updated_at: new Date().toISOString() };
        updatedRows.push(updated);
        return updated;
      }
      return item;
    });

    db.setTableData(this.table, nextList);
    return { data: updatedRows, error: null };
  }

  private executeDelete(): { data: null; error: any } {
    const current = db.getTableData(this.table);
    const remaining = current.filter((item) => {
      const matches = this.filters.every((filter) => filter(item));
      return !matches;
    });

    db.setTableData(this.table, remaining);
    return { data: null, error: null };
  }

  private executeQuery(): any[] {
    let data = db.getTableData(this.table);

    // Apply filters
    for (const filter of this.filters) {
      data = data.filter(filter);
    }

    // Populate relations if requested
    if (this.selectFields.includes('subject:subjects')) {
      const subjects = db.getTableData('subjects');
      data = data.map((item) => ({
        ...item,
        subject: subjects.find((s) => s.id === item.subject_id) || null,
      }));
    }
    if (this.selectFields.includes('assessment:assessments')) {
      const assessments = db.getTableData('assessments');
      data = data.map((item) => ({
        ...item,
        assessment: assessments.find((a) => a.id === item.related_assessment_id || a.id === item.assessment_id) || null,
      }));
    }
    if (this.selectFields.includes('mark:marks')) {
      const marks = db.getTableData('marks');
      data = data.map((item) => ({
        ...item,
        mark: marks.find((m) => m.assessment_id === item.id) || null,
      }));
    }

    // Sort
    if (this.sortField) {
      const sf = this.sortField;
      data.sort((a, b) => {
        const valA = a[sf];
        const valB = b[sf];
        if (valA === valB) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;
        const compare = valA < valB ? -1 : 1;
        return this.sortAscending ? compare : -compare;
      });
    }

    // Limit
    if (this.limitCount !== null) {
      data = data.slice(0, this.limitCount);
    }

    return data;
  }

  async then(resolve: any) {
    if (this.isInsert) {
      resolve(this.executeInsert());
    } else if (this.isUpsert) {
      resolve(this.executeUpsert());
    } else if (this.isUpdate) {
      resolve(this.executeUpdate());
    } else if (this.isDelete) {
      resolve(this.executeDelete());
    } else {
      const data = this.executeQuery();
      resolve({ data, error: null, count: data.length });
    }
  }

  async single() {
    if (this.isInsert) {
      const res = this.executeInsert();
      const rows = Array.isArray(res.data) ? res.data : [res.data];
      return { data: rows[0] || null, error: rows[0] ? null : new Error('No record inserted') };
    }
    if (this.isUpsert) {
      const res = this.executeUpsert();
      const rows = Array.isArray(res.data) ? res.data : [res.data];
      return { data: rows[0] || null, error: null };
    }
    if (this.isUpdate) {
      const res = this.executeUpdate();
      return { data: res.data[0] || null, error: res.data[0] ? null : new Error('No record found') };
    }
    if (this.isDelete) {
      const res = this.executeDelete();
      return { data: null, error: res.error };
    }
    const data = this.executeQuery();
    return { data: data[0] || null, error: data[0] ? null : new Error('No record found') };
  }

  async maybeSingle() {
    if (this.isInsert) {
      const res = this.executeInsert();
      const rows = Array.isArray(res.data) ? res.data : [res.data];
      return { data: rows[0] || null, error: null };
    }
    if (this.isUpsert) {
      const res = this.executeUpsert();
      const rows = Array.isArray(res.data) ? res.data : [res.data];
      return { data: rows[0] || null, error: null };
    }
    if (this.isUpdate) {
      const res = this.executeUpdate();
      return { data: res.data[0] || null, error: null };
    }
    if (this.isDelete) {
      this.executeDelete();
      return { data: null, error: null };
    }
    const data = this.executeQuery();
    return { data: data[0] || null, error: null };
  }
}

// Global channel subscription mock for Realtime updates
class MockChannel {
  on(event: string, filter: any, callback: () => void) {
    authCallbacks.push(() => callback());
    return this;
  }
  subscribe() {
    return this;
  }
}

export const mockSupabase = {
  auth: {
    async getSession() {
      const { session } = db.getSession();
      return { data: { session }, error: null };
    },

    async getUser() {
      const { session } = db.getSession();
      return { data: { user: session?.user ?? null }, error: null };
    },

    onAuthStateChange(callback: (event: string, session: any | null) => void) {
      const { session } = db.getSession();
      // Invoke immediately
      setTimeout(() => callback('SIGNED_IN', session), 10);
      authCallbacks.push(callback);
      return {
        data: {
          subscription: {
            unsubscribe() {
              const idx = authCallbacks.indexOf(callback);
              if (idx !== -1) authCallbacks.splice(idx, 1);
            },
          },
        },
      };
    },

    async signInWithPassword({ email, password }: any) {
      const authUsers = db.getTableData('auth_users');
      const found = authUsers.find((u) => u.email === email);
      
      if (!found) {
        return { data: { user: null }, error: { message: 'Invalid login credentials' } };
      }

      const sessionUser = { id: found.id, email: found.email, role: found.role };
      db.setSession(sessionUser);

      // Trigger auth callbacks
      authCallbacks.forEach((cb) => cb('SIGNED_IN', { user: sessionUser }));

      return { data: { user: sessionUser }, error: null };
    },

    async signUp({ email, password, options }: any) {
      const authUsers = db.getTableData('auth_users');
      const users = db.getTableData('users');

      if (authUsers.some((u) => u.email === email)) {
        return { data: { user: null }, error: { message: 'User already exists' } };
      }

      const newUserId = `mock-user-${Math.random().toString(36).substr(2, 9)}`;
      const newUserAuth = { id: newUserId, email, role: 'student' };
      
      // Auto-trigger handles profile creation in mock
      const newProfile = {
        id: newUserId,
        email,
        full_name: options?.data?.full_name || 'Student',
        year_group: null,
        role: 'student',
        created_at: new Date().toISOString(),
      };

      const defaultSettings = {
        id: `mock-setting-${Math.random().toString(36).substr(2, 9)}`,
        user_id: newUserId,
        dark_mode: true,
        notification_preferences_json: { due_7_days: true, due_1_day: true, overdue: true },
        created_at: new Date().toISOString(),
      };

      db.setTableData('auth_users', [...authUsers, newUserAuth]);
      db.setTableData('users', [...users, newProfile]);
      
      const settings = db.getTableData('settings');
      db.setTableData('settings', [...settings, defaultSettings]);

      db.setSession(newUserAuth);
      authCallbacks.forEach((cb) => cb('SIGNED_IN', { user: newUserAuth }));

      return { data: { user: newUserAuth }, error: null };
    },

    async signOut() {
      db.setSession(null);
      authCallbacks.forEach((cb) => cb('SIGNED_OUT', null));
      return { error: null };
    },

    async resend({ type, email }: { type: string; email: string }) {
      // No-op in mock — just return success
      return { data: {}, error: null };
    },
  },

  from(table: string) {
    return new QueryBuilder(table);
  },

  channel(name: string) {
    return new MockChannel();
  },

  removeChannel(channel: any) {
    // No-op
  },
};
