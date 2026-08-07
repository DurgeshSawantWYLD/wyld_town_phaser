import React, { useRef } from 'react';
import { useCityStore } from '@/features/city';
import { useJourneyStore } from '@/features/journey';
import { REGIONS } from '@/config';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import confetti from 'canvas-confetti';

/**
 * ChapterView sub-component
 * Displays the chapter title, emoji, description, and list of tasks with chapter themed styling.
 */
const ChapterView = React.memo(({ region, regionTheme, tasks, onSelectTask, onClose }) => {
  if (!region) return null;

  const accentHex = regionTheme?.accentColorHex || '#00e5ff';
  const headerBg = regionTheme?.skyColors ? `linear-gradient(180deg, ${regionTheme.skyColors[1]}, ${regionTheme.skyColors[0]})` : 'none';

  return (
    <>
      <div className="panel-header" style={{ background: headerBg, borderBottom: `1px solid ${accentHex}33` }}>
        <button id="panel-close" onClick={onClose} aria-label="Close Panel">
          &times;
        </button>
        <div className="panel-icon" style={{ border: `1.5px solid ${accentHex}55`, boxShadow: `0 0 12px ${accentHex}33` }}>
          {region.emoji}
        </div>
        <h2 id="panel-title">{region.title}</h2>
        <span id="panel-sub" style={{ color: accentHex }}>{region.sub || 'District'}</span>
      </div>

      <div className="panel-body">
        <p id="panel-desc">{region.desc}</p>

        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: accentHex }}>
            Tasks
          </h3>
          {tasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isLocked = task.status === 'locked';

            return (
              <div
                key={task.id}
                className="task-item"
                onClick={() => !isLocked && onSelectTask(task.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderRadius: '16px',
                  background: isCompleted
                    ? 'rgba(26, 127, 90, 0.2)'
                    : isLocked
                    ? 'rgba(255, 255, 255, 0.02)'
                    : `${accentHex}10`,
                  border: `1.5px solid ${
                    isCompleted
                      ? '#4ade8055'
                      : isLocked
                      ? 'rgba(255, 255, 255, 0.05)'
                      : `${accentHex}44`
                  }`,
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.5 : 1,
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '20px' }}>
                  {isCompleted ? '✅' : isLocked ? '🔒' : '🔓'}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                    {task.title}
                  </h4>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: isCompleted ? '#4ade80' : isLocked ? '#8a9bb0' : accentHex }}>
                    {task.status.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
});

ChapterView.displayName = 'ChapterView';

/**
 * TaskView sub-component
 * Displays details of a specific task, its rewards, and a complete task button themed with chapter colors.
 */
