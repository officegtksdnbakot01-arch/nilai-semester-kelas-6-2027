import { Student, Subject, Grade, SchoolExam, SchoolSettings, User, RombelInfo, SemesterCode } from '../types';

const STORAGE_KEYS = {
  USERS: 'sdnbkt01_users',
  STUDENTS: 'sdnbkt01_students',
  SUBJECTS: 'sdnbkt01_subjects',
  GRADES: 'sdnbkt01_grades',
  SCHOOL_EXAM: 'sdnbkt01_school_exam',
  SETTINGS: 'sdnbkt01_settings',
  ROMBELS: 'sdnbkt01_rombels',
  CURRENT_USER: 'sdnbkt01_current_user',
  LAST_BACKUP: 'sdnbkt01_last_backup',
};

export const INITIAL_SETTINGS: SchoolSettings = {
  id: 'settings_01',
  nama_sekolah: 'SDN BABELAN KOTA 01',
  npsn: '20218342',
  kecamatan: 'Babelan',
  kabupaten: 'Bekasi',
  provinsi: 'Jawa Barat',
  alamat_sekolah: 'Jl. Raya Babelan No. 01, Kel. Babelan Kota, Kec. Babelan, Kab. Bekasi 17610',
  tahun_ajaran: '2026/2027',
  semester_aktif: 'Smt1_Kls6',
  bobot_praktik: 50,
  bobot_tulis: 50,
  kktp_default: 75,
  nama_kepsek: 'Lailatul Fajriah, S.Pd.SD',
  nip_kepsek: '197808202008012005',
  nama_kepala_sekolah: 'Lailatul Fajriah, S.Pd.SD',
  nip_kepala_sekolah: '197808202008012005',
  kota_tanda_tangan: 'Bekasi',
  tanggal_rapor: '26 Juni 2027',
  logo_url: 'https://i.ibb.co.com/rRhHc2PD/logo-bakot-01.png',
};

