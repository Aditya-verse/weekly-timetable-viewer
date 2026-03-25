import React, { createContext, useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('timetable');
  const [validationError, setValidationError] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [tutorialStep, setTutorialStep] = useState(null);
  const [policyType, setPolicyType] = useState(null);
  
  const [theme, setTheme] = useLocalStorage('orbit-theme', 'dark');
  const [events, setEvents] = useLocalStorage('orbit-timetable', []);
  
  // Initialize input state with all required default properties
  const [input, setInput] = useState({ 
    task: '', 
    day: 'Monday', 
    time: '09:00', 
    priority: false,
    category: 'Work', // Defaults to Work
    subtasks: []      // Empty subtasks initially
  });
  const [editingId, setEditingId] = useState(null);
  
  const [googleEvents, setGoogleEvents] = useState([]);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const getWeekDates = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return {
        name: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i],
        date: date.getDate(),
        month: date.toLocaleString('default', { month: 'short' }),
        fullDate: date
      };
    });
  };

  const weekDates = getWeekDates();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsGoogleConnected(true);
        fetchGoogleEvents();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchGoogleEvents = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/calendar/events');
      if (response.ok) {
        const data = await response.json();
        const mappedEvents = data.map(ge => {
          const startDate = new Date(ge.start.dateTime || ge.start.date || '');
          const dayName = startDate.toLocaleDateString('en-US', { weekday: 'long' });
          const timeStr = startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
          
          return {
            id: ge.id,
            task: ge.summary,
            day: dayName,
            time: timeStr,
            priority: false,
            isExternal: true
          };
        });
        setGoogleEvents(mappedEvents);
        setIsGoogleConnected(true);
      }
    } catch (error) {
      console.error("Failed to fetch Google events", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const connectGoogle = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      const { url } = await response.json();
      window.open(url, 'google_oauth', 'width=600,height=700');
    } catch (error) {
      console.error("Failed to get auth URL", error);
    }
  };

  useEffect(() => {
    fetchGoogleEvents();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const addEvent = () => {
    if (!input.task.trim()) {
      setValidationError('Please fill the objective');
      return;
    }
    if (!input.time) {
      setValidationError('Please set a time');
      return;
    }

    if (editingId) {
      setEvents(events.map(e => e.id === editingId ? { ...input, id: editingId } : e));
      setEditingId(null);
    } else {
      setEvents([...events, { ...input, id: Date.now() }]);
    }

    setInput({ task: '', day: 'Monday', time: '09:00', priority: false, category: 'Work', subtasks: [] });
    setValidationError(null);
    setIsModalOpen(false);
    if (tutorialStep === 4) setTutorialStep(null);
  };

  const startEdit = (event) => {
    setInput({
      task: event.task,
      day: event.day,
      time: event.time,
      priority: event.priority,
      category: event.category || 'Work',
      subtasks: event.subtasks || []
    });
    setEditingId(event.id);
    setIsModalOpen(true);
  };

  const cancelEdit = () => {
    setInput({ task: '', day: 'Monday', time: '09:00', priority: false, category: 'Work', subtasks: [] });
    setEditingId(null);
    setValidationError(null);
    setIsModalOpen(false);
  };

  const confirmDelete = (id) => {
    setEvents(events.filter(e => e.id !== id));
    setDeleteConfirmId(null);
  };
  
  const toggleSubtask = (eventId, subtaskId) => {
    setEvents(events.map(e => {
      if (e.id === eventId && e.subtasks) {
        return {
          ...e,
          subtasks: e.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
        };
      }
      return e;
    }));
  };

  const toggleEventCompletion = (id) => {
    setEvents(events.map(e => e.id === id ? { ...e, completed: !e.completed } : e));
  };

  const updateEventDay = (eventId, newDay) => {
    setEvents(events.map(e => e.id === eventId ? { ...e, day: newDay } : e));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const sortedEvents = (day) => {
    const allEvents = [...events, ...googleEvents];
    return allEvents
      .filter(e => e.day === day)
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority ? -1 : 1;
        return a.time.localeCompare(b.time);
      });
  };

  const startTutorial = () => {
    setIsStarted(true);
    setTutorialStep(0);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Weekly Orbit Timetable', 14, 22);
    
    const tableData = days.map(day => {
      const dayEvents = sortedEvents(day);
      return dayEvents.map(e => [day, e.time, e.task, e.priority ? 'High' : 'Normal']);
    }).flat();

    autoTable(doc, {
      startY: 30,
      head: [['Day', 'Time', 'Task', 'Priority']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save('weekly-orbit.pdf');
  };

  const tutorialSteps = [
    { title: "Welcome to Orbit", text: "Let's align your life with precision. This is your mission control.", target: "header" },
    { title: "The Mission", text: "Start by defining your next objective here.", target: "input-task" },
    { title: "Crazy Timing", text: "Use our orbital selectors to set the perfect time and day.", target: "input-selectors" },
    { title: "Priority Orbit", text: "Mark critical missions with a star to keep them in focus.", target: "input-priority" },
    { title: "Launch", text: "Add it to your weekly orbit and watch your productivity soar.", target: "input-add" }
  ];

  const value = {
    isStarted, setIsStarted,
    isModalOpen, setIsModalOpen,
    viewMode, setViewMode,
    validationError, setValidationError,
    deleteConfirmId, setDeleteConfirmId,
    tutorialStep, setTutorialStep,
    policyType, setPolicyType, // NEW
    theme, setTheme, toggleTheme,
    events, setEvents,
    input, setInput,
    editingId, startEdit, cancelEdit,
    googleEvents,
    isGoogleConnected,
    isSyncing,
    weekDates, days,
    fetchGoogleEvents, connectGoogle,
    addEvent, confirmDelete, sortedEvents, toggleSubtask, toggleEventCompletion, updateEventDay,
    startTutorial, exportToPDF, tutorialSteps
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
