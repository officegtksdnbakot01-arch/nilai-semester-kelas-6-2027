import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import * as XLSX from 'xlsx-js-style';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const EXCEL_FILE = path.join(DATA_DIR, 'Master_Data_Nilai_SDNBakor01.xlsx');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial settings & constants (Empty students & grades by default)
const INITIAL_SETTINGS = {
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

const INITIAL_ROMBELS = [
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

const INITIAL_USERS = [
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

const INITIAL_SUBJECTS = [
  { id: 'subj_pabp', kode: 'PABP', nama_mapel: 'Pendidikan Agama dan Budi Pekerti', kategori: 'Wajib', fase: 'C', kelas: ['4', '5', '6'], urutan: 1, aktif: true, kktp: 75 },
  { id: 'subj_pp', kode: 'PP', nama_mapel: 'Pendidikan Pancasila', kategori: 'Wajib', fase: 'C', kelas: ['4', '5', '6'], urutan: 2, aktif: true, kktp: 75 },
  { id: 'subj_bind', kode: 'BIND', nama_mapel: 'Bahasa Indonesia', kategori: 'Wajib', fase: 'C', kelas: ['4', '5', '6'], urutan: 3, aktif: true, kktp: 75 },
  { id: 'subj_mtk', kode: 'MTK', nama_mapel: 'Matematika', kategori: 'Wajib', fase: 'C', kelas: ['4', '5', '6'], urutan: 4, aktif: true, kktp: 75 },
  { id: 'subj_ipas', kode: 'IPAS', nama_mapel: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)', kategori: 'Wajib', fase: 'C', kelas: ['4', '5', '6'], urutan: 5, aktif: true, kktp: 75 },
  { id: 'subj_pjok', kode: 'PJOK', nama_mapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', kategori: 'Wajib', fase: 'C', kelas: ['4', '5', '6'], urutan: 6, aktif: true, kktp: 75 },
  { id: 'subj_seni', kode: 'SENI', nama_mapel: 'Seni dan Budaya (Seni Rupa)', kategori: 'Wajib', fase: 'C', kelas: ['4', '5', '6'], urutan: 7, aktif: true, kktp: 75 },
  { id: 'subj_bing', kode: 'BING', nama_mapel: 'Bahasa Inggris', kategori: 'Pilihan', fase: 'C', kelas: ['4', '5', '6'], urutan: 8, aktif: true, kktp: 75 },
  { id: 'subj_mulok', kode: 'MULOK', nama_mapel: 'Muatan Lokal (Bahasa Sunda)', kategori: 'Muatan Lokal', fase: 'C', kelas: ['4', '5', '6'], urutan: 9, aktif: true, kktp: 75 },
];

interface DatabaseModel {
  students: any[];
  grades: any[];
  schoolExams: any[];
  settings: any;
  rombels: any[];
  users: any[];
  subjects: any[];
  lastUpdated: string;
}

function getInitialDatabase(): DatabaseModel {
  return {
    students: [],
    grades: [],
    schoolExams: [],
    settings: INITIAL_SETTINGS,
    rombels: INITIAL_ROMBELS,
    users: INITIAL_USERS,
    subjects: INITIAL_SUBJECTS,
    lastUpdated: new Date().toISOString(),
  };
}

function loadDatabase(): DatabaseModel {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      // Clean any dummy / sample students if present
      if (Array.isArray(parsed.students)) {
        const cleanedStudents = parsed.students.filter(
          (s: any) => !s.nama?.includes('(Contoh)') && !s.id?.startsWith('std_6a_') && !s.id?.startsWith('std_6b_')
        );
        if (cleanedStudents.length !== parsed.students.length) {
          parsed.students = cleanedStudents;
          const validIds = new Set(cleanedStudents.map((s: any) => s.id));
          if (Array.isArray(parsed.grades)) {
            parsed.grades = parsed.grades.filter((g: any) => validIds.has(g.student_id));
          }
          if (Array.isArray(parsed.schoolExams)) {
            parsed.schoolExams = parsed.schoolExams.filter((e: any) => validIds.has(e.student_id));
          }
          fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
        }
      }

      // Ensure rombels & users are using the permanent patented teachers
      const legacyDummies = ['Siti Rahmawati', 'Bambang Sudarsono', 'Dewi Lestari', 'Ahmad Fauzi', 'Administrator Kurikulum'];
      let dbUpdated = false;

      if (Array.isArray(parsed.rombels)) {
        parsed.rombels = parsed.rombels.map((r: any) => {
          const isLegacy = legacyDummies.some((d) => r.wali_kelas?.includes(d));
          const patented = INITIAL_ROMBELS.find((ir) => ir.nama === r.nama);
          if (isLegacy && patented) {
            dbUpdated = true;
            return { ...patented };
          }
          return r;
        });
      }

      if (Array.isArray(parsed.users)) {
        parsed.users = parsed.users.map((u: any) => {
          const isLegacy = legacyDummies.some((d) => u.nama?.includes(d));
          const patented = INITIAL_USERS.find(
            (iu) => (u.role === 'admin' && iu.role === 'admin') || (u.rombel && iu.rombel === u.rombel)
          );
          if (isLegacy && patented) {
            dbUpdated = true;
            return { ...patented, password: u.password || patented.password };
          }
          return u;
        });
      }

      if (dbUpdated) {
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
      }
      return {
        ...getInitialDatabase(),
        ...parsed,
      };
    }
  } catch (err) {
    console.error('Failed to read database file, initializing defaults:', err);
  }

  const initial = getInitialDatabase();
  fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  return initial;
}

function saveDatabase(data: Partial<DatabaseModel>): DatabaseModel {
  const current = loadDatabase();
  const updated: DatabaseModel = {
    ...current,
    ...data,
    lastUpdated: new Date().toISOString(),
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  try {
    generateMasterExcel(updated);
  } catch (err) {
    console.error('Error generating master Excel on server:', err);
  }
  return updated;
}

// Generate styled master Excel file with all sheets
function generateMasterExcel(db: DatabaseModel): void {
  const wb = XLSX.utils.book_new();

  // Common Header Style
  const headerStyle = {
    fill: { fgColor: { rgb: '1E3A8A' } },
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11, name: 'Calibri' },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top: { style: 'medium', color: { rgb: '0F172A' } },
      bottom: { style: 'medium', color: { rgb: '0F172A' } },
      left: { style: 'thin', color: { rgb: '93C5FD' } },
      right: { style: 'thin', color: { rgb: '93C5FD' } },
    },
  };

  const cellStyle = {
    font: { sz: 10, color: { rgb: '1E293B' }, name: 'Calibri' },
    border: {
      top: { style: 'thin', color: { rgb: 'CBD5E1' } },
      bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
      left: { style: 'thin', color: { rgb: 'CBD5E1' } },
      right: { style: 'thin', color: { rgb: 'CBD5E1' } },
    },
  };

  // Sheet 1: Data Siswa
  const studentHeaders = ['No', 'NIS', 'NISN', 'Nama Siswa', 'L/P', 'Tempat Lahir', 'Tanggal Lahir', 'Nama Orang Tua', 'Kelas', 'Rombel', 'Status', 'Alamat'];
  const studentRows: any[][] = [studentHeaders];
  db.students.forEach((s, idx) => {
    studentRows.push([
      idx + 1,
      s.nis || '',
      s.nisn || '',
      s.nama || '',
      s.jenis_kelamin || '',
      s.tempat_lahir || '',
      s.tanggal_lahir || '',
      s.orang_tua || '',
      s.kelas || '6',
      s.rombel || '',
      s.status || 'Aktif',
      s.alamat || '',
    ]);
  });
  const wsStudents = XLSX.utils.aoa_to_sheet(studentRows);
  for (let c = 0; c < studentHeaders.length; c++) {
    const ref = XLSX.utils.encode_cell({ r: 0, c });
    if (wsStudents[ref]) wsStudents[ref].s = headerStyle;
  }
  for (let r = 1; r < studentRows.length; r++) {
    for (let c = 0; c < studentHeaders.length; c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (wsStudents[ref]) wsStudents[ref].s = cellStyle;
    }
  }
  XLSX.utils.book_append_sheet(wb, wsStudents, 'Data Siswa');

  // Sheet 2: Nilai Semester Rapor
  const gradeHeaders = ['No', 'NISN', 'Nama Siswa', 'Rombel', 'Semester', 'Kelas', 'Kode Mapel', 'Nama Mapel', 'Nilai Akhir', 'Predikat', 'Catatan'];
  const gradeRows: any[][] = [gradeHeaders];
  const stdMap = new Map(db.students.map((s) => [s.id, s]));
  const subMap = new Map(db.subjects.map((s) => [s.id, s]));

  db.grades.forEach((g, idx) => {
    const student = stdMap.get(g.student_id);
    const subject = subMap.get(g.subject_id);
    gradeRows.push([
      idx + 1,
      student?.nisn || '',
      student?.nama || '',
      g.rombel || student?.rombel || '',
      g.semester || '',
      g.kelas || '6',
      subject?.kode || '',
      subject?.nama_mapel || '',
      g.nilai_akhir !== null && g.nilai_akhir !== undefined ? g.nilai_akhir : '',
      g.predikat || '',
      g.catatan || '',
    ]);
  });
  const wsGrades = XLSX.utils.aoa_to_sheet(gradeRows);
  for (let c = 0; c < gradeHeaders.length; c++) {
    const ref = XLSX.utils.encode_cell({ r: 0, c });
    if (wsGrades[ref]) wsGrades[ref].s = headerStyle;
  }
  for (let r = 1; r < gradeRows.length; r++) {
    for (let c = 0; c < gradeHeaders.length; c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (wsGrades[ref]) wsGrades[ref].s = cellStyle;
    }
  }
  XLSX.utils.book_append_sheet(wb, wsGrades, 'Nilai Semester Rapor');

  // Sheet 3: Nilai Ujian Sekolah
  const examHeaders = ['No', 'NISN', 'Nama Siswa', 'Rombel', 'Kode Mapel', 'Nama Mapel', 'Nilai Praktik', 'Nilai Tulis', 'Nilai Akhir US', 'Catatan'];
  const examRows: any[][] = [examHeaders];
  db.schoolExams.forEach((e, idx) => {
    const student = stdMap.get(e.student_id);
    const subject = subMap.get(e.subject_id);
    examRows.push([
      idx + 1,
      student?.nisn || '',
      student?.nama || '',
      student?.rombel || '',
      subject?.kode || '',
      subject?.nama_mapel || '',
      e.nilai_praktik !== null && e.nilai_praktik !== undefined ? e.nilai_praktik : '',
      e.nilai_tulis !== null && e.nilai_tulis !== undefined ? e.nilai_tulis : '',
      e.nilai !== null && e.nilai !== undefined ? e.nilai : '',
      e.catatan || '',
    ]);
  });
  const wsExams = XLSX.utils.aoa_to_sheet(examRows);
  for (let c = 0; c < examHeaders.length; c++) {
    const ref = XLSX.utils.encode_cell({ r: 0, c });
    if (wsExams[ref]) wsExams[ref].s = headerStyle;
  }
  for (let r = 1; r < examRows.length; r++) {
    for (let c = 0; c < examHeaders.length; c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (wsExams[ref]) wsExams[ref].s = cellStyle;
    }
  }
  XLSX.utils.book_append_sheet(wb, wsExams, 'Nilai Ujian Sekolah');

  // Write file to disk
  XLSX.writeFile(wb, EXCEL_FILE);
}

async function startServer() {
  const app = express();

  // Parse JSON bodies up to 50MB
  app.use(express.json({ limit: '50mb' }));

  // Initialize DB & Master Excel on boot
  const db = loadDatabase();
  try {
    generateMasterExcel(db);
  } catch (e) {
    console.error('Initial master Excel generation error:', e);
  }

  // ==========================================
  // API ROUTES (Always placed FIRST)
  // ==========================================

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    const current = loadDatabase();
    res.json({
      status: 'ok',
      studentsCount: current.students.length,
      gradesCount: current.grades.length,
      examsCount: current.schoolExams.length,
      lastUpdated: current.lastUpdated,
      serverTime: new Date().toISOString(),
    });
  });

  // Get full database
  app.get('/api/database', (req: Request, res: Response) => {
    try {
      const current = loadDatabase();
      res.json(current);
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal membaca database: ' + err.message });
    }
  });

  // Save / Update full or partial database
  app.post('/api/database', (req: Request, res: Response) => {
    try {
      const body = req.body;
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'Payload tidak valid.' });
      }

      const updated = saveDatabase(body);
      res.json({
        success: true,
        message: 'Database berhasil diperbarui dan disinkronkan secara permanen.',
        count: {
          students: updated.students.length,
          grades: updated.grades.length,
          schoolExams: updated.schoolExams.length,
        },
        lastUpdated: updated.lastUpdated,
      });
    } catch (err: any) {
      console.error('Error saving to server database:', err);
      res.status(500).json({ error: 'Gagal menyimpan database: ' + err.message });
    }
  });

  // Download Server Master Excel File
  app.get('/api/download-master-excel', (req: Request, res: Response) => {
    try {
      const current = loadDatabase();
      generateMasterExcel(current);

      if (!fs.existsSync(EXCEL_FILE)) {
        return res.status(404).json({ error: 'Berkas master Excel belum tersedia.' });
      }

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `Master_Data_Nilai_SDN_Babelan_Kota_01_${dateStr}.xlsx`;
      res.download(EXCEL_FILE, filename);
    } catch (err: any) {
      console.error('Download master Excel error:', err);
      res.status(500).json({ error: 'Gagal mengunduh berkas Excel: ' + err.message });
    }
  });

  // Reset database to initial empty state
  app.post('/api/reset-database', (req: Request, res: Response) => {
    try {
      const initial = getInitialDatabase();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      generateMasterExcel(initial);
      res.json({ success: true, message: 'Database telah dikosongkan.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal mereset database: ' + err.message });
    }
  });

  // ==========================================
  // VITE / STATIC MIDDLEWARE (SPA Handling)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server SDN Babelan Kota 01 running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
