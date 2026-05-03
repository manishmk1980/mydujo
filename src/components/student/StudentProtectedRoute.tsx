import type { ReactNode } from 'react';

import { ProtectedRoute } from '../ProtectedRoute';

/**
 * Student app route guard. Today this delegates to the shared authenticated shell;
 * future work can narrow this to student roles and `/student/login` redirects without
 * changing call sites.
 */
export function StudentProtectedRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
