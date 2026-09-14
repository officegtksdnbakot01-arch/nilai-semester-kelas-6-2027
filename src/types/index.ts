export type UserRole = 'admin' | 'guru';

export interface User {
  id: string;
  nama: string;
  username: string;
  password?: string;
  role: UserRole;
  rombel?: string; // e.g. "6A", "6B", undefined for admin
  nip?: string;
}

export type Gender = 'L' | 'P';
export type StudentStatus = 'Aktif' | 'Mutasi' | 'Lulus' | 'Non-Aktif';

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  nama: string;
  jenis_kelamin: Gender;
  tempat_lahir: string;
  tanggal_lahir: string; // YYYY-MM-DD
  orang_tua: string;
  kelas: '4' | '5' | '6';
  rombel: string; // "4A", "4B", "5A", "6A", etc.
  status: StudentStatus;
  alamat?: string;
}

export interface Subject {
  id: string;
  kode: string;
  nama_mapel: string;
  kategori: string; // "Wajib", "Pilihan", "Muatan Lokal"
  fase: 'B' | 'C'; // Fase B = Kelas 3-4, Fase C = Kelas 5-6
  kelas: ('4' | '5' | '6')[];
  urutan: number;
  aktif: boolean;
  kktp?: number; // Kriteria Ketercapaian Tujuan Pembelajaran (default 75)
}

export type SemesterCode = 
  | 'Smt1_Kls4'
  | 'Smt2_Kls4'
  | 'Smt1_Kls5'
  | 'Smt2_Kls5'
  | 'Smt1_Kls6'
  | 'Smt2_Kls6';

export interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  kelas: '4' | '5' | '6';
  rombel: string;
  semester: SemesterCode;
  tahun_ajaran: string; // "2026/2027"
  nilai_akhir: number | null; // Nilai Rapor / Nilai Semester tunggal (0-100)
  nilai_praktik?: number | null; // Opsional / arsip lama (tidak digunakan untuk semester)
  nilai_tulis?: number | null; // Opsional / arsip lama (tidak digunakan untuk semester)
  predikat?: 'A' | 'B' | 'C' | 'D' | '-';
  catatan?: string;
  updated_at?: string;
}

export interface SchoolExam {
  id: string;
  student_id: string;
  subject_id: string;
  nilai_praktik?: number | null; // Digunakan khusus Ujian Sekolah (US)
  nilai_tulis?: number | null; // Digunakan khusus Ujian Sekolah (US)
  nilai: number | null; // Nilai Akhir Ujian Sekolah
  tahun_ajaran: string;
  catatan?: string;
  updated_at?: string;
}

export interface SchoolSettings {
  id: string;
  nama_sekolah: string;
  npsn: string;
  nss?: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  alamat_sekolah: string;
  tahun_ajaran: string;
  semester_aktif: SemesterCode;
  bobot_praktik: number; // percentage, e.g. 50 or 40
  bobot_tulis: number; // percentage, e.g. 50 or 60
  kktp_default: number; // default 75
  nama_kepsek: string;
  nip_kepsek: string;
  nama_kepala_sekolah?: string;
  nip_kepala_sekolah?: string;
  kota_tanda_tangan: string;
  tanggal_rapor: string;
  logo_url?: string;
  kop_skl_url?: string;
}

export interface RombelInfo {
  id: string;
  nama: string; // "4A", "4B", ..., "6D"
  kelas: '4' | '5' | '6';
  wali_kelas: string;
  nip_wali_kelas?: string;
  nip_wali?: string;
  kapasitas: number;
  ruangan?: string;
}

export interface ExcelStudentRow {
  No?: number | string;
  NIS: string | number;
  NISN: string | number;
  'Nama Siswa': string;
  'L/P': string;
  'Tempat Lahir'?: string;
  'Tanggal Lahir'?: string;
  'Nama Orang Tua'?: string;
  Kelas: string | number;
  Rombel: string;
}

export interface ExcelGradeRow {
  No?: number | string;
  NISN: string | number;
  'Nama Siswa': string;
  Rombel: string;
  'Mata Pelajaran': string;
  Semester: string;
  'Nilai Rapor': number | string;
  Predikat?: string;
  'Status KKTP'?: string;
  // Backward compatibility fields
  Kelas?: string | number;
  'Nilai Akhir'?: number | string;
  Nilai?: number | string;
  'Nilai Praktik'?: number | string;
  'Nilai Tulis'?: number | string;
}

export interface GradeImportPreview {
  rawRow: any;
  rowNumber: number;
  nisn: string;
  nama: string;
  kelas: '4' | '5' | '6';
  rombel: string;
  mapel: string;
  subject_id?: string;
  semester: SemesterCode;
  nilai_akhir: number | null;
  catatan?: string;
  isValid: boolean;
  validationError?: string;
  studentFound: boolean;
  subjectFound: boolean;
}