export const INITIAL_ROMBELS: RombelInfo[] = [
  // Hanya Jenjang Kelas 6: 6A, 6B, 6C, 6D (Data Paten Resmi SDN Babelan Kota 01)
  {
    id: 'rombel_6a',
    nama: '6A',
    kelas: '6',
    wali_kelas: 'Ngatimah, S.Pd',
    nip_wali_kelas: '197212172014082001',
    nip_wali: '197212172014082001',
    kapasitas: 32,
    ruangan: 'Kelas 6A',
  },
  {
    id: 'rombel_6b',
    nama: '6B',
    kelas: '6',
    wali_kelas: 'Rahmat Hidayattulloh, S.Pd',
    nip_wali_kelas: '197808182008011004',
    nip_wali: '197808182008011004',
    kapasitas: 32,
    ruangan: 'Kelas 6B',
  },
  {
    id: 'rombel_6c',
    nama: '6C',
    kelas: '6',
    wali_kelas: 'Esin Riawati, S.Pd',
    nip_wali_kelas: '198607262009022001',
    nip_wali: '198607262009022001',
    kapasitas: 32,
    ruangan: 'Kelas 6C',
  },
  {
    id: 'rombel_6d',
    nama: '6D',
    kelas: '6',
    wali_kelas: 'Didi Mulyadi, S.Pd',
    nip_wali_kelas: '198911062025211012',
    nip_wali: '198911062025211012',
    kapasitas: 32,
    ruangan: 'Kelas 6D',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin',
    nama: 'Samsudin',
    username: 'admin',
    password: 'password123',
    role: 'admin',
    nip: '198105102025211008',
  },
  {
    id: 'user_guru_6a',
    nama: 'Ngatimah, S.Pd (Guru Kelas 6A)',
    username: 'guru6a',
    password: 'password123',
    role: 'guru',
    rombel: '6A',
    nip: '197212172014082001',
  },
  {
    id: 'user_guru_6b',
    nama: 'Rahmat Hidayattulloh, S.Pd (Guru Kelas 6B)',
    username: 'guru6b',
    password: 'password123',
    role: 'guru',
    rombel: '6B',
    nip: '197808182008011004',
  },
  {
    id: 'user_guru_6c',
    nama: 'Esin Riawati, S.Pd (Guru Kelas 6C)',
    username: 'guru6c',
    password: 'password123',
    role: 'guru',
    rombel: '6C',
    nip: '198607262009022001',
  },
  {
    id: 'user_guru_6d',
    nama: 'Didi Mulyadi, S.Pd (Guru Kelas 6D)',
    username: 'guru6d',
    password: 'password123',
    role: 'guru',
    rombel: '6D',
    nip: '198911062025211012',
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'subj_pabp',
    kode: 'PABP',
    nama_mapel: 'Pendidikan Agama dan Budi Pekerti',
    kategori: 'Wajib',
    fase: 'C',
    kelas: ['4', '5', '6'],
    urutan: 1,
    aktif: true,
    kktp: 75,
  },
  {
    id: 'subj_pp',
    kode: 'PP',
    nama_mapel: 'Pendidikan Pancasila',
    kategori: 'Wajib',
    fase: 'C',
    kelas: ['4', '5', '6'],
    urutan: 2,
    aktif: true,
    kktp: 75,
  },
  {
    id: 'subj_bind',
    kode: 'BIND',
    nama_mapel: 'Bahasa Indonesia',
    kategori: 'Wajib',
    fase: 'C',
    kelas: ['4', '5', '6'],
    urutan: 3,
    aktif: true,
    kktp: 75,
  },
  {
    id: 'subj_mtk',
    kode: 'MTK',
    nama_mapel: 'Matematika',
    kategori: 'Wajib',
    fase: 'C',
    kelas: ['4', '5', '6'],
    urutan: 4,
    aktif: true,
    kktp: 75,
  },
  {
    id: 'subj_ipas',
    kode: 'IPAS',
    nama_mapel: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    kategori: 'Wajib',
    fase: 'C',
    kelas: ['4', '5', '6'],
    urutan: 5,
    aktif: true,
    kktp: 75,
  },
  {
    id: 'subj_pjok',
    kode: 'PJOK',
    nama_mapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan',
    kategori: 'Wajib',
    fase: 'C',
    kelas: ['4', '5', '6'],
    urutan: 6,
    aktif: true,
    kktp: 75,
  },
  {
    id: 'subj_seni',
    kode: 'SENI',
    nama_mapel: 'Seni dan Budaya (Seni Rupa)',
    kategori: 'Wajib',
    fase: 'C',
    kelas: ['4', '5', '6'],
    urutan: 7,
    aktif: true,
    kktp: 75,
  },
  {
    id: 'subj_bing',
    kode: 'BING',
    nama_mapel: 'Bahasa Inggris',
    kategori: 'Pilihan',
    fase: 'C',
    kelas: ['4', '5', '6'],
    urutan: 8,
    aktif: true,
    kktp: 75,
  },
  {
    id: 'subj_mulok',
    kode: 'MULOK',
    nama_mapel: 'Muatan Lokal (Bahasa Sunda)',
    kategori: 'Muatan Lokal',
    fase: 'C',
    kelas: ['4', '5', '6'],
    urutan: 9,
    aktif: true,
    kktp: 75,
  },
];

// Helper to generate Indonesian student dummy names (clarified as sample data)
const FIRST_NAMES = [
  'Aditya', 'Aisyah', 'Alif', 'Anisa', 'Bayu', 'Bunga', 'Cahyo', 'Citra',
  'Dimas', 'Dinda', 'Eko', 'Elsa', 'Fajar', 'Farah', 'Galih', 'Gita',
  'Hafiz', 'Hanifah', 'Ilham', 'Indah', 'Joko', 'Kartika', 'Luthfi', 'Maya',
  'Naufal', 'Nabila', 'Oki', 'Putri', 'Rafi', 'Rina', 'Satria', 'Tania',
  'Wildan', 'Yolanda', 'Zaki', 'Zahra', 'Rizky', 'Syifa', 'Tegar', 'Vina'
];

