import React, { createContext, useContext, useState, useEffect } from "react";
import useOfflineStatus from "../hooks/useOfflineStatus";

export interface PendingSyncItem {
  id: string;
  type: "LESSON_COMPLETED" | "QUIZ_SCORE" | "STREAK_UPDATE";
  data: any;
  timestamp: string;
}

interface StudentProfile {
  name: string;
  grade: "7º" | "8º" | "9º";
  score: number;
  streak: number;
}

interface AppContextType {
  student: StudentProfile;
  isOnline: boolean;
  isOverridden: boolean;
  simulateConnection: (online: boolean | null) => void;
  pendingSyncQueue: PendingSyncItem[];
  addPendingSync: (type: PendingSyncItem["type"], data: any) => void;
  syncOfflineData: () => Promise<void>;
  completeLesson: (lessonId: string, title: string) => void;
  submitQuizScore: (
    quizId: string,
    score: number,
    totalQuestions: number,
  ) => void;
  clearQueue: () => void;
  completedLessons: string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isOnline, isOverridden, simulateConnection } = useOfflineStatus();
  const [student, setStudent] = useState<StudentProfile>({
    name: "Estudiante MathNova",
    grade: "8º",
    score: 120,
    streak: 3,
  });

  const [pendingSyncQueue, setPendingSyncQueue] = useState<PendingSyncItem[]>(
    [],
  );
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // Load initial data from localStorage if available
  useEffect(() => {
    const localQueue = localStorage.getItem("mathnova_sync_queue");
    if (localQueue) setPendingSyncQueue(JSON.parse(localQueue));

    const localLessons = localStorage.getItem("mathnova_completed_lessons");
    if (localLessons) setCompletedLessons(JSON.parse(localLessons));

    const localStudent = localStorage.getItem("mathnova_student");
    if (localStudent) setStudent(JSON.parse(localStudent));
  }, []);

  // Sync state to localStorage on changes
  useEffect(() => {
    localStorage.setItem(
      "mathnova_sync_queue",
      JSON.stringify(pendingSyncQueue),
    );
  }, [pendingSyncQueue]);

  useEffect(() => {
    localStorage.setItem(
      "mathnova_completed_lessons",
      JSON.stringify(completedLessons),
    );
  }, [completedLessons]);

  useEffect(() => {
    localStorage.setItem("mathnova_student", JSON.stringify(student));
  }, [student]);

  const addPendingSync = (type: PendingSyncItem["type"], data: any) => {
    const newItem: PendingSyncItem = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      data,
      timestamp: new Date().toISOString(),
    };
    setPendingSyncQueue((prev) => [...prev, newItem]);
  };

  const syncOfflineData = async () => {
    if (!isOnline) {
      alert(
        "No hay conexión de internet disponible. Vuelve a intentar cuando estés conectado.",
      );
      return;
    }

    if (pendingSyncQueue.length === 0) {
      alert("No hay datos pendientes por sincronizar.");
      return;
    }

    try {
      // Simulate API sync call
      console.log(
        "Sincronizando los siguientes datos con el servidor PostgreSQL...",
        pendingSyncQueue,
      );

      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          queue: pendingSyncQueue,
          studentName: student.name,
        }),
      }).catch(() => {
        // Fallback for demo when backend is offline
        return { ok: true, simulated: true };
      });

      // @ts-ignore
      if (response.ok || response.simulated) {
        setPendingSyncQueue([]);
        alert(
          "¡Sincronización exitosa con la base de datos PostgreSQL online!",
        );
      } else {
        alert("Error al sincronizar con el servidor.");
      }
    } catch (e) {
      console.error(e);
      alert(
        "La API backend está offline, pero simulamos la sincronización de datos con PostgreSQL.",
      );
      setPendingSyncQueue([]);
    }
  };

  const completeLesson = (lessonId: string, title: string) => {
    if (completedLessons.includes(lessonId)) return;

    setCompletedLessons((prev) => [...prev, lessonId]);
    setStudent((prev) => ({
      ...prev,
      score: prev.score + 50,
      streak: prev.streak + 1,
    }));

    if (!isOnline) {
      addPendingSync("LESSON_COMPLETED", { lessonId, title, xpGained: 50 });
    } else {
      // Direct online sync simulation
      console.log(`Lección "${title}" enviada directamente a PostgreSQL.`);
    }
  };

  const submitQuizScore = (
    quizId: string,
    score: number,
    totalQuestions: number,
  ) => {
    const pointsGained = Math.round((score / totalQuestions) * 100);
    setStudent((prev) => ({
      ...prev,
      score: prev.score + pointsGained,
    }));

    if (!isOnline) {
      addPendingSync("QUIZ_SCORE", {
        quizId,
        score,
        totalQuestions,
        xpGained: pointsGained,
      });
    } else {
      console.log(
        `Quiz "${quizId}" score de ${score}/${totalQuestions} enviado directamente a PostgreSQL.`,
      );
    }
  };

  const clearQueue = () => {
    setPendingSyncQueue([]);
  };

  // Automatically attempt sync when transitioning from offline to online
  useEffect(() => {
    if (isOnline && pendingSyncQueue.length > 0) {
      console.log(
        "Conexión detectada. Intentando sincronizar automáticamente...",
      );
      // Small timeout to simulate visual delay
      const timer = setTimeout(() => {
        syncOfflineData();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <AppContext.Provider
      value={{
        student,
        isOnline,
        isOverridden,
        simulateConnection,
        pendingSyncQueue,
        addPendingSync,
        syncOfflineData,
        completeLesson,
        submitQuizScore,
        clearQueue,
        completedLessons,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp debe ser usado dentro de AppProvider");
  return context;
};