const TaskView = React.memo(({ task, regionTheme, onBack, onComplete }) => {
  if (!task) return null;

  const isCompleted = task.status === 'completed';
  const accentHex = regionTheme?.accentColorHex || '#00e5ff';
  const headerBg = regionTheme?.skyColors ? `linear-gradient(180deg, ${regionTheme.skyColors[1]}, ${regionTheme.skyColors[0]})` : 'none';

  return (
    <>
      <div className="panel-header" style={{ height: '140px', background: headerBg, borderBottom: `1px solid ${accentHex}33` }}>
        <button
          id="panel-task-back"
          onClick={onBack}
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: 'rgba(255, 255, 255, 0.06)',
            border: `1px solid ${accentHex}44`,
            color: '#ffffff',
            padding: '4px 12px',
            borderRadius: '99px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          ← Back
        </button>
        <span id="panel-sub" style={{ marginTop: '16px', color: isCompleted ? '#4ade80' : accentHex, fontWeight: 800, letterSpacing: '1px' }}>
          {isCompleted ? 'TASK COMPLETED' : 'ACTIVE TASK'}
        </span>
        <h2 id="panel-title" style={{ marginTop: '8px', textAlign: 'center', padding: '0 16px' }}>
          {task.title}
        </h2>
      </div>

      <div className="panel-body">
        <p id="panel-desc">{task.desc}</p>

        {task.rewards && task.rewards.length > 0 && (
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: accentHex }}>
              Rewards
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {task.rewards.map((reward, idx) => (
                <div
                  key={idx}
                  className="reward-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: `${accentHex}0f`,
                    border: `1px solid ${accentHex}33`,
                    borderRadius: '12px',
                    padding: '12px 16px',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{reward.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                    {reward.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="panel-footer">
        <button
          id="panel-cta"
          disabled={isCompleted}
          onClick={onComplete}
          style={{
            background: isCompleted
              ? 'rgba(255, 255, 255, 0.1)'
              : `linear-gradient(135deg, ${accentHex}, ${regionTheme?.skyColors ? regionTheme.skyColors[1] : '#2563eb'})`,
            cursor: isCompleted ? 'not-allowed' : 'pointer',
            opacity: isCompleted ? 0.6 : 1,
            boxShadow: isCompleted ? 'none' : `0 4px 20px ${accentHex}44`,
          }}
        >
          {isCompleted ? 'Task Already Completed' : 'Complete Task'}
        </button>
      </div>
    </>
  );
});

TaskView.displayName = 'TaskView';

/**
 * Panel Component
 * Sidebar detail drawer that displays information about active chapters or specific tasks.
 */
const Panel = React.memo(() => {
  const panelOpen = useCityStore((s) => s.panelOpen);
  const panelView = useCityStore((s) => s.panelView);
  const activeRegionId = useCityStore((s) => s.activeRegionId);
  const activeTaskId = useCityStore((s) => s.activeTaskId);

  const openPanel = useCityStore((s) => s.openPanel);
  const closePanel = useCityStore((s) => s.closePanel);

  const tasks = useJourneyStore((s) => s.tasks);
  const completeTask = useJourneyStore((s) => s.completeTask);
  const setActiveTask = useJourneyStore((s) => s.setActiveTask);

  const panelRef = useRef(null);

  // GSAP slide-in / slide-out animation responsive to screen size.
  useGSAP(() => {
    const isMobile = window.innerWidth <= 768;

    if (panelOpen) {
      if (isMobile) {
        gsap.to(panelRef.current, {
          y: 0,
          x: 0,
          duration: 0.45,
          ease: 'power3.out',
        });
      } else {
        gsap.to(panelRef.current, {
          x: 0,
          y: 0,
          duration: 0.45,
          ease: 'power3.out',
        });
      }
    } else {
      if (isMobile) {
        gsap.to(panelRef.current, {
          y: '100%',
          x: 0,
          duration: 0.45,
          ease: 'power3.in',
        });
      } else {
        gsap.to(panelRef.current, {
          x: '400px',
          y: 0,
          duration: 0.45,
          ease: 'power3.in',
        });
      }
    }
  }, [panelOpen]);

  const handleSelectTask = (taskId) => {
    setActiveTask(taskId);
    openPanel(activeRegionId, taskId);
  };

  const handleBackToChapter = () => {
    openPanel(activeRegionId, null);
  };

  const handleCompleteTask = () => {
    if (activeTaskId) {
      completeTask(activeTaskId);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const activeTask = tasks.find((t) => t.id === activeTaskId) || null;
  
  // Determine region from activeTask if available, otherwise activeRegionId
  const taskRegionId = activeTask ? (activeTask.id.split('_')[0] || activeRegionId) : activeRegionId;
  const regionData = REGIONS[taskRegionId] || REGIONS[activeRegionId] || null;
  const chapterTasks = tasks.filter((t) => t.id.startsWith(regionData?.id || activeRegionId));

  const themeConfig = regionData?.theme || {};
  const accentHex = themeConfig.accentColor 
    ? `#${themeConfig.accentColor.toString(16).padStart(6, '0')}` 
    : '#00e5ff';
  const regionTheme = {
    skyColors: themeConfig.skyColors || ['#0d211f', '#122a27', '#1b3c38'],
    accentColorHex: accentHex,
  };

  return (
    <div 
      id="panel"
      ref={panelRef}
      style={{
        backgroundColor: regionTheme.skyColors[0],
        border: `1.5px solid ${regionTheme.accentColorHex}44`,
        boxShadow: `-4px 0 32px rgba(0, 0, 0, 0.4), 0 0 20px ${regionTheme.accentColorHex}22`,
      }}
    >
      {panelView === 'task' ? (
        <TaskView
          task={activeTask}
          regionTheme={regionTheme}
          onBack={handleBackToChapter}
          onComplete={handleCompleteTask}
        />
      ) : (
        <ChapterView
          region={regionData}
          regionTheme={regionTheme}
          tasks={chapterTasks}
          onSelectTask={handleSelectTask}
          onClose={closePanel}
        />
      )}
    </div>
  );
});

Panel.displayName = 'Panel';

export default Panel;
