'use client';

import React from 'react';
import { AdminProvider } from '../../features/admin/context/AdminContext';
import { AdminLayout } from '../../components/admin/AdminLayout';

export default function AdminPage() {
  return (
    <AdminProvider>
      <AdminLayout />
    </AdminProvider>
  );
}
