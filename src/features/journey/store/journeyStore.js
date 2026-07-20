import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { REGIONS } from '@/config';

// Initial state creator
const getInitialState = () => {
  const welcomeTasks = REGIONS.welcome?.tasks || [];
  return {
    tasks: JSON.parse(JSON.stringify(welcomeTasks)), // Deep copy to prevent mutating the original config
    activeTaskId: welcomeTasks[0]?.id || null,
    chapterOrder: ['welcome'],
    completedTaskIds: [],
  };
};

/**
 * Zustand store to manage user journey progression, including completed tasks,
 * active tasks, and unlocking subsequent tasks.
 */
export const useJourneyStore = create()(
  persist(
    immer((set) => ({
      ...getInitialState(),

      /**
       * Set the active task by ID.
       * @param {string} taskId - The ID of the task to make active.
       */
      setActiveTask: (taskId) =>
        set((state) => {
          state.activeTaskId = taskId;
        }),

      /**
       * Complete a task and unlock the next one in sequence.
       * @param {string} taskId - The ID of the completed task.
       */
      completeTask: (taskId) =>
        set((state) => {
          const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
          if (taskIndex === -1) return;

          // Mark current task completed
          state.tasks[taskIndex].status = 'completed';

          // Add to completed list if not already there
          if (!state.completedTaskIds.includes(taskId)) {
            state.completedTaskIds.push(taskId);
          }

          // Unlock next task in sequence
          const nextIndex = taskIndex + 1;
          if (nextIndex < state.tasks.length) {
            state.tasks[nextIndex].status = 'unlocked';
            state.activeTaskId = state.tasks[nextIndex].id;
          } else {
            // No more tasks in this chapter
            state.activeTaskId = null;
          }
        }),

      /**
       * Reset the store to initial state.
       */
      reset: () =>
        set((state) => {
          const initial = getInitialState();
          state.tasks = initial.tasks;
          state.activeTaskId = initial.activeTaskId;
          state.chapterOrder = initial.chapterOrder;
          state.completedTaskIds = initial.completedTaskIds;
        }),
    })),
    {
      name: 'wyld_town_v2',
    }
  )
);
