import React from 'react';
import {
  Download,
  FileText,
  Info,
  Lock,
  MessageSquare,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';

/**
 * Student-admin belt grading page. This is a read-only student view showing
 * grading progress and roadmap details specific to the logged-in student.
 * Updates are managed by dojo admins from the backend.
 */
export default function GradingRoadmap() {
  const gradingHierarchy = [
    { rank: '9th - 7th Kyu', label: 'Beginner (White/Yellow/Orange)' },
    { rank: '6th - 4th Kyu', label: 'Intermediate (Green/Blue/Purple)' },
    { rank: '3rd - 1st Kyu', label: 'Advanced (Brown)' },
    { rank: '1st - 10th Dan', label: 'Mastery (Black)' },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Belt Grading"
        description="View your belt grading progress and roadmap. Updates are managed by your dojo from the backend."
      />

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
              <Info className="size-6 text-slate-400" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">
                Current Level
              </p>
              <p className="text-lg font-bold text-slate-400">—</p>
            </div>
          </div>

          <div className="flex-1 max-w-xs mx-8 hidden md:block">
            <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-0 rounded-full bg-slate-200" />
            </div>
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase mt-2">
              Next Grading Window: —
            </p>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Next Goal</p>
              <p className="text-lg font-bold text-slate-400">—</p>
            </div>

            <div className="size-12 rounded bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
              <Info className="size-6 text-slate-400" />
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-500 mt-4 italic">
          Belt and grading information will appear here once your dojo updates your
          progression details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4 relative">
          <div className="roadmap-line" />

          <div className="relative pl-16">
            <div className="absolute left-3 top-0 z-10 size-8 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center text-slate-400">
              <Lock className="size-4" />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      Step 1
                    </span>
                    <h3 className="text-lg font-bold mt-1">
                      Minimum Attendance (Hours)
                    </h3>
                    <p className="text-sm text-slate-500">
                      Your attendance requirement will be set by your dojo.
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-400">—/—</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Hours Logged
                    </p>
                  </div>
                </div>

                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-0 rounded-full bg-slate-200" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative pl-16">
            <div className="absolute left-3 top-0 z-10 size-8 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center text-slate-400">
              <Lock className="size-4" />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      Step 2
                    </span>
                    <h3 className="text-lg font-bold mt-1">
                      Skill Mastery (Katas & Techniques)
                    </h3>
                    <p className="text-sm text-slate-500">
                      Syllabus components will be updated by your instructor.
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-400">—</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Syllabus Completion
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative pl-16">
            <div className="absolute left-3 top-0 z-10 size-8 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center text-slate-400">
              <Lock className="size-4" />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Step 3
                </span>
                <h3 className="text-lg font-bold mt-1">Pre-Grading Mock Exam</h3>
                <p className="text-sm text-slate-500">
                  Instructor evaluation to confirm readiness for the formal exam.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                <MessageSquare className="size-5" />
              </div>
              <h4 className="font-bold text-slate-700">Sensei&apos;s Notes</h4>
            </div>

            <p className="text-sm text-slate-500 italic">
              Personalized feedback from your instructor will appear here once added.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Info className="size-4 text-primary" />
                Grading Hierarchy
              </h3>
            </div>

            <div className="p-4 space-y-3">
              {gradingHierarchy.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between text-xs text-slate-600"
                >
                  <span>{item.rank}</span>
                  <span className="font-medium text-slate-900">{item.label}</span>
                </div>
              ))}

              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 leading-tight">
                  Grading requires consistent spirit (Kokoro), technique (Gi), and
                  physical strength (Tai).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <FileText className="size-6" />
          </div>

          <div>
            <h4 className="font-bold text-slate-900">
              Download Technical Requirements
            </h4>
            <p className="text-sm text-slate-600">
              A PDF guide will be available from your dojo when provided.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled
          className="whitespace-nowrap bg-slate-100 text-slate-400 px-6 py-2 rounded-lg text-sm font-semibold cursor-not-allowed"
        >
          <Download className="size-4 inline mr-2" />
          Download PDF
        </button>
      </div>
    </PageContainer>
  );
}