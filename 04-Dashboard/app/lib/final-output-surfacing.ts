// GPO Final Output Surfacing — Surface final answers and artifacts from completed tasks

import type { FinalTaskOutput, FinalOutputArtifact, OutputSurfacingReport } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

function uid(): string { return 'fos_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

const STATE_DIR = path.resolve(__dirname, '..', '..', 'state');
const REPORTS_DIR = path.resolve(__dirname, '..', '..', '..', '03-Operations', 'Reports');

function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }

/** Get final output for a specific task */
export function getFinalOutput(taskId: string): FinalTaskOutput | null {
  // Load tasks from both queue and intake systems
  const tasks = readJson<any[]>(path.join(STATE_DIR, 'tasks.json'), []);
  const intakeTasks = readJson<any[]>(path.join(STATE_DIR, 'intake-tasks.json'), []);
  const subtasks = readJson<any[]>(path.join(STATE_DIR, 'subtasks.json'), []);

  let task = tasks.find(t => t.task_id === taskId);
  if (!task) task = intakeTasks.find(t => t.task_id === taskId);
  if (!task) return null;

  // Load subtasks from both subtasks.json and inline intake subtasks
  let taskSubtasks = subtasks.filter(st => st.parent_task === taskId);
  // Also try intake module subtasks if none found
  if (taskSubtasks.length === 0) {
    try {
      const intake = require('./intake') as { getSubtasksForTask(id: string): any[] };
      taskSubtasks = intake.getSubtasksForTask(taskId);
    } catch { /* */ }
  }

  // Synthesize final answer from subtask outputs and reports
  let finalAnswer: string | null = null;
  let summary: string | null = null;
  const artifacts: FinalOutputArtifact[] = [];
  const reportPaths: string[] = [];
  const filesChanged: string[] = [];

  // Collect from subtasks (newest first)
  const doneSubs = taskSubtasks.filter(st => st.status === 'done').sort((a: any, b: any) => (b.updated_at || '').localeCompare(a.updated_at || ''));

  for (const st of doneSubs) {
    // Collect report paths
    if (st.report_file) {
      reportPaths.push(st.report_file);
      // Try to read the report content for the final answer
      if (!finalAnswer) {
        const reportContent = tryReadReport(st.report_file);
        if (reportContent) {
          finalAnswer = reportContent;
          artifacts.push({ type: 'report', title: st.title || 'Report', path: st.report_file, preview: reportContent.slice(0, 300) });
        }
      }
    }

    // Collect what_done as summary
    if (st.what_done && !summary) {
      summary = st.what_done;
    }

    // Collect files changed
    if (st.files_changed?.length) {
      for (const f of st.files_changed) {
        if (!filesChanged.includes(f)) filesChanged.push(f);
      }
    }

    // Collect diff as code change artifact
    if (st.diff_summary) {
      artifacts.push({ type: 'code_change', title: `Changes: ${st.title}`, path: '', preview: st.diff_summary.slice(0, 200) });
    }

    // Collect output as answer if no report
    if (!finalAnswer && st.output && st.output.length > 20) {
      finalAnswer = st.output;
      artifacts.push({ type: 'answer', title: st.title || 'Output', path: '', preview: st.output.slice(0, 300) });
    }
  }

  // Fallback: task-level output
  if (!finalAnswer && task.output) {
    finalAnswer = task.output;
  }

  return {
    task_id: taskId, task_title: task.title || task.request || taskId,
    status: task.status || 'unknown',
    final_answer: finalAnswer, summary,
    artifacts, report_paths: reportPaths, files_changed: filesChanged,
    created_at: task.created_at || new Date().toISOString(),
  };
}

/** Try to read a report file */
function tryReadReport(reportPath: string): string | null {
  const candidates = [
    path.resolve(__dirname, '..', '..', '..', reportPath),
    path.resolve(REPORTS_DIR, path.basename(reportPath)),
    reportPath,
  ];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return fs.readFileSync(candidate, 'utf-8');
      }
    } catch { /* */ }
  }
  return null;
}

/** Get output surfacing report — checks all recent tasks */
export function getSurfacingReport(): OutputSurfacingReport {
  const tasks = readJson<any[]>(path.join(STATE_DIR, 'tasks.json'), []);
  const doneTasks = tasks.filter(t => t.status === 'done').slice(0, 20);
  const issues: string[] = [];
  let withAnswer = 0;
  let missingAnswer = 0;

  for (const task of doneTasks) {
    const output = getFinalOutput(task.task_id);
    if (output?.final_answer) {
      withAnswer++;
    } else {
      missingAnswer++;
      issues.push(`Task "${task.title || task.task_id}" completed without visible final answer`);
    }
  }

  const quality = missingAnswer === 0 ? 'good' : missingAnswer <= doneTasks.length * 0.3 ? 'partial' : 'missing';

  return {
    report_id: uid(), tasks_checked: doneTasks.length,
    with_final_answer: withAnswer, missing_answer: missingAnswer,
    surfacing_quality: quality, issues: issues.slice(0, 10),
    created_at: new Date().toISOString(),
  };
}

module.exports = { getFinalOutput, getSurfacingReport };