const LAST_NAMES = [
  'Pratama', 'Safitri', 'Kurniawan', 'Ramadhani', 'Saputra', 'Lestari', 'Hidayat', 'Wulandari',
  'Nugroho', 'Kusuma', 'Santoso', 'Utami', 'Firmansyah', 'Az-Zahra', 'Maulana', 'Anggraini',
  'Setiawan', 'Maharani', 'Wijaya', 'Aulia', 'Subekti', 'Kusumaningrum', 'Hartono', 'Puspitasari'
];

export function generateSampleStudents(): Student[] {
  // Sesuai instruksi: Data siswa bawaan dikosongkan agar dimulai dalam keadaan bersih
  return [];
}

export function generateSampleGrades(_students: Student[], _subjects: Subject[]): { grades: Grade[], exams: SchoolExam[] } {
  // Sesuai instruksi: Data nilai bawaan dikosongkan
  return { grades: [], exams: [] };
}

// Storage Manager
export class StorageService {
  private static instance: StorageService;
  private syncTimeout: any = null;

  private constructor() {
    this.initIfEmpty();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public scheduleServerSync(): void {
    if (typeof window === 'undefined') return;
    if (this.syncTimeout) clearTimeout(this.syncTimeout);
    this.syncTimeout = setTimeout(() => {
      this.syncToServer();
    }, 400);
  }

  public async syncToServer(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const payload = {
        students: this.getStudents(),
        grades: this.getGrades(),
        schoolExams: this.getSchoolExams(),
        settings: this.getSettings(),
        rombels: this.getRombels(),
        users: this.getUsers(),
        subjects: this.getSubjects(),
      };

      const res = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      return res.ok;
    } catch (err) {
      // Server might be starting or running in client-only preview
      return false;
    }
  }

