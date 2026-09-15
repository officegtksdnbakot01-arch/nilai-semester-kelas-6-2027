import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Student,
  Subject,
  Grade,
  SchoolExam,
  SchoolSettings,
  RombelInfo,
  User,
  SemesterCode,
} from '../types';
import { storage } from '../services/storage';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  students: Student[];
  subjects: Subject[];
  grades: Grade[];
  schoolExams: SchoolExam[];
  settings: SchoolSettings;
  rombels: RombelInfo[];
  users: User[];
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;

  // Student Actions
  addStudent: (student: Omit<Student, 'id'>) => boolean;
  updateStudent: (student: Student) => boolean;
  deleteStudent: (id: string) => boolean;

  // Grade Actions
  saveGrade: (
    studentId: string,
    subjectId: string,
    semester: SemesterCode,
    kelas: '4' | '5' | '6',
    rombel: string,
    nilaiAkhir: number | null,
    catatan?: string
  ) => void;
  saveGradesBatch: (
    items: Array<{
      studentId: string;
      subjectId: string;
      semester: SemesterCode;
      kelas: '4' | '5' | '6';
      rombel: string;
      nilaiAkhir: number | null;
      catatan?: string;
    }>
  ) => void;
  getStudentGrade: (studentId: string, subjectId: string, semester: SemesterCode) => Grade | undefined;

  // School Exam Actions
  saveSchoolExam: (
    studentId: string,
    subjectId: string,
    nilaiPraktik: number | null,
    nilaiTulis: number | null,
    nilaiAkhir: number | null,
    catatan?: string
  ) => void;

  // Settings Actions
  updateSettings: (newSettings: SchoolSettings) => void;

  // Rombel Actions
  updateRombel: (rombel: RombelInfo) => void;
  addRombel: (rombel: Omit<RombelInfo, 'id'>) => void;
  deleteRombel: (id: string) => void;

  // User Actions
  updateUser: (user: User) => void;

  // Subject Actions
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;

  // Calculations
  calculateGradeScore: (
    nilai: number | null,
    tulisFallback?: number | null
  ) => { akhir: number | null; predikat: 'A' | 'B' | 'C' | 'D' | '-' };

  // Batch import operations
  importStudentsBatch: (
    studentsToImport: Omit<Student, 'id'>[],
    duplicateAction: 'skip' | 'update' | 'cancel'
  ) => { added: number; updated: number; skipped: number };
  importStudents: (
    studentsToImport: Omit<Student, 'id'>[],
    duplicateAction: 'skip' | 'update' | 'cancel'
  ) => { added: number; updated: number; skipped: number };

  importGradesBatch: (
    gradesData: {
      nisn: string;
      mapel: string;
      semester: SemesterCode;
      nilai_akhir: number | null;
      catatan?: string;
      nilai_praktik?: number | null;
      nilai_tulis?: number | null;
    }[]
  ) => { successCount: number; failCount: number };
  importGrades: (
    gradesData: {
      nisn: string;
      mapel: string;
      semester: SemesterCode;
      nilai_akhir: number | null;
      catatan?: string;
      nilai_praktik?: number | null;
      nilai_tulis?: number | null;
    }[]
  ) => { successCount: number; failCount: number };

  // System
  refreshAll: () => void;
  resetDatabase: () => void;
  resetToDefaults: () => void;
  lastBackup: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(() => storage.getStudents());
  const [subjects, setSubjects] = useState<Subject[]>(() => storage.getSubjects());
  const [grades, setGrades] = useState<Grade[]>(() => storage.getGrades());
  const [schoolExams, setSchoolExams] = useState<SchoolExam[]>(() => storage.getSchoolExams());
  const [settings, setSettings] = useState<SchoolSettings>(() => storage.getSettings());
  const [rombels, setRombels] = useState<RombelInfo[]>(() => storage.getRombels());
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lastBackup, setLastBackup] = useState<string | null>(() => storage.getLastBackupDate());

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshAll = useCallback(() => {
    setStudents(storage.getStudents());
    setSubjects(storage.getSubjects());
    setGrades(storage.getGrades());
    setSchoolExams(storage.getSchoolExams());
    setSettings(storage.getSettings());
    setRombels(storage.getRombels());
    setUsers(storage.getUsers());
    setLastBackup(storage.getLastBackupDate());
  }, []);

  // Initial sync with persistent server database (across accounts & devices)
  useEffect(() => {
    storage.syncFromServer().then((serverData) => {
      if (serverData) {
        setStudents(serverData.students);
        setSubjects(serverData.subjects);
        setGrades(serverData.grades);
        setSchoolExams(serverData.schoolExams);
        setSettings(serverData.settings);
        setRombels(serverData.rombels);
        setUsers(serverData.users);
      }
    });
  }, []);

  const calculateGradeScore = useCallback(
    (nilai: number | null, tulisFallback?: number | null) => {
      if (nilai === null && (tulisFallback === undefined || tulisFallback === null)) {
        return { akhir: null, predikat: '-' as const };
      }

      let finalVal: number;
      if (tulisFallback !== undefined && tulisFallback !== null && nilai !== null) {
        // Fallback calculation if both values provided (e.g., legacy or preview)
        const bp = settings.bobot_praktik / 100;
        const bt = settings.bobot_tulis / 100;
        finalVal = Math.round(nilai * bp + tulisFallback * bt);
      } else if (nilai !== null) {
        finalVal = nilai;
      } else {
        finalVal = tulisFallback ?? 0;
      }

      let predikat: 'A' | 'B' | 'C' | 'D' = 'D';
      if (finalVal >= 90) predikat = 'A';
      else if (finalVal >= 80) predikat = 'B';
      else if (finalVal >= 70) predikat = 'C';
      else predikat = 'D';

      return { akhir: finalVal, predikat };
    },
    [settings.bobot_praktik, settings.bobot_tulis]
  );

  // Student CRUD
  const addStudent = (newStd: Omit<Student, 'id'>): boolean => {
    const exists = students.some((s) => s.nisn === newStd.nisn);
    if (exists) {
      addToast('error', `Siswa dengan NISN ${newStd.nisn} sudah terdaftar!`);
      return false;
    }
    const student: Student = {
      ...newStd,
      id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [...students, student];
    storage.saveStudents(updated);
    setStudents(updated);
    addToast('success', `Siswa ${student.nama} berhasil ditambahkan.`);
    return true;
  };

  const updateStudent = (updatedStudent: Student): boolean => {
    // Check if another student has the same NISN
    const duplicate = students.some(
      (s) => s.nisn === updatedStudent.nisn && s.id !== updatedStudent.id
    );
    if (duplicate) {
      addToast('error', `NISN ${updatedStudent.nisn} sudah digunakan oleh siswa lain!`);
      return false;
    }

    const updatedList = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    storage.saveStudents(updatedList);
    setStudents(updatedList);
    addToast('success', `Data siswa ${updatedStudent.nama} berhasil diperbarui.`);
    return true;
  };

  const deleteStudent = (id: string): boolean => {
    const target = students.find((s) => s.id === id);
    if (!target) return false;

    const updated = students.filter((s) => s.id !== id);
    storage.saveStudents(updated);
    setStudents(updated);

    // Also remove associated grades
    const updatedGrades = grades.filter((g) => g.student_id !== id);
    storage.saveGrades(updatedGrades);
    setGrades(updatedGrades);

    addToast('info', `Siswa ${target.nama} telah dihapus.`);
    return true;
  };

  // Grade operations (Semester grades use single Nilai Rapor / Nilai Akhir)
  const saveGrade = (
    studentId: string,
    subjectId: string,
    semester: SemesterCode,
    kelas: '4' | '5' | '6',
    rombel: string,
    nilaiAkhir: number | null,
    catatan?: string
  ) => {
    let predikat: 'A' | 'B' | 'C' | 'D' | undefined = undefined;
    if (nilaiAkhir !== null) {
      if (nilaiAkhir >= 90) predikat = 'A';
      else if (nilaiAkhir >= 80) predikat = 'B';
      else if (nilaiAkhir >= 70) predikat = 'C';
      else predikat = 'D';
    }

    const newGrade: Grade = {
      id: `grd_${studentId}_${subjectId}_${semester}`,
      student_id: studentId,
      subject_id: subjectId,
      semester,
      kelas,
      rombel,
      tahun_ajaran: settings.tahun_ajaran,
      nilai_akhir: nilaiAkhir,
      nilai_praktik: null,
      nilai_tulis: null,
      predikat,
      catatan: catatan || (nilaiAkhir && nilaiAkhir >= 85 ? 'Capaian pembelajaran sangat baik.' : 'Capaian pembelajaran tuntas.'),
      updated_at: new Date().toISOString(),
    };

    storage.upsertGrade(newGrade);

    setGrades((prev) => {
      const idx = prev.findIndex(
        (g) => g.student_id === studentId && g.subject_id === subjectId && g.semester === semester
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newGrade;
        return copy;
      }
      return [...prev, newGrade];
    });
  };

  const saveGradesBatch = (
    items: Array<{
      studentId: string;
      subjectId: string;
      semester: SemesterCode;
      kelas: '4' | '5' | '6';
      rombel: string;
      nilaiAkhir: number | null;
      catatan?: string;
    }>
  ) => {
    const currentGrades = [...grades];
    const now = new Date().toISOString();

    items.forEach((item) => {
      let predikat: 'A' | 'B' | 'C' | 'D' | undefined = undefined;
      if (item.nilaiAkhir !== null) {
        if (item.nilaiAkhir >= 90) predikat = 'A';
        else if (item.nilaiAkhir >= 80) predikat = 'B';
        else if (item.nilaiAkhir >= 70) predikat = 'C';
        else predikat = 'D';
      }

      const newGrade: Grade = {
        id: `grd_${item.studentId}_${item.subjectId}_${item.semester}`,
        student_id: item.studentId,
        subject_id: item.subjectId,
        semester: item.semester,
        kelas: item.kelas,
        rombel: item.rombel,
        tahun_ajaran: settings.tahun_ajaran,
        nilai_akhir: item.nilaiAkhir,
        nilai_praktik: null,
        nilai_tulis: null,
        predikat,
        catatan: item.catatan || '',
        updated_at: now,
      };

      const idx = currentGrades.findIndex(
        (g) =>
          g.student_id === item.studentId &&
          g.subject_id === item.subjectId &&
          g.semester === item.semester
      );
      if (idx >= 0) {
        currentGrades[idx] = newGrade;
      } else {
        currentGrades.push(newGrade);
      }
    });

    storage.saveGrades(currentGrades);
    setGrades(currentGrades);
  };

  const getStudentGrade = (studentId: string, subjectId: string, semester: SemesterCode) => {
    return grades.find(
      (g) => g.student_id === studentId && g.subject_id === subjectId && g.semester === semester
    );
  };

  // School Exam operations
  const saveSchoolExam = (
    studentId: string,
    subjectId: string,
    nilaiPraktik: number | null,
    nilaiTulis: number | null,
    nilaiAkhir: number | null,
    catatan?: string
  ) => {
    const exam: SchoolExam = {
      id: `exam_${studentId}_${subjectId}`,
      student_id: studentId,
      subject_id: subjectId,
      nilai_praktik: nilaiPraktik,
      nilai_tulis: nilaiTulis,
      nilai: nilaiAkhir,
      tahun_ajaran: settings.tahun_ajaran,
      catatan,
      updated_at: new Date().toISOString(),
    };

    storage.upsertSchoolExam(exam);

    setSchoolExams((prev) => {
      const idx = prev.findIndex((e) => e.student_id === studentId && e.subject_id === subjectId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = exam;
        return copy;
      }
      return [...prev, exam];
    });
  };

  // Subject operations
  const addSubject = (newSub: Omit<Subject, 'id'>) => {
    const sub: Subject = {
      ...newSub,
      id: `subj_${Date.now().toString(36)}`,
    };
    const updated = [...subjects, sub];
    storage.saveSubjects(updated);
    setSubjects(updated);
    addToast('success', `Mata pelajaran ${sub.nama_mapel} berhasil ditambahkan.`);
  };

  const updateSubject = (sub: Subject) => {
    const updated = subjects.map((s) => (s.id === sub.id ? sub : s));
    storage.saveSubjects(updated);
    setSubjects(updated);
    addToast('success', `Mata pelajaran ${sub.nama_mapel} berhasil diperbarui.`);
  };

  const deleteSubject = (id: string) => {
    const target = subjects.find((s) => s.id === id);
    if (!target) return;
    const updated = subjects.filter((s) => s.id !== id);
    storage.saveSubjects(updated);
    setSubjects(updated);
    addToast('info', `Mata pelajaran ${target.nama_mapel} telah dihapus.`);
  };

  // Settings
  const updateSettings = (newSettings: SchoolSettings) => {
    storage.saveSettings(newSettings);
    setSettings(newSettings);
    addToast('success', 'Pengaturan sekolah & bobot penilaian berhasil disimpan.');
  };

  // Rombel & Wali Kelas
  const updateRombel = (rombel: RombelInfo) => {
    const updated = rombels.map((r) => (r.id === rombel.id ? rombel : r));
    storage.saveRombels(updated);
    setRombels(updated);

    // Synchronize corresponding User account if exists for this rombel
    const nipVal = rombel.nip_wali_kelas || rombel.nip_wali || '';
    const updatedUsers = users.map((u) => {
      if (u.rombel === rombel.nama) {
        return {
          ...u,
          nama: `${rombel.wali_kelas} (Guru Kelas ${rombel.nama})`,
          nip: nipVal,
        };
      }
      return u;
    });
    storage.saveUsers(updatedUsers);
    setUsers(updatedUsers);

    // If active logged-in user is this teacher, update session storage
    const curr = storage.getCurrentUser();
    if (curr && curr.rombel === rombel.nama) {
      const updatedCurr = {
        ...curr,
        nama: `${rombel.wali_kelas} (Guru Kelas ${rombel.nama})`,
        nip: nipVal,
      };
      storage.setCurrentUser(updatedCurr);
    }

    addToast('success', `Data Guru Kelas & Rombel ${rombel.nama} berhasil diperbarui.`);
  };

  const updateUser = (user: User) => {
    const updatedUsers = users.map((u) => (u.id === user.id ? user : u));
    storage.saveUsers(updatedUsers);
    setUsers(updatedUsers);

    if (user.rombel) {
      const updatedRombels = rombels.map((r) => {
        if (r.nama === user.rombel) {
          const cleanName = user.nama.replace(/\(Guru Kelas.*?\)/, '').trim();
          return {
            ...r,
            wali_kelas: cleanName,
            nip_wali_kelas: user.nip || r.nip_wali_kelas,
          };
        }
        return r;
      });
      storage.saveRombels(updatedRombels);
      setRombels(updatedRombels);
    }

    const curr = storage.getCurrentUser();
    if (curr && curr.id === user.id) {
      storage.setCurrentUser(user);
    }

    addToast('success', `Data akun ${user.nama} berhasil diperbarui.`);
  };

  const addRombel = (newRombel: Omit<RombelInfo, 'id'>) => {
    const item: RombelInfo = {
      ...newRombel,
      id: `rombel_${Date.now().toString(36)}`,
    };
    const updated = [...rombels, item];
    storage.saveRombels(updated);
    setRombels(updated);
    addToast('success', `Rombel ${item.nama} berhasil ditambahkan.`);
  };

  const deleteRombel = (id: string) => {
    const target = rombels.find((r) => r.id === id);
    if (!target) return;
    const updated = rombels.filter((r) => r.id !== id);
    storage.saveRombels(updated);
    setRombels(updated);
    addToast('info', `Rombel ${target.nama} telah dihapus.`);
  };

  // Batch import students
  const importStudentsBatch = (
    studentsToImport: Omit<Student, 'id'>[],
    duplicateAction: 'skip' | 'update' | 'cancel'
  ) => {
    if (duplicateAction === 'cancel') {
      return { added: 0, updated: 0, skipped: 0 };
    }

    let currentList = [...students];
    let added = 0;
    let updated = 0;
    let skipped = 0;

    studentsToImport.forEach((item) => {
      const existingIdx = currentList.findIndex((s) => s.nisn === item.nisn);
      if (existingIdx >= 0) {
        if (duplicateAction === 'update') {
          currentList[existingIdx] = {
            ...item,
            id: currentList[existingIdx].id,
          };
          updated++;
        } else {
          skipped++;
        }
      } else {
        currentList.push({
          ...item,
          id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        });
        added++;
      }
    });

    storage.saveStudents(currentList);
    setStudents(currentList);
    addToast('success', `Import Siswa Selesai: +${added} baru, ~${updated} diperbarui, ${skipped} dilewati.`);
    return { added, updated, skipped };
  };

  // Batch import grades
  const importGradesBatch = (
    gradesData: {
      nisn: string;
      mapel: string;
      semester: SemesterCode;
      nilai_akhir: number | null;
      catatan?: string;
      nilai_praktik?: number | null;
      nilai_tulis?: number | null;
    }[]
  ) => {
    const studentMap = new Map<string, Student>(students.map((s) => [s.nisn, s]));
    const subjectMap = new Map<string, Subject>();
    subjects.forEach((s) => {
      subjectMap.set(s.nama_mapel.toLowerCase(), s);
      subjectMap.set(s.kode.toLowerCase(), s);
    });

    let successCount = 0;
    let failCount = 0;

    gradesData.forEach((row) => {
      const student = studentMap.get(row.nisn);
      const subject = subjectMap.get(row.mapel.toLowerCase());

      if (student && subject) {
        // Use nilai_akhir if present, otherwise calculate from fallback if any
        let scoreToSave = row.nilai_akhir;
        if (scoreToSave === null && (row.nilai_praktik !== undefined || row.nilai_tulis !== undefined)) {
          const { akhir } = calculateGradeScore(row.nilai_praktik ?? null, row.nilai_tulis ?? null);
          scoreToSave = akhir;
        }

        saveGrade(
          student.id,
          subject.id,
          row.semester,
          student.kelas,
          student.rombel,
          scoreToSave,
          row.catatan
        );
        successCount++;
      } else {
        failCount++;
      }
    });

    refreshAll();
    addToast('success', `Import Nilai Selesai: ${successCount} nilai berhasil dicatat.`);
    return { successCount, failCount };
  };

  const resetDatabase = () => {
    storage.resetAllData();
    refreshAll();
    addToast('info', 'Data siswa dan nilai telah dikosongkan dan disinkronkan ke server.');
  };

  return (
    <AppContext.Provider
      value={{
        students,
        subjects,
        grades,
        schoolExams,
        settings,
        rombels,
        users,
        toasts,
        addToast,
        removeToast,
        addStudent,
        updateStudent,
        deleteStudent,
        saveGrade,
        saveGradesBatch,
        getStudentGrade,
        saveSchoolExam,
        updateSettings,
        updateRombel,
        addRombel,
        deleteRombel,
        updateUser,
        addSubject,
        updateSubject,
        deleteSubject,
        calculateGradeScore,
        importStudentsBatch,
        importStudents: importStudentsBatch,
        importGradesBatch,
        importGrades: importGradesBatch,
        refreshAll,
        resetDatabase,
        resetToDefaults: resetDatabase,
        lastBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
