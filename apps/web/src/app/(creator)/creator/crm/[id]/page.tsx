/**
 * CRM Fan Detail Page (F8)
 */

'use client';

import { use } from 'react';
import { FanDetailPageComponent } from './page.component';

export default function FanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <FanDetailPageComponent fanId={resolvedParams.id} />;
}
