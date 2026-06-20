# Instructor lifecycle and authority model

The instructor journey is intentionally split into independent gates. Approval, profile readiness, public publication, and operational authority are not the same event.

## 1. Registration and review

1. Instructor submits the minimum registration and verification information.
2. Credentials and the instructor record are created in a disabled state.
3. Super Admin reviews the application.
4. Approval activates instructor portal access. Request-info and rejection states keep access disabled.

This lets MDPL verify identity before any student or center data becomes accessible.

## 2. Guided profile completion

After approval, the instructor can log in even when no center responsibility has been assigned. The useful first task is completing their professional/public profile:

- public display name;
- professional bio;
- public photo;
- discipline/style;
- city and state from the verified instructor record;
- explicit public-profile consent.

The system returns a completion percentage and missing-item checklist. Slugs are generated server-side and made unique. Instructors cannot publish themselves, mark themselves featured, or control display order.

## 3. Public review and publication

1. Instructor saves profile drafts.
2. A complete profile can be submitted for review.
3. Super Admin sees the completion score, safe preview, and missing fields.
4. Super Admin can publish, unpublish, feature, order, or request changes.
5. Public APIs require active status, consent, complete safe fields, and explicit publication.

Publication never grants operational authority.

## 4. Center responsibility assignment

An instructor can be assigned to multiple training centers through `InstructorTrainingCenterAssignment`. Each center assignment has independent capabilities:

- view center students;
- manage attendance;
- manage grading;
- manage classes.

Super Admin can start with read-only student visibility and progressively grant responsibilities. Removing a center assignment immediately removes center-derived access without deleting the instructor, center, or student records.

Direct instructor-to-student assignments remain supported for exceptional coaching relationships. The instructor's student list is the union of direct assignments and students in centers where student visibility is granted.

## 5. Instructor workspace

The instructor dashboard should organize work center-first:

1. assigned centers and granted capabilities;
2. students scoped to those centers or direct assignments;
3. attendance, grading, and classes allowed by capability;
4. recent activity and pending work;
5. professional/public profile completion.

Every write operation must validate authority on the server. Hiding a UI button is not authorization.

## Recommended next expansion

- Add class/session creation and grading write APIs using the same center capability checks.
- Add per-center activity summaries and a center switcher when operational volume grows.
- Add certification and experience tables rather than embedding verification data in biography text.
- Add audit history for authority changes.
- Keep students excluded from public listing until consent and minor/guardian safeguards are implemented.
