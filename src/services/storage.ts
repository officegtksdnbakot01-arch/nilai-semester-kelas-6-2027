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
  // Hanya Kelas 6: 6A, 6B, 6C, 6D
  { id: 'rombel_6a', nama: '6A', kelas: '6', wali_kelas: 'Siti Rahmawati, S.Pd.', nip_wali_kelas: '19790415 200501 2 008', kapasitas: 32, ruangan: 'Gedung C R.01' },
  { id: 'rombel_6b', nama: '6B', kelas: '6', wali_kelas: 'Bambang Sudarsono, S.Pd.SD', nip_wali_kelas: '19810822 200701 1 010', kapasitas: 32, ruangan: 'Gedung C R.02' },
  { id: 'rombel_6c', nama: '6C', kelas: '6', wali_kelas: 'Dewi Lestari, S.Pd.', nip_wali_kelas: '19831203 200903 2 007', kapasitas: 32, ruangan: 'Gedung C R.03' },
  { id: 'rombel_6d', nama: '6D', kelas: '6', wali_kelas: 'Ahmad Fauzi, S.Pd.I', nip_wali_kelas: '19860517 201101 1 009', kapasitas: 32, ruangan: 'Gedung C R.04' },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin',
    nama: 'Administrator Kurikulum & Penilaian',
    username: 'admin',
    password: 'password123',
    role: 'admin',
    nip: '19750912 200003 1 002',
  },
  {
    id: 'user_guru_6a',
    nama: 'Siti Rahmawati, S.Pd. (Guru Kelas 6A)',
    username: 'guru6a',
    password: 'password123',
    role: 'guru',
    rombel: '6A',
    nip: '19790415 200501 2 008',
  },
  {
    id: 'user_guru_6b',
    nama: 'Bambang Sudarsono, S.Pd.SD (Guru Kelas 6B)',
    username: 'guru6b',
    password: 'password123',
    role: 'guru',
    rombel: '6B',
    nip: '19810822 200701 1 010',
  },
  {
    id: 'user_guru_6c',
    nama: 'Dewi Lestari, S.Pd. (Guru Kelas 6C)',
    username: 'guru6c',
    password: 'password123',
    role: 'guru',
    rombel: '6C',
    nip: '19831203 200903 2 007',
  },
  {
    id: 'user_guru_6d',
    nama: 'Ahmad Fauzi, S.Pd.I (Guru Kelas 6D)',
    username: 'guru6d',
    password: 'password123',
    role: 'guru',
    rombel: '6D',
    nip: '19860517 201101 1 009',
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
  const students: Student[] = [];
  const rombels = ['6A', '6B', '6C', '6D'];
  let globalIndex = 1;

  rombels.forEach((rombel) => {
    const kelas = '6';
    for (let i = 1; i <= 32; i++) {
      const isFemale = i % 2 === 0;
      const firstName = FIRST_NAMES[(i * 3 + rombel.charCodeAt(1)) % FIRST_NAMES.length];
      const lastName = LAST_NAMES[(i * 5 + rombel.charCodeAt(1)) % LAST_NAMES.length];
      const nama = `${firstName} ${lastName} (Contoh)`;
      const nis = `212204${String(globalIndex).padStart(3, '0')}`;
      const nisn = `014${String(globalIndex).padStart(7, '0')}`;
      const day = String((i % 28) + 1).padStart(2, '0');
      const month = String((i % 12) + 1).padStart(2, '0');
      
      students.push({
        id: `std_${rombel.toLowerCase()}_${String(i).padStart(2, '0')}`,
        nis,
        nisn,
        nama,
        jenis_kelamin: isFemale ? 'P' : 'L',
        tempat_lahir: 'Bekasi',
        tanggal_lahir: `2014-${month}-${day}`,
        orang_tua: `Bpk. ${lastName} & Ibu`,
        kelas,
        rombel,
        status: 'Aktif',
        alamat: `Jl. Raya Babelan Kota RT 0${(i % 5) + 1}/RW 02, Kec. Babelan`,
      });
      globalIndex++;
    }
  });

  return students;
}

