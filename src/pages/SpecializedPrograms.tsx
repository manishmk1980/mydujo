import React from 'react';
import { Target } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';

/**
 * Student-admin page: assigned specialized tracks only.
 * No public marketing content. Super admin assigns tracks; empty state when none.
 */
export default function SpecializedPrograms() {
  const assignedTracks: Array<{ id: string; name: string; status: string }> = [];
  const hasTracks = assignedTracks.length > 0;

  return (
    <PageContainer>
      <PageHeader
        title="Specialized Tracks"
        description="Tracks assigned to you by your dojo. Your admin will update this when applicable."
      />
      {hasTracks ? (
        <div className="space-y-4">
          {/* Future: list assigned tracks with status, instructor, start date, progress */}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title="No specialized tracks assigned yet"
          description="Your dojo admin will update this when applicable. If you believe you should have access to a track, please contact your instructor."
        />
      )}
    </PageContainer>
  );
}
