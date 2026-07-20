import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useJourneyStore } from '@/features/journey';
import { useCityStore } from '@/features/city';
import { LevelMap } from '@/world/LevelMap';

/**
 * Custom hook to manage the lifecycle of the LevelMap instance.
 * @returns {React.MutableRefObject<LevelMap|null>} The LevelMap instance ref.
 */
export function useLevelMap() {
  const { gl } = useThree();
  const levelMapRef = useRef(null);

  const tasks = useJourneyStore((s) => s.tasks);
  const activeTaskId = useJourneyStore((s) => s.activeTaskId);
  const setActiveTask = useJourneyStore((s) => s.setActiveTask);
  const openPanel = useCityStore((s) => s.openPanel);
  const currentView = useCityStore((s) => s.currentView);

  // Initialize LevelMap instance
  useEffect(() => {
    const handleTaskClick = (task) => {
      if (!task) return;
      const regionId = task.id.split('_')[0];
      setActiveTask(task.id);
      openPanel(regionId, task.id);
    };

    const levelMap = new LevelMap(gl, handleTaskClick);
    levelMapRef.current = levelMap;

    return () => {
      levelMap.deactivate();
      levelMap.destroy();
      levelMapRef.current = null;
    };
  }, [gl, setActiveTask, openPanel]);

  // Sync tasks and active task when they change
  useEffect(() => {
    if (levelMapRef.current) {
      levelMapRef.current.setTasks(tasks, activeTaskId);
    }
  }, [tasks, activeTaskId]);

  // Handle activation / deactivation based on current view
  useEffect(() => {
    const levelMap = levelMapRef.current;
    if (!levelMap) return;

    if (currentView === 'level') {
      levelMap.activate();
    } else {
      levelMap.deactivate();
    }
  }, [currentView]);

  return levelMapRef;
}