export function generateSampleGrades(students: Student[], subjects: Subject[]): { grades: Grade[], exams: SchoolExam[] } {
  const grades: Grade[] = [];
  const exams: SchoolExam[] = [];

  const semesters: { code: SemesterCode; kelas: '4' | '5' | '6' }[] = [
    { code: 'Smt1_Kls4', kelas: '4' },
    { code: 'Smt2_Kls4', kelas: '4' },
    { code: 'Smt1_Kls5', kelas: '5' },
    { code: 'Smt2_Kls5', kelas: '5' },
    { code: 'Smt1_Kls6', kelas: '6' },
    { code: 'Smt2_Kls6', kelas: '6' },
  ];

  // Seed sample grades for 6A & 6B students across history
  const class6Students = students.filter(s => s.kelas === '6');

  class6Students.forEach((std, sIndex) => {
    subjects.forEach((subj, subIndex) => {
      // Generate historical grades for Smt1_Kls4 up to Smt1_Kls6
      semesters.forEach((sem, semIdx) => {
        // Pseudo-random deterministic realistic score between 75 and 96
        const base = 78 + ((sIndex * 7 + subIndex * 11 + semIdx * 5) % 18);
        const pMod = ((sIndex + subIndex) % 5) - 2;
        const tMod = ((sIndex * 3 + subIndex) % 5) - 2;
        const praktik = Math.min(100, Math.max(70, base + pMod));
        const tulis = Math.min(100, Math.max(70, base + tMod));
        const akhir = Math.round((praktik + tulis) / 2);

        let predikat: 'A' | 'B' | 'C' | 'D' = 'B';
        if (akhir >= 90) predikat = 'A';
        else if (akhir >= 80) predikat = 'B';
        else if (akhir >= 70) predikat = 'C';
        else predikat = 'D';

        grades.push({
          id: `grd_${std.id}_${subj.id}_${sem.code}`,
          student_id: std.id,
          subject_id: subj.id,
          kelas: sem.kelas,
          rombel: std.rombel,
          semester: sem.code,
          tahun_ajaran: sem.kelas === '4' ? '2024/2025' : (sem.kelas === '5' ? '2025/2026' : '2026/2027'),
          nilai_praktik: praktik,
          nilai_tulis: tulis,
          nilai_akhir: akhir,
          predikat,
          catatan: akhir >= 85 ? 'Menunjukkan penguasaan capaian pembelajaran yang sangat baik.' : 'Menunjukkan capaian pembelajaran yang baik dan tuntas.',
          updated_at: new Date().toISOString(),
        });
      });

      // School Exam (Ujian Sekolah) for Class 6
      const usPraktik = 80 + ((sIndex * 3 + subIndex * 2) % 17);
      const usTulis = 79 + ((sIndex * 5 + subIndex * 3) % 18);
      const usAkhir = Math.round((usPraktik * 0.4) + (usTulis * 0.6));

      exams.push({
        id: `exam_${std.id}_${subj.id}`,
        student_id: std.id,
        subject_id: subj.id,
        nilai_praktik: usPraktik,
        nilai_tulis: usTulis,
        nilai: usAkhir,
        tahun_ajaran: '2026/2027',
        catatan: 'Lulus dengan kriteria ketercapaian memuaskan.',
        updated_at: new Date().toISOString(),
      });
    });
  });

  return { grades, exams };
}

// Storage Manager
export class StorageService {
  private static instance: StorageService;

  private constructor() {
    this.initIfEmpty();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public initIfEmpty(forceReset: boolean = false): void {
    if (typeof window === 'undefined') return;

    const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!existingUsers || forceReset) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      localStorage.setItem(STORAGE_KEYS.ROMBELS, JSON.stringify(INITIAL_ROMBELS));
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(INITIAL_SUBJECTS));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));

      const sampleStudents = generateSampleStudents();
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(sampleStudents));

      const { grades, exams } = generateSampleGrades(sampleStudents, INITIAL_SUBJECTS);
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
      localStorage.setItem(STORAGE_KEYS.SCHOOL_EXAM, JSON.stringify(exams));
      localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
    }
  }

  // Users (Strictly Admin + Guru Kelas 6A, 6B, 6C, 6D)
  public getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    let list: User[] = raw ? JSON.parse(raw) : INITIAL_USERS;
    const allowedRombels = ['6A', '6B', '6C', '6D'];
    
    // Keep only Administrator and teachers assigned to 6A, 6B, 6C, 6D
    let filtered = list.filter(
      (u) => u.role === 'admin' || (u.rombel && allowedRombels.includes(u.rombel))
    );

    // Ensure all initial users are present
    INITIAL_USERS.forEach((initU) => {
      const idx = filtered.findIndex((u) => u.id === initU.id || (u.role === 'guru' && u.rombel === initU.rombel));
      if (idx === -1) {
        filtered.push(initU);
      }
    });

    if (raw && filtered.length !== list.length) {
      this.saveUsers(filtered);
    }
    return filtered;
  }

  public saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
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
      const filtered = list.filter((s) => allowedRombels.includes(s.rombel));
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
  }

  // Rombels (Strictly 6A, 6B, 6C, 6D)
  public getRombels(): RombelInfo[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ROMBELS);
    let list: RombelInfo[] = raw ? JSON.parse(raw) : INITIAL_ROMBELS;
    const allowedNames = ['6A', '6B', '6C', '6D'];

    let filtered = list.filter((r) => allowedNames.includes(r.nama));

    // Ensure all 4 rombels exist
    INITIAL_ROMBELS.forEach((initR) => {
      if (!filtered.some((r) => r.nama === initR.nama)) {
        filtered.push(initR);
      }
    });

    filtered.sort((a, b) => a.nama.localeCompare(b.nama));

    if (raw && filtered.length !== list.length) {
      this.saveRombels(filtered);
    }
    return filtered;
  }

  public saveRombels(rombels: RombelInfo[]): void {
    localStorage.setItem(STORAGE_KEYS.ROMBELS, JSON.stringify(rombels));
  }

  // Subjects
  public getSubjects(): Subject[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return raw ? JSON.parse(raw) : INITIAL_SUBJECTS;
  }

  public saveSubjects(subjects: Subject[]): void {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }

  // Grades
  public getGrades(): Grade[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GRADES);
    return raw ? JSON.parse(raw) : [];
  }

  public saveGrades(grades: Grade[]): void {
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
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