  public async syncFromServer(): Promise<{
    students: Student[];
    grades: Grade[];
    schoolExams: SchoolExam[];
    settings: SchoolSettings;
    rombels: RombelInfo[];
    users: User[];
    subjects: Subject[];
  } | null> {
    if (typeof window === 'undefined') return null;
    try {
      const res = await fetch('/api/database');
      if (!res.ok) return null;
      const data = await res.json();
      if (data && typeof data === 'object') {
        // Filter out any legacy dummy sample students
        const cleanStudents: Student[] = Array.isArray(data.students)
          ? data.students.filter(
              (s: Student) =>
                !s.nama?.includes('(Contoh)') &&
                !s.id?.startsWith('std_6a_') &&
                !s.id?.startsWith('std_6b_')
            )
          : [];

        const validIds = new Set(cleanStudents.map((s) => s.id));
        const cleanGrades: Grade[] = Array.isArray(data.grades)
          ? data.grades.filter((g: Grade) => validIds.has(g.student_id))
          : [];
        const cleanExams: SchoolExam[] = Array.isArray(data.schoolExams)
          ? data.schoolExams.filter((e: SchoolExam) => validIds.has(e.student_id))
          : [];

        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(cleanStudents));
        localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(cleanGrades));
        localStorage.setItem(STORAGE_KEYS.SCHOOL_EXAM, JSON.stringify(cleanExams));
        if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
        if (data.rombels) localStorage.setItem(STORAGE_KEYS.ROMBELS, JSON.stringify(data.rombels));
        if (data.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
        if (data.subjects) localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(data.subjects));

        return {
          students: cleanStudents,
          grades: cleanGrades,
          schoolExams: cleanExams,
          settings: data.settings || this.getSettings(),
          rombels: data.rombels || this.getRombels(),
          users: data.users || this.getUsers(),
          subjects: data.subjects || this.getSubjects(),
        };
      }
    } catch {
      // Ignored if offline
    }
    return null;
  }

  public initIfEmpty(forceReset: boolean = false): void {
    if (typeof window === 'undefined') return;

    const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!existingUsers || forceReset) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      localStorage.setItem(STORAGE_KEYS.ROMBELS, JSON.stringify(INITIAL_ROMBELS));
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(INITIAL_SUBJECTS));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));

      // Dikosongkan sesuai permintaan
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.SCHOOL_EXAM, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
    } else {
      // Periksa apakah data lama di browser masih menyimpan data dummy "(Contoh)"
      const rawStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (rawStudents) {
        try {
          const list: Student[] = JSON.parse(rawStudents);
          const hasDummy = list.some(
            (s) => s.nama?.includes('(Contoh)') || s.id?.startsWith('std_6a_') || s.id?.startsWith('std_6b_')
          );
          if (hasDummy) {
            const cleanStudents = list.filter(
              (s) => !s.nama?.includes('(Contoh)') && !s.id?.startsWith('std_6a_') && !s.id?.startsWith('std_6b_')
            );
            localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(cleanStudents));
            if (cleanStudents.length === 0) {
              localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify([]));
              localStorage.setItem(STORAGE_KEYS.SCHOOL_EXAM, JSON.stringify([]));
            } else {
              const validIds = new Set(cleanStudents.map((s) => s.id));
              const rawG = localStorage.getItem(STORAGE_KEYS.GRADES);
              if (rawG) {
                const gList: Grade[] = JSON.parse(rawG);
                localStorage.setItem(
                  STORAGE_KEYS.GRADES,
                  JSON.stringify(gList.filter((g) => validIds.has(g.student_id)))
                );
              }
              const rawE = localStorage.getItem(STORAGE_KEYS.SCHOOL_EXAM);
              if (rawE) {
                const eList: SchoolExam[] = JSON.parse(rawE);
                localStorage.setItem(
                  STORAGE_KEYS.SCHOOL_EXAM,
                  JSON.stringify(eList.filter((e) => validIds.has(e.student_id)))
                );
              }
            }
          }
        } catch {
          // ignore
        }
      }
    }
  }

  // Users (Strictly Admin + Guru Kelas 6A, 6B, 6C, 6D)
  public getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    let list: User[] = raw ? JSON.parse(raw) : INITIAL_USERS;
    const allowedRombels = ['6A', '6B', '6C', '6D'];
    const legacyDummies = ['Siti Rahmawati', 'Bambang Sudarsono', 'Dewi Lestari', 'Ahmad Fauzi', 'Administrator Kurikulum'];
    let needsSave = false;

    // Keep only Administrator and teachers assigned to 6A, 6B, 6C, 6D
    let filtered = list.filter(
      (u) => u.role === 'admin' || (u.rombel && allowedRombels.includes(u.rombel))
    );

    // Replace any legacy dummy users with the permanent patented users
    filtered = filtered.map((u) => {
      const isLegacy = legacyDummies.some((name) => u.nama?.includes(name));
      const patented = INITIAL_USERS.find(
        (initU) => (u.role === 'admin' && initU.role === 'admin') || (u.rombel && initU.rombel === u.rombel)
      );
      if (isLegacy && patented) {
        needsSave = true;
        return { ...patented, password: u.password || patented.password };
      }
      return u;
    });

    // Ensure all initial users are present
    INITIAL_USERS.forEach((initU) => {
      const idx = filtered.findIndex((u) => u.id === initU.id || (u.role === 'guru' && u.rombel === initU.rombel));
      if (idx === -1) {
        filtered.push(initU);
        needsSave = true;
      }
    });

    if (needsSave || (raw && filtered.length !== list.length)) {
      this.saveUsers(filtered);
    }
    return filtered;
  }

  public saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.scheduleServerSync();
  }

  // Current User Session
  public getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
      const user: User = JSON.parse(raw);
      const allowedRombels = ['6A', '6B', '6C', '6D'];
      if (user.role !== 'admin' && (!user.rombel || !allowedRombels.includes(user.rombel))) {
        // Obsolete user logged in; reset to admin
        const adminUser = this.getUsers().find((u) => u.role === 'admin') || INITIAL_USERS[0];
        this.setCurrentUser(adminUser);
        return adminUser;
      }
      // If active user still has legacy dummy name, refresh to patented user
      if (
        user.nama?.includes('Siti Rahmawati') ||
        user.nama?.includes('Bambang Sudarsono') ||
        user.nama?.includes('Dewi Lestari') ||
        user.nama?.includes('Ahmad Fauzi') ||
        user.nama?.includes('Administrator Kurikulum')
      ) {
        const freshUser = this.getUsers().find((u) => u.id === user.id || u.username === user.username);
        if (freshUser) {
          this.setCurrentUser(freshUser);
          return freshUser;
        }
      }
      return user;
    } catch {
      return null;
    }
  }

  public setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // Students (Strictly Kelas 6: 6A, 6B, 6C, 6D)
  public getStudents(): Student[] {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) return [];
    try {
      const list: Student[] = JSON.parse(raw);
      const allowedRombels = ['6A', '6B', '6C', '6D'];
      const filtered = list.filter(
        (s) =>
          allowedRombels.includes(s.rombel) &&
          !s.nama?.includes('(Contoh)') &&
          !s.id?.startsWith('std_6a_') &&
          !s.id?.startsWith('std_6b_')
      );
      if (filtered.length !== list.length) {
        this.saveStudents(filtered);
      }
      return filtered;
    } catch {
      return [];
    }
  }

  public saveStudents(students: Student[]): void {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    this.scheduleServerSync();
  }

  // Rombels (Strictly 6A, 6B, 6C, 6D)
  public getRombels(): RombelInfo[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ROMBELS);
    let list: RombelInfo[] = raw ? JSON.parse(raw) : INITIAL_ROMBELS;
    const allowedNames = ['6A', '6B', '6C', '6D'];
    const legacyDummies = ['Siti Rahmawati', 'Bambang Sudarsono', 'Dewi Lestari', 'Ahmad Fauzi'];
    let needsSave = false;

    let filtered = list.filter((r) => allowedNames.includes(r.nama));

    // Replace any legacy dummy teachers with permanent patented teachers
    filtered = filtered.map((r) => {
      const isLegacyDummy = legacyDummies.some((name) => r.wali_kelas?.includes(name));
      const patented = INITIAL_ROMBELS.find((initR) => initR.nama === r.nama);
      if (isLegacyDummy && patented) {
        needsSave = true;
        return { ...patented };
      }
      return r;
    });

    // Ensure all 4 rombels exist
    INITIAL_ROMBELS.forEach((initR) => {
      if (!filtered.some((r) => r.nama === initR.nama)) {
        filtered.push(initR);
        needsSave = true;
      }
    });

    filtered.sort((a, b) => a.nama.localeCompare(b.nama));

    if (needsSave || (raw && filtered.length !== list.length)) {
      this.saveRombels(filtered);
    }
    return filtered;
  }

  public saveRombels(rombels: RombelInfo[]): void {
    localStorage.setItem(STORAGE_KEYS.ROMBELS, JSON.stringify(rombels));
    this.scheduleServerSync();
  }

  // Subjects
  public getSubjects(): Subject[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return raw ? JSON.parse(raw) : INITIAL_SUBJECTS;
  }

  public saveSubjects(subjects: Subject[]): void {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
    this.scheduleServerSync();
  }

  // Grades
  public getGrades(): Grade[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GRADES);
    return raw ? JSON.parse(raw) : [];
  }

  public saveGrades(grades: Grade[]): void {
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
    this.scheduleServerSync();
  }

  public upsertGrade(grade: Grade): void {
    const all = this.getGrades();
    const existingIndex = all.findIndex(
      (g) =>
        g.student_id === grade.student_id &&
        g.subject_id === grade.subject_id &&
        g.semester === grade.semester
    );

    if (existingIndex >= 0) {
      all[existingIndex] = { ...all[existingIndex], ...grade, updated_at: new Date().toISOString() };
    } else {
      all.push({ ...grade, updated_at: new Date().toISOString() });
    }
    this.saveGrades(all);
  }

  // School Exam
  public getSchoolExams(): SchoolExam[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHOOL_EXAM);
    return raw ? JSON.parse(raw) : [];
  }

  public saveSchoolExams(exams: SchoolExam[]): void {
    localStorage.setItem(STORAGE_KEYS.SCHOOL_EXAM, JSON.stringify(exams));
    this.scheduleServerSync();
  }

  public upsertSchoolExam(exam: SchoolExam): void {
    const all = this.getSchoolExams();
    const existingIndex = all.findIndex(
      (e) => e.student_id === exam.student_id && e.subject_id === exam.subject_id
    );

    if (existingIndex >= 0) {
      all[existingIndex] = { ...all[existingIndex], ...exam, updated_at: new Date().toISOString() };
    } else {
      all.push({ ...exam, updated_at: new Date().toISOString() });
    }
    this.saveSchoolExams(all);
  }

  // Settings
  public getSettings(): SchoolSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const settings: SchoolSettings = raw ? JSON.parse(raw) : INITIAL_SETTINGS;
    if (!settings.logo_url) {
      settings.logo_url = 'https://i.ibb.co.com/rRhHc2PD/logo-bakot-01.png';
      this.saveSettings(settings);
    }
    // Update kepala sekolah if still old default or empty
    if (
      settings.nama_kepsek === 'H. Endang Suryana, M.Pd.' ||
      settings.nama_kepala_sekolah === 'H. Endang Suryana, M.Pd.' ||
      !settings.nama_kepsek
    ) {
      settings.nama_kepsek = 'Lailatul Fajriah, S.Pd.SD';
      settings.nip_kepsek = '197808202008012005';
      settings.nama_kepala_sekolah = 'Lailatul Fajriah, S.Pd.SD';
      settings.nip_kepala_sekolah = '197808202008012005';
      this.saveSettings(settings);
    }
    return settings;
  }

  public saveSettings(settings: SchoolSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.scheduleServerSync();
  }

  // Full Database Backup & Restore
  public exportFullBackup(): string {
    const backup = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      school: 'SDN BABELAN KOTA 01',
      academicYear: '2026/2027',
      data: {
        users: this.getUsers(),
        rombels: this.getRombels(),
        subjects: this.getSubjects(),
        settings: this.getSettings(),
        students: this.getStudents(),
        grades: this.getGrades(),
        schoolExams: this.getSchoolExams(),
      },
    };
    localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, backup.exportDate);
    return JSON.stringify(backup, null, 2);
  }

  public importFullBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data || !parsed.data.students || !parsed.data.settings) {
        return { success: false, message: 'Format data backup tidak valid!' };
      }
      if (parsed.data.users) this.saveUsers(parsed.data.users);
      if (parsed.data.rombels) this.saveRombels(parsed.data.rombels);
      if (parsed.data.subjects) this.saveSubjects(parsed.data.subjects);
      if (parsed.data.settings) this.saveSettings(parsed.data.settings);
      if (parsed.data.students) this.saveStudents(parsed.data.students);
      if (parsed.data.grades) this.saveGrades(parsed.data.grades);
      if (parsed.data.schoolExams) this.saveSchoolExams(parsed.data.schoolExams);

      localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
      return { success: true, message: 'Data cadangan berhasil dipulihkan secara menyeluruh!' };
    } catch (err: any) {
      return { success: false, message: 'Gagal memproses file cadangan: ' + err.message };
    }
  }

  public getLastBackupDate(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_BACKUP);
  }

  public resetAllData(): void {
    this.initIfEmpty(true);
    this.scheduleServerSync();
    try {
      fetch('/api/reset-database', { method: 'POST' }).catch(() => {});
    } catch {}
  }

  public static exportBackupJson(): string {
    return StorageService.getInstance().exportFullBackup();
  }

  public static importBackupJson(json: string): boolean {
    return StorageService.getInstance().importFullBackup(json).success;
  }

  public static resetToDefaults(): void {
    StorageService.getInstance().resetAllData();
  }
}

export const storage = StorageService.getInstance();
