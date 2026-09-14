import * as XLSX from 'xlsx-js-style';
import { Student, Subject, Grade, SchoolExam, SchoolSettings, SemesterCode } from '../types';

export interface StudentImportPreview {
  rawRow: any;
  rowNumber: number;
  nis: string;
  nisn: string;
  nama: string;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir: string;
  tanggal_lahir: string;
  orang_tua: string;
  kelas: '4' | '5' | '6';
  rombel: string;
  isValid: boolean;
  validationError?: string;
  isDuplicateInDatabase: boolean;
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

export interface ImportResult<T = any> {
  success: boolean;
  data: T[];
  warnings: string[];
  errors: string[];
}

export interface GradeTemplateOptions {
  subject?: Subject;
  subjects?: Subject[];
  semester?: SemesterCode;
  rombel?: string;
  students?: Student[];
  includeStudents?: boolean;
}

// Styling definitions for clean, bordered, and colored Excel templates
const EXCEL_STYLES = {
  headerStudent: {
    fill: { fgColor: { rgb: '1E3A8A' } }, // Primary Navy Blue
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10, name: 'Calibri' },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top: { style: 'medium', color: { rgb: '0F172A' } },
      bottom: { style: 'medium', color: { rgb: '0F172A' } },
      left: { style: 'thin', color: { rgb: '93C5FD' } },
      right: { style: 'thin', color: { rgb: '93C5FD' } },
    },
  },
  headerGrade: {
    fill: { fgColor: { rgb: '047857' } }, // Emerald Green for Assessment
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10, name: 'Calibri' },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top: { style: 'medium', color: { rgb: '064E3B' } },
      bottom: { style: 'medium', color: { rgb: '064E3B' } },
      left: { style: 'thin', color: { rgb: '6EE7B7' } },
      right: { style: 'thin', color: { rgb: '6EE7B7' } },
    },
  },
  headerExport: {
    fill: { fgColor: { rgb: '1E293B' } }, // Slate 800
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10, name: 'Calibri' },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top: { style: 'medium', color: { rgb: '0F172A' } },
      bottom: { style: 'medium', color: { rgb: '0F172A' } },
      left: { style: 'thin', color: { rgb: '64748B' } },
      right: { style: 'thin', color: { rgb: '64748B' } },
    },
  },
  cellNormalEven: {
    fill: { fgColor: { rgb: 'FFFFFF' } },
    font: { sz: 10, color: { rgb: '1E293B' }, name: 'Calibri' },
    border: {
      top: { style: 'thin', color: { rgb: 'CBD5E1' } },
      bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
      left: { style: 'thin', color: { rgb: 'CBD5E1' } },
      right: { style: 'thin', color: { rgb: 'CBD5E1' } },
    },
  },
  cellNormalOdd: {
    fill: { fgColor: { rgb: 'F8FAFC' } }, // Subtle zebra row
    font: { sz: 10, color: { rgb: '1E293B' }, name: 'Calibri' },
    border: {
      top: { style: 'thin', color: { rgb: 'CBD5E1' } },
      bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
      left: { style: 'thin', color: { rgb: 'CBD5E1' } },
      right: { style: 'thin', color: { rgb: 'CBD5E1' } },
    },
  },
  cellScoreEven: {
    fill: { fgColor: { rgb: 'FEFCE8' } }, // Soft yellow highlight for score input
    font: { bold: true, sz: 10, color: { rgb: '854D0E' }, name: 'Calibri' },
    border: {
      top: { style: 'thin', color: { rgb: 'CBD5E1' } },
      bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
      left: { style: 'thin', color: { rgb: 'CBD5E1' } },
      right: { style: 'thin', color: { rgb: 'CBD5E1' } },
    },
  },
  cellScoreOdd: {
    fill: { fgColor: { rgb: 'FEF9C3' } }, // Soft yellow zebra
    font: { bold: true, sz: 10, color: { rgb: '854D0E' }, name: 'Calibri' },
    border: {
      top: { style: 'thin', color: { rgb: 'CBD5E1' } },
      bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
      left: { style: 'thin', color: { rgb: 'CBD5E1' } },
      right: { style: 'thin', color: { rgb: 'CBD5E1' } },
    },
  },
};

export class ExcelService {
  /**
   * Helper: Sanitize sheet names for Excel (max 31 chars, no forbidden chars: \ / ? * : [ ])
   */
  public static sanitizeSheetName(name: string): string {
    const cleaned = name.replace(/[\/\\?*:[\]]/g, ' ').replace(/\s+/g, ' ').trim();
    return cleaned.slice(0, 31) || 'Sheet1';
  }

  /**
   * Generates and downloads a pre-formatted Excel template for importing students
   * All sample student data is removed/emptied, cells have borders and colored headers.
   */
  public static downloadStudentTemplate(): void {
    const headers = [
      'No',
      'NIS',
      'NISN',
      'Nama Siswa',
      'L/P',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Nama Orang Tua',
      'Kelas',
      'Rombel',
    ];

    const dataRows: (string | number)[][] = [headers];

    // 35 formatted empty rows with row numbers, ready for input
    const rowCount = 35;
    for (let i = 1; i <= rowCount; i++) {
      dataRows.push([
        i,  // No
        '', // NIS (kosong)
        '', // NISN (kosong)
        '', // Nama Siswa (kosong)
        '', // L/P (kosong)
        '', // Tempat Lahir (kosong)
        '', // Tanggal Lahir (kosong)
        '', // Nama Orang Tua (kosong)
        '6', // Kelas default 6
        '', // Rombel (kosong, misal diisi 6A / 6B / 6C / 6D)
      ]);
    }

    const ws = XLSX.utils.aoa_to_sheet(dataRows);

    // Apply header styles (Navy Blue + White Text + Borders)
    for (let c = 0; c < headers.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[cellRef]) {
        ws[cellRef].s = EXCEL_STYLES.headerStudent;
      }
    }

    // Apply cell styles for data rows (Thin borders + Zebra striping)
    for (let r = 1; r <= rowCount; r++) {
      const isOdd = r % 2 === 1;
      const baseStyle = isOdd ? EXCEL_STYLES.cellNormalOdd : EXCEL_STYLES.cellNormalEven;

      for (let c = 0; c < headers.length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };

        // Determine horizontal alignment
        const isCentered = c === 0 || c === 1 || c === 2 || c === 4 || c === 6 || c === 8 || c === 9;
        ws[cellRef].s = {
          ...baseStyle,
          alignment: {
            horizontal: isCentered ? 'center' : 'left',
            vertical: 'center',
          },
        };
      }
    }

    // Column widths
    ws['!cols'] = [
      { wch: 6 },  // No
      { wch: 14 }, // NIS
      { wch: 16 }, // NISN
      { wch: 30 }, // Nama Siswa
      { wch: 8 },  // L/P
      { wch: 18 }, // Tempat Lahir
      { wch: 18 }, // Tanggal Lahir (YYYY-MM-DD)
      { wch: 26 }, // Nama Orang Tua
      { wch: 8 },  // Kelas
      { wch: 10 }, // Rombel
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');
    XLSX.writeFile(wb, 'Template_Import_Siswa_SDN_Babelan_Kota_01.xlsx');
  }

  /**
   * Semesters list ordered from Semester 1 - Kelas 4 onwards
   */
  public static readonly SEMESTER_OPTIONS: Array<{
    code: SemesterCode;
    label: string;
    kelas: '4' | '5' | '6';
    shortName: string;
    sheetName: string;
  }> = [
    { code: 'Smt1_Kls4', label: 'Semester 1 - Kelas 4', kelas: '4', shortName: 'Smt 1 Kls 4', sheetName: 'Smt 1 - Kelas 4' },
    { code: 'Smt2_Kls4', label: 'Semester 2 - Kelas 4', kelas: '4', shortName: 'Smt 2 Kls 4', sheetName: 'Smt 2 - Kelas 4' },
    { code: 'Smt1_Kls5', label: 'Semester 1 - Kelas 5', kelas: '5', shortName: 'Smt 1 Kls 5', sheetName: 'Smt 1 - Kelas 5' },
    { code: 'Smt2_Kls5', label: 'Semester 2 - Kelas 5', kelas: '5', shortName: 'Smt 2 Kls 5', sheetName: 'Smt 2 - Kelas 5' },
    { code: 'Smt1_Kls6', label: 'Semester 1 - Kelas 6', kelas: '6', shortName: 'Smt 1 Kls 6', sheetName: 'Smt 1 - Kelas 6' },
    { code: 'Smt2_Kls6', label: 'Semester 2 - Kelas 6', kelas: '6', shortName: 'Smt 2 Kls 6', sheetName: 'Smt 2 - Kelas 6' },
  ];

  /**
   * Helper: Normalize semester string or sheet name to SemesterCode
   */
  public static parseSemesterCode(raw: string, defaultCode: SemesterCode = 'Smt1_Kls6'): SemesterCode {
    const s = String(raw || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (s.includes('1') && s.includes('4')) return 'Smt1_Kls4';
    if (s.includes('2') && s.includes('4')) return 'Smt2_Kls4';
    if (s.includes('1') && s.includes('5')) return 'Smt1_Kls5';
    if (s.includes('2') && s.includes('5')) return 'Smt2_Kls5';
    if (s.includes('1') && s.includes('6')) return 'Smt1_Kls6';
    if (s.includes('2') && s.includes('6')) return 'Smt2_Kls6';
    return defaultCode;
  }

  /**
   * Helper: Match an Excel column header to a known Subject
   */
  public static matchSubjectFromColumn(colHeader: string, subjects: Subject[]): Subject | undefined {
    const clean = String(colHeader || '').trim();
    if (!clean) return undefined;
    const lower = clean.toLowerCase();
    const alphanumeric = lower.replace(/[^a-z0-9]/g, '');

    // Skip student identity / meta columns
    const skipWords = [
      'no', 'nis', 'nisn', 'nama', 'namasiswa', 'rombel', 'kelas',
      'semester', 'ratarata', 'rata', 'jumlah', 'status', 'kktp',
      'predikat', 'ketuntasan', 'catatan', 'keterangan'
    ];
    if (skipWords.includes(alphanumeric)) return undefined;

    // 1. Direct code match (e.g., "PABP", "PP", "BIND", "MTK", "IPAS", "PJOK", "SENI", "BING", "MULOK")
    for (const s of subjects) {
      const sKode = s.kode.toLowerCase();
      const sNama = s.nama_mapel.toLowerCase();
      // Code enclosed in brackets or parentheses e.g. "Pendidikan Agama (PABP)" or "[PABP]"
      if (lower.includes(`(${sKode})`) || lower.includes(`[${sKode}]`)) return s;
      if (alphanumeric === sKode) return s;
      if (alphanumeric.startsWith(sKode) && alphanumeric.length <= sKode.length + 3) return s;
      if (lower === sNama) return s;
    }

    // 2. Keyword heuristic mapping for standard SD subjects
    if (lower.includes('pabp') || lower.includes('agama') || lower.includes('budi pekerti') || lower.includes('pai')) {
      return subjects.find((s) => s.id === 'subj_pabp' || s.kode.toLowerCase().includes('pab'));
    }
    if (lower.includes('pancasila') || lower.includes('ppkn') || lower.includes('pkn') || alphanumeric === 'pp') {
      return subjects.find((s) => s.id === 'subj_pp' || s.kode.toLowerCase() === 'pp' || s.kode.toLowerCase() === 'pkn');
    }
    if (lower.includes('bahasa indonesia') || lower.includes('b.indo') || lower.includes('b indo') || alphanumeric === 'bind' || alphanumeric === 'bin') {
      return subjects.find((s) => s.id === 'subj_bind' || s.kode.toLowerCase().includes('bin'));
    }
    if (lower.includes('matematika') || lower.includes('mtk') || alphanumeric === 'mat') {
      return subjects.find((s) => s.id === 'subj_mtk' || s.kode.toLowerCase().includes('mtk'));
    }
    if (lower.includes('ipas') || lower.includes('alam dan sosial') || alphanumeric === 'ipa' || alphanumeric === 'ips') {
      return subjects.find((s) => s.id === 'subj_ipas' || s.kode.toLowerCase().includes('ipas'));
    }
    if (lower.includes('jasmani') || lower.includes('pjok') || lower.includes('olahraga') || lower.includes('penjas')) {
      return subjects.find((s) => s.id === 'subj_pjok' || s.kode.toLowerCase().includes('pjok'));
    }
    if (lower.includes('seni') || lower.includes('sbdp') || lower.includes('rupa') || lower.includes('budaya')) {
      return subjects.find((s) => s.id === 'subj_seni' || s.kode.toLowerCase().includes('seni'));
    }
    if (lower.includes('inggris') || lower.includes('english') || alphanumeric === 'bing' || alphanumeric === 'big') {
      return subjects.find((s) => s.id === 'subj_bing' || s.kode.toLowerCase().includes('bing'));
    }
    if (lower.includes('sunda') || lower.includes('mulok') || lower.includes('muatan lokal')) {
      return subjects.find((s) => s.id === 'subj_mulok' || s.kode.toLowerCase().includes('mulok'));
    }

    // 3. Fallback: match by partial subject name
    for (const s of subjects) {
      const sNamaClean = s.nama_mapel.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (sNamaClean.length > 5 && alphanumeric.includes(sNamaClean.substring(0, 5))) {
        return s;
      }
    }

    return undefined;
  }

  /**
   * Generates and downloads the consolidated Excel template for a single semester
   * with ALL active subjects combined into columns!
   * Columns: [No, NISN, Nama Siswa, Rombel, Subject1, Subject2, Subject3, ...]
   */
  public static downloadGradeTemplate(options?: GradeTemplateOptions | Subject[]): void {
    let opt: GradeTemplateOptions = {};
    if (Array.isArray(options)) {
      opt = { subjects: options };
    } else if (options) {
      opt = options;
    }

    const targetSemester = opt.semester || 'Smt1_Kls6';
    const targetRombel = opt.rombel || '6A';
    const activeSubjects = (opt.subjects || []).filter((s) => s.aktif);
    const semMeta = this.SEMESTER_OPTIONS.find((s) => s.code === targetSemester) || {
      code: targetSemester,
      label: targetSemester,
      kelas: '6' as const,
      shortName: targetSemester,
      sheetName: this.sanitizeSheetName(targetSemester),
    };

    const wb = XLSX.utils.book_new();

    // Headers: Student identity + all combined subjects
    const baseHeaders = ['No', 'NISN', 'Nama Siswa', 'Rombel'];
    const subjectHeaders = activeSubjects.map((s) => `${s.kode} - ${s.nama_mapel}`);
    const headers = [...baseHeaders, ...subjectHeaders];

    const dataRows: (string | number)[][] = [headers];

    const matchingStudents = (opt.students || []).filter(
      (s) => s.rombel === targetRombel && s.status === 'Aktif'
    );

    if (opt.includeStudents && matchingStudents.length > 0) {
      matchingStudents.forEach((s, idx) => {
        const row: (string | number)[] = [
          idx + 1,
          s.nisn,
          s.nama,
          s.rombel || targetRombel,
        ];
        // Empty cells for each subject
        activeSubjects.forEach(() => row.push(''));
        dataRows.push(row);
      });
    } else {
      const rowCount = 35;
      for (let i = 1; i <= rowCount; i++) {
        const row: (string | number)[] = [i, '', '', targetRombel];
        activeSubjects.forEach(() => row.push(''));
        dataRows.push(row);
      }
    }

    const totalDataRows = dataRows.length - 1;
    const ws = XLSX.utils.aoa_to_sheet(dataRows);

    // Apply header styles
    for (let c = 0; c < headers.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[cellRef]) {
        ws[cellRef].s = EXCEL_STYLES.headerGrade;
      }
    }

    // Apply data rows style with zebra striping and yellow score cell highlights
    for (let r = 1; r <= totalDataRows; r++) {
      const isOdd = r % 2 === 1;
      for (let c = 0; c < headers.length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };

        const isScoreCol = c >= baseHeaders.length;
        const baseStyle = isScoreCol
          ? isOdd ? EXCEL_STYLES.cellScoreOdd : EXCEL_STYLES.cellScoreEven
          : isOdd ? EXCEL_STYLES.cellNormalOdd : EXCEL_STYLES.cellNormalEven;

        const isCentered = c === 0 || c === 1 || c === 3 || isScoreCol;
        ws[cellRef].s = {
          ...baseStyle,
          alignment: {
            horizontal: isCentered ? 'center' : 'left',
            vertical: 'center',
          },
        };
      }
    }

    // Column widths
    const colWidths = [
      { wch: 6 },  // No
      { wch: 16 }, // NISN
      { wch: 30 }, // Nama Siswa
      { wch: 10 }, // Rombel
      ...activeSubjects.map((s) => ({ wch: Math.max(16, s.kode.length + 8) })),
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, semMeta.sheetName);

    const safeSemester = semMeta.shortName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Format_Nilai_Rapor_${safeSemester}_Rombel_${targetRombel}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  /**
   * Generates a complete multi-sheet Excel workbook where EACH sheet represents one semester
   * (from Semester 1 - Kelas 4 onwards), and inside each sheet ALL subjects are combined as columns!
   */
  public static downloadAllSemestersGradePackage(options: {
    subjects: Subject[];
    rombel?: string;
    students?: Student[];
    includeStudents?: boolean;
  }): void {
    const { subjects, rombel = '6A', students = [], includeStudents = true } = options;
    const activeSubjects = subjects.filter((s) => s.aktif);
    const wb = XLSX.utils.book_new();

    const baseHeaders = ['No', 'NISN', 'Nama Siswa', 'Rombel'];
    const subjectHeaders = activeSubjects.map((s) => `${s.kode} - ${s.nama_mapel}`);
    const headers = [...baseHeaders, ...subjectHeaders];

    const matchingStudents = students.filter((s) => s.rombel === rombel && s.status === 'Aktif');

    // Build each sheet per semester from Semester 1 - Kelas 4 onwards
    this.SEMESTER_OPTIONS.forEach((sem) => {
      const dataRows: (string | number)[][] = [headers];

      if (includeStudents && matchingStudents.length > 0) {
        matchingStudents.forEach((s, idx) => {
          const row: (string | number)[] = [
            idx + 1,
            s.nisn,
            s.nama,
            s.rombel || rombel,
          ];
          activeSubjects.forEach(() => row.push(''));
          dataRows.push(row);
        });
      } else {
        for (let i = 1; i <= 35; i++) {
          const row: (string | number)[] = [i, '', '', rombel];
          activeSubjects.forEach(() => row.push(''));
          dataRows.push(row);
        }
      }

      const totalDataRows = dataRows.length - 1;
      const ws = XLSX.utils.aoa_to_sheet(dataRows);

      // Header styling
      for (let c = 0; c < headers.length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c });
        if (ws[cellRef]) ws[cellRef].s = EXCEL_STYLES.headerGrade;
      }

      // Cell styling with borders & score highlights
      for (let r = 1; r <= totalDataRows; r++) {
        const isOdd = r % 2 === 1;
        for (let c = 0; c < headers.length; c++) {
          const cellRef = XLSX.utils.encode_cell({ r, c });
          if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };

          const isScoreCol = c >= baseHeaders.length;
          const baseStyle = isScoreCol
            ? isOdd ? EXCEL_STYLES.cellScoreOdd : EXCEL_STYLES.cellScoreEven
            : isOdd ? EXCEL_STYLES.cellNormalOdd : EXCEL_STYLES.cellNormalEven;

          const isCentered = c === 0 || c === 1 || c === 3 || isScoreCol;
          ws[cellRef].s = {
            ...baseStyle,
            alignment: {
              horizontal: isCentered ? 'center' : 'left',
              vertical: 'center',
            },
          };
        }
      }

      ws['!cols'] = [
        { wch: 6 },
        { wch: 16 },
        { wch: 30 },
        { wch: 10 },
        ...activeSubjects.map((s) => ({ wch: Math.max(16, s.kode.length + 8) })),
      ];

      XLSX.utils.book_append_sheet(wb, ws, sem.sheetName);
    });

    const filename = `Paket_Format_Nilai_Rapor_Semua_Semester_Rombel_${rombel}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  /**
   * Export exact Grade Table with all combined subjects as columns
   * [No, NISN, Nama Siswa, Rombel, Subj1, Subj2, ..., Rata-Rata, Status KKTP]
   */
  public static exportGradeTable(params: {
    students: Student[];
    subjects: Subject[];
    semester: SemesterCode;
    rombel: string;
    grades: Grade[];
    settings: SchoolSettings;
  }): void {
    const { students, subjects, semester, rombel, grades, settings } = params;
    const wb = XLSX.utils.book_new();

    const activeSubjects = subjects.filter((s) => s.aktif);
    const semMeta = this.SEMESTER_OPTIONS.find((s) => s.code === semester) || {
      code: semester,
      label: semester,
      kelas: '6' as const,
      shortName: semester,
      sheetName: this.sanitizeSheetName(semester),
    };

    const filteredStudents = students
      .filter((s) => s.rombel === rombel && s.status === 'Aktif')
      .sort((a, b) => a.nama.localeCompare(b.nama));

    const baseHeaders = ['No', 'NISN', 'Nama Siswa', 'Rombel'];
    const subjectHeaders = activeSubjects.map((s) => `${s.kode} (KKTP ${s.kktp ?? 75})`);
    const endHeaders = ['Rata-Rata', 'Ketuntasan'];
    const headers = [...baseHeaders, ...subjectHeaders, ...endHeaders];

    const titleRows = [
      [`LEGER NILAI RAPOR GABUNGAN MATA PELAJARAN - ${settings.nama_sekolah}`],
      [`Semester: ${semMeta.label} | Rombel: ${rombel} | Tahun Ajaran: ${settings.tahun_ajaran}`],
      [''],
      headers,
    ];

    const dataRows = filteredStudents.map((s, idx) => {
      let sum = 0;
      let count = 0;
      let passedCount = 0;

      const subjectScores = activeSubjects.map((sub) => {
        const g = grades.find(
          (item) => item.student_id === s.id && item.subject_id === sub.id && item.semester === semester
        );
        const kktp = sub.kktp ?? 75;
        if (g?.nilai_akhir !== null && g?.nilai_akhir !== undefined) {
          const val = Number(g.nilai_akhir);
          sum += val;
          count++;
          if (val >= kktp) passedCount++;
          return val;
        }
        return '';
      });

      const avg = count > 0 ? (sum / count).toFixed(1) : '-';
      const ketuntasan = count > 0 ? `${passedCount}/${count} Tuntas` : '-';

      return [
        idx + 1,
        s.nisn,
        s.nama,
        s.rombel || rombel,
        ...subjectScores,
        avg,
        ketuntasan,
      ];
    });

    const allRows = [...titleRows, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(allRows);

    // Style Title Row 1 & 2
    if (ws['A1']) {
      ws['A1'].s = {
        font: { bold: true, sz: 12, color: { rgb: '065F46' }, name: 'Calibri' },
      };
    }
    if (ws['A2']) {
      ws['A2'].s = {
        font: { sz: 10, italic: true, color: { rgb: '334155' }, name: 'Calibri' },
      };
    }

    // Header styling (Row index 3)
    for (let c = 0; c < headers.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 3, c });
      if (ws[cellRef]) {
        ws[cellRef].s = EXCEL_STYLES.headerGrade;
      }
    }

    // Data rows styling
    for (let r = 4; r < allRows.length; r++) {
      const isOdd = r % 2 === 1;
      const baseStyle = isOdd ? EXCEL_STYLES.cellNormalOdd : EXCEL_STYLES.cellNormalEven;

      for (let c = 0; c < headers.length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };

        const isCentered = c === 0 || c === 1 || c === 3 || c >= baseHeaders.length;
        ws[cellRef].s = {
          ...baseStyle,
          alignment: {
            horizontal: isCentered ? 'center' : 'left',
            vertical: 'center',
          },
        };
      }
    }

    ws['!cols'] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 30 },
      { wch: 10 },
      ...activeSubjects.map(() => ({ wch: 14 })),
      { wch: 12 },
      { wch: 16 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, semMeta.sheetName);

    const safeSemester = semMeta.shortName.replace(/[^a-zA-Z0-9]/g, '_');
    XLSX.writeFile(wb, `Leger_Nilai_${safeSemester}_Rombel_${rombel}.xlsx`);
  }

  /**
   * Parse Student Excel file and validate each row
   * Automatically skips blank template rows to prevent false-positive errors.
   */
  public static async parseStudentFile(
    file: File,
    existingStudents: Student[]
  ): Promise<{
    rows: StudentImportPreview[];
    totalRows: number;
    validCount: number;
    invalidCount: number;
    duplicateCount: number;
  }> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as any[];

    const existingNisnMap = new Set(existingStudents.map((s) => String(s.nisn).trim()));
    const seenNisnInFile = new Set<string>();

    const rows: StudentImportPreview[] = [];
    let validCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;

    jsonData.forEach((row, idx) => {
      const rowNumber = idx + 2; // header is row 1
      const nis = String(row['NIS'] || row['nis'] || '').trim();
      const rawNisn = String(row['NISN'] || row['nisn'] || '').trim();
      const nama = String(row['Nama Siswa'] || row['Nama'] || row['nama'] || '').trim();

      // Gracefully skip empty template rows
      if (!nama && !rawNisn && !nis) {
        return;
      }

      let jk = String(row['L/P'] || row['Jenis Kelamin'] || row['JK'] || '').toUpperCase().trim();
      if (jk.startsWith('LAK')) jk = 'L';
      if (jk.startsWith('PER')) jk = 'P';
      const jenis_kelamin: 'L' | 'P' = jk === 'P' ? 'P' : 'L';

      const tempat_lahir = String(row['Tempat Lahir'] || 'Bekasi').trim();
      let tanggal_lahir = String(row['Tanggal Lahir'] || '2014-01-01').trim();
      // Handle Excel serial date if passed
      if (!isNaN(Number(tanggal_lahir)) && Number(tanggal_lahir) > 20000) {
        const dateObj = new Date((Number(tanggal_lahir) - 25569) * 86400 * 1000);
        tanggal_lahir = dateObj.toISOString().split('T')[0];
      }

      const orang_tua = String(row['Nama Orang Tua'] || row['Orang Tua'] || '-').trim();
      const rawKelas = String(row['Kelas'] || '').trim();
      let kelas: '4' | '5' | '6' = '6';
      if (rawKelas === '4' || rawKelas.includes('4')) kelas = '4';
      else if (rawKelas === '5' || rawKelas.includes('5')) kelas = '5';
      else kelas = '6';

      let rombel = String(row['Rombel'] || row['Kelas/Rombel'] || `${kelas}A`).toUpperCase().trim();
      if (!rombel.startsWith(kelas)) rombel = `${kelas}${rombel.replace(/[^A-D]/g, '') || 'A'}`;

      let isValid = true;
      const errors: string[] = [];

      if (!nama) {
        isValid = false;
        errors.push('Nama siswa wajib diisi');
      }
      if (!rawNisn) {
        isValid = false;
        errors.push('NISN wajib diisi');
      }
      if (seenNisnInFile.has(rawNisn)) {
        isValid = false;
        errors.push('NISN ganda dalam file Excel');
      } else if (rawNisn) {
        seenNisnInFile.add(rawNisn);
      }

      const isDuplicateInDatabase = Boolean(rawNisn && existingNisnMap.has(rawNisn));
      if (isDuplicateInDatabase) {
        duplicateCount++;
      }

      if (isValid) {
        validCount++;
      } else {
        invalidCount++;
      }

      rows.push({
        rawRow: row,
        rowNumber,
        nis: nis || '0000',
        nisn: rawNisn,
        nama,
        jenis_kelamin,
        tempat_lahir,
        tanggal_lahir,
        orang_tua,
        kelas,
        rombel,
        isValid,
        validationError: errors.join(', '),
        isDuplicateInDatabase,
      });
    });

    return {
      rows,
      totalRows: rows.length,
      validCount,
      invalidCount,
      duplicateCount,
    };
  }

  /**
   * Parse Grade Excel file and validate each row.
   * Supports:
   * 1. Multi-subject combined format (subjects as columns, e.g. PABP, PP, BIND, MTK, IPAS, etc.)
   * 2. Multi-sheet workbooks (each sheet represents a semester: Smt 1 - Kelas 4 s.d. Smt 2 - Kelas 6)
   * 3. Single-subject row format (No, NISN, Nama, Rombel, Mata Pelajaran, Semester, Nilai Rapor)
   * 4. Multi-semester column format (Smt 1 Kls 4, Smt 2 Kls 4, etc.)
   */
  public static async parseGradeFile(
    file: File,
    students: Student[],
    subjects: Subject[],
    defaultSemester: SemesterCode = 'Smt1_Kls6'
  ): Promise<{
    rows: GradeImportPreview[];
    totalRows: number;
    validCount: number;
    invalidCount: number;
  }> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const studentMap = new Map(students.map((s) => [s.nisn, s]));
    const studentNameMap = new Map(students.map((s) => [s.nama.toLowerCase().trim(), s]));
    const subjectMap = new Map<string, Subject>();
    subjects.forEach((s) => {
      subjectMap.set(s.nama_mapel.toLowerCase(), s);
      subjectMap.set(s.kode.toLowerCase(), s);
      subjectMap.set(s.id, s);
    });

    const rows: GradeImportPreview[] = [];
    let validCount = 0;
    let invalidCount = 0;

    // Check if workbook has sheets corresponding to semesters
    const sheetNames = workbook.SheetNames;

    sheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) return;

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as any[];
      if (jsonData.length === 0) return;

      // Determine semester for this sheet
      const sheetSemester = this.parseSemesterCode(sheetName, defaultSemester);

      jsonData.forEach((row, idx) => {
        const rowNumber = idx + 2;
        const nisn = String(row['NISN'] || row['nisn'] || '').trim();
        const nama = String(row['Nama Siswa'] || row['Nama'] || row['nama'] || '').trim();

        // Skip completely empty template rows
        if (!nisn && !nama) {
          return;
        }

        const rawKelas = String(row['Kelas'] || '').trim();
        let kelas: '4' | '5' | '6' = '6';
        if (rawKelas === '4' || sheetSemester.includes('Kls4')) kelas = '4';
        else if (rawKelas === '5' || sheetSemester.includes('Kls5')) kelas = '5';
        else kelas = '6';

        const studentObj = studentMap.get(nisn) || studentNameMap.get(nama.toLowerCase());
        const rombel = String(row['Rombel'] || studentObj?.rombel || `${kelas}A`).toUpperCase().trim();

        // 1. Detect if row has COMBINED SUBJECT COLUMNS (Subject codes/names as columns)
        const matchedSubjectColumns: { colKey: string; subject: Subject }[] = [];
        Object.keys(row).forEach((colKey) => {
          const matched = this.matchSubjectFromColumn(colKey, subjects);
          if (matched) {
            matchedSubjectColumns.push({ colKey, subject: matched });
          }
        });

        if (matchedSubjectColumns.length > 0) {
          // Process each subject column
          matchedSubjectColumns.forEach(({ colKey, subject }) => {
            const rawVal = row[colKey];
            if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
              return; // Skip empty cells (ready for input)
            }

            let num: number | null = null;
            if (!isNaN(Number(rawVal))) {
              num = Number(rawVal);
            }

            let isValid = true;
            const errors: string[] = [];

            if (!nisn && !studentObj) {
              isValid = false;
              errors.push('NISN wajib ada');
            } else if (!studentObj) {
              isValid = false;
              errors.push(`Siswa ${nisn || nama} tidak ditemukan`);
            }

            if (num === null || isNaN(num) || num < 0 || num > 100) {
              isValid = false;
              errors.push('Nilai Rapor harus angka antara 0 - 100');
            }

            if (isValid) validCount++;
            else invalidCount++;

            rows.push({
              rawRow: row,
              rowNumber,
              nisn: studentObj ? studentObj.nisn : nisn,
              nama: studentObj ? studentObj.nama : nama,
              kelas,
              rombel: studentObj?.rombel || rombel,
              mapel: subject.nama_mapel,
              subject_id: subject.id,
              semester: sheetSemester,
              nilai_akhir: num,
              catatan: '',
              isValid,
              validationError: errors.join(', '),
              studentFound: Boolean(studentObj),
              subjectFound: true,
            });
          });
          return;
        }

        // 2. Check if multi-semester Riwayat Semester columns exist (e.g. Smt 1 Kls 4, Smt 2 Kls 4, etc.)
        const semColumns: { colKeys: string[]; code: SemesterCode; kelas: '4' | '5' | '6' }[] = [
          { colKeys: ['Smt 1 Kls 4', 'Smt 1 Kelas 4', 'Smt1_Kls4', '4_1'], code: 'Smt1_Kls4', kelas: '4' },
          { colKeys: ['Smt 2 Kls 4', 'Smt 2 Kelas 4', 'Smt2_Kls4', '4_2'], code: 'Smt2_Kls4', kelas: '4' },
          { colKeys: ['Smt 1 Kls 5', 'Smt 1 Kelas 5', 'Smt1_Kls5', '5_1'], code: 'Smt1_Kls5', kelas: '5' },
          { colKeys: ['Smt 2 Kls 5', 'Smt 2 Kelas 5', 'Smt2_Kls5', '5_2'], code: 'Smt2_Kls5', kelas: '5' },
          { colKeys: ['Smt 1 Kls 6', 'Smt 1 Kelas 6', 'Smt1_Kls6', '6_1'], code: 'Smt1_Kls6', kelas: '6' },
          { colKeys: ['Smt 2 Kls 6', 'Smt 2 Kelas 6', 'Smt2_Kls6', '6_2'], code: 'Smt2_Kls6', kelas: '6' },
        ];

        const hasMultiSemCols = semColumns.some((sc) => sc.colKeys.some((k) => k in row));
        const mapel = String(row['Mata Pelajaran'] || row['mapel'] || row['Mapel'] || '').trim();
        const matchedSubj = mapel ? (subjectMap.get(mapel.toLowerCase()) || this.matchSubjectFromColumn(mapel, subjects)) : undefined;

        if (hasMultiSemCols && matchedSubj) {
          semColumns.forEach((sc) => {
            let rawVal: any = '';
            for (const key of sc.colKeys) {
              if (row[key] !== undefined && row[key] !== '') {
                rawVal = row[key];
                break;
              }
            }

            if (String(rawVal).trim() === '') return;

            let num: number | null = null;
            if (!isNaN(Number(rawVal))) {
              num = Number(rawVal);
            }

            let isValid = true;
            const errors: string[] = [];

            if (!studentObj) {
              isValid = false;
              errors.push('NISN tidak ditemukan di daftar siswa');
            }

            if (num !== null && (num < 0 || num > 100)) {
              isValid = false;
              errors.push('Nilai Rapor harus antara 0 - 100');
            }

            if (isValid) validCount++;
            else invalidCount++;

            rows.push({
              rawRow: row,
              rowNumber,
              nisn: studentObj ? studentObj.nisn : nisn,
              nama: studentObj ? studentObj.nama : nama,
              kelas: sc.kelas,
              rombel: studentObj?.rombel || rombel,
              mapel: matchedSubj.nama_mapel,
              subject_id: matchedSubj.id,
              semester: sc.code,
              nilai_akhir: num,
              catatan: '',
              isValid,
              validationError: errors.join(', '),
              studentFound: Boolean(studentObj),
              subjectFound: true,
            });
          });
          return;
        }

        // 3. Fallback: Single semester row format with 'Nilai Rapor'
        const rawNilai = row['Nilai Rapor'] ?? row['Nilai Akhir'] ?? row['Nilai'] ?? row['nilai_rapor'] ?? row['nilai_akhir'] ?? '';
        if (String(rawNilai).trim() === '') return;

        let num: number | null = null;
        if (!isNaN(Number(rawNilai))) {
          num = Number(rawNilai);
        }

        const rawSemStr = String(row['Semester'] || sheetSemester);
        const rowSemester = this.parseSemesterCode(rawSemStr, sheetSemester);

        let isValid = true;
        const errors: string[] = [];

        if (!studentObj) {
          isValid = false;
          errors.push('Siswa tidak ditemukan');
        }

        if (!matchedSubj) {
          isValid = false;
          errors.push('Mata Pelajaran tidak valid');
        }

        if (num !== null && (num < 0 || num > 100)) {
          isValid = false;
          errors.push('Nilai Rapor harus antara 0 - 100');
        }

        if (isValid) validCount++;
        else invalidCount++;

        rows.push({
          rawRow: row,
          rowNumber,
          nisn: studentObj ? studentObj.nisn : nisn,
          nama: studentObj ? studentObj.nama : nama,
          kelas,
          rombel: studentObj?.rombel || rombel,
          mapel: matchedSubj?.nama_mapel || mapel,
          subject_id: matchedSubj?.id,
          semester: rowSemester,
          nilai_akhir: num,
          catatan: '',
          isValid,
          validationError: errors.join(', '),
          studentFound: Boolean(studentObj),
          subjectFound: Boolean(matchedSubj),
        });
      });
    });

    return {
      rows,
      totalRows: rows.length,
      validCount,
      invalidCount,
    };
  }

  public static async parseStudentExcel(
    file: File,
    existingStudents: Student[]
  ): Promise<ImportResult<Omit<Student, 'id'>>> {
    const preview = await this.parseStudentFile(file, existingStudents);
    const validData: Omit<Student, 'id'>[] = preview.rows
      .filter((r) => r.isValid)
      .map((r) => ({
        nis: r.nis,
        nisn: r.nisn,
        nama: r.nama,
        jenis_kelamin: r.jenis_kelamin,
        tempat_lahir: r.tempat_lahir,
        tanggal_lahir: r.tanggal_lahir,
        orang_tua: r.orang_tua,
        kelas: r.kelas,
        rombel: r.rombel,
        status: 'Aktif' as const,
      }));

    const errors = preview.rows
      .filter((r) => !r.isValid && r.validationError)
      .map((r) => `Baris ${r.rowNumber} (${r.nama || r.nisn || 'Data'}): ${r.validationError}`);

    const warnings: string[] = [];
    if (preview.duplicateCount > 0) {
      warnings.push(`Ditemukan ${preview.duplicateCount} NISN yang sudah terdaftar di database.`);
    }

    return {
      success: validData.length > 0 || errors.length === 0,
      data: validData,
      warnings,
      errors,
    };
  }

  public static async parseGradeExcel(
    file: File,
    students: Student[],
    subjects: Subject[],
    targetSemester: SemesterCode,
    targetKelas: '4' | '5' | '6',
    targetRombel: string
  ): Promise<ImportResult<any>> {
    const preview = await this.parseGradeFile(file, students, subjects);
    const validData = preview.rows
      .filter((r) => r.isValid)
      .map((r) => ({
        nisn: r.nisn,
        nama: r.nama,
        kelas: r.kelas || targetKelas,
        rombel: r.rombel || targetRombel,
        mapel: r.mapel,
        semester: r.semester || targetSemester,
        nilai_akhir: r.nilai_akhir,
        catatan: '',
      }));

    const errors = preview.rows
      .filter((r) => !r.isValid && r.validationError)
      .map((r) => `Baris ${r.rowNumber} (${r.nama || r.nisn}): ${r.validationError}`);

    const warnings: string[] = [];
    return {
      success: validData.length > 0 || errors.length === 0,
      data: validData,
      warnings,
      errors,
    };
  }

  /**
   * Export Students with School Header, borders and styling
   */
  public static exportStudents(students: Student[], settings: SchoolSettings, filterDesc: string = 'Semua Siswa'): void {
    const wb = XLSX.utils.book_new();

    const headers = [
      'No',
      'NIS',
      'NISN',
      'Nama Siswa',
      'L/P',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Nama Orang Tua / Wali',
      'Kelas',
      'Rombel',
      'Status',
    ];

    const titleRows = [
      [`DAFTAR PESERTA DIDIK - ${settings.nama_sekolah}`],
      [`Tahun Ajaran: ${settings.tahun_ajaran} | Kategori: ${filterDesc}`],
      [''],
      headers,
    ];

    const dataRows = students.map((s, idx) => [
      idx + 1,
      s.nis,
      s.nisn,
      s.nama,
      s.jenis_kelamin,
      s.tempat_lahir,
      s.tanggal_lahir,
      s.orang_tua,
      s.kelas,
      s.rombel,
      s.status,
    ]);

    const allRows = [...titleRows, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(allRows);

    // Style Title Row 1 & 2
    if (ws['A1']) {
      ws['A1'].s = {
        font: { bold: true, sz: 12, color: { rgb: '1E3A8A' }, name: 'Calibri' },
      };
    }
    if (ws['A2']) {
      ws['A2'].s = {
        font: { sz: 10, italic: true, color: { rgb: '475569' }, name: 'Calibri' },
      };
    }

    // Style Table Headers (Row 3, 0-indexed)
    for (let c = 0; c < headers.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 3, c });
      if (ws[cellRef]) {
        ws[cellRef].s = EXCEL_STYLES.headerStudent;
      }
    }

    // Style Data Rows with cell borders
    for (let r = 4; r < allRows.length; r++) {
      const isOdd = r % 2 === 1;
      const baseStyle = isOdd ? EXCEL_STYLES.cellNormalOdd : EXCEL_STYLES.cellNormalEven;

      for (let c = 0; c < headers.length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };

        const isCentered = c === 0 || c === 1 || c === 2 || c === 4 || c === 6 || c === 8 || c === 9 || c === 10;
        ws[cellRef].s = {
          ...baseStyle,
          alignment: {
            horizontal: isCentered ? 'center' : 'left',
            vertical: 'center',
          },
        };
      }
    }

    ws['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 16 },
      { wch: 30 },
      { wch: 6 },
      { wch: 16 },
      { wch: 16 },
      { wch: 25 },
      { wch: 8 },
      { wch: 10 },
      { wch: 12 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');
    XLSX.writeFile(wb, `Data_Siswa_${settings.nama_sekolah.replace(/\s+/g, '_')}_${filterDesc.replace(/\s+/g, '_')}.xlsx`);
  }

  /**
   * Export Multi-Semester Grade Recap with borders and styling
   */
  public static exportGradeRecap(
    students: Student[],
    subjects: Subject[],
    grades: Grade[],
    settings: SchoolSettings,
    rombel: string,
    subjectId?: string
  ): void {
    const wb = XLSX.utils.book_new();
    const filteredStudents = students.filter((s) => s.rombel === rombel);
    const targetSubject = subjectId ? subjects.find((s) => s.id === subjectId) : undefined;

    const headers = [
      'No',
      'NISN',
      'Nama Siswa',
      'Rombel',
      'Smt 1 Kls 4',
      'Smt 2 Kls 4',
      'Smt 1 Kls 5',
      'Smt 2 Kls 5',
      'Smt 1 Kls 6',
      'Smt 2 Kls 6',
      'Nilai Rapor (Aktif)',
      'Predikat',
    ];

    const titleMapel = targetSubject ? targetSubject.nama_mapel : 'Rata-rata Seluruh Mata Pelajaran';

    const titleRows = [
      [`REKAPITULASI NILAI RAPOR - ${settings.nama_sekolah}`],
      [`Rombel: ${rombel} | Mata Pelajaran: ${titleMapel} | Tahun Ajaran: ${settings.tahun_ajaran}`],
      [''],
      headers,
    ];

    const dataRows = filteredStudents.map((s, idx) => {
      const getScore = (sem: SemesterCode) => {
        if (targetSubject) {
          const g = grades.find((gr) => gr.student_id === s.id && gr.subject_id === targetSubject.id && gr.semester === sem);
          return g?.nilai_akhir ?? '-';
        } else {
          const studentGrades = grades.filter((gr) => gr.student_id === s.id && gr.semester === sem && gr.nilai_akhir !== null);
          if (studentGrades.length === 0) return '-';
          const avg = studentGrades.reduce((sum, item) => sum + (item.nilai_akhir || 0), 0) / studentGrades.length;
          return Math.round(avg);
        }
      };

      const s1_k4 = getScore('Smt1_Kls4');
      const s2_k4 = getScore('Smt2_Kls4');
      const s1_k5 = getScore('Smt1_Kls5');
      const s2_k5 = getScore('Smt2_Kls5');
      const s1_k6 = getScore('Smt1_Kls6');
      const s2_k6 = getScore('Smt2_Kls6');

      const currentGrade = targetSubject
        ? grades.find((gr) => gr.student_id === s.id && gr.subject_id === targetSubject.id && gr.semester === settings.semester_aktif)
        : null;

      return [
        idx + 1,
        s.nisn,
        s.nama,
        s.rombel,
        s1_k4,
        s2_k4,
        s1_k5,
        s2_k5,
        s1_k6,
        s2_k6,
        currentGrade?.nilai_akhir ?? '-',
        currentGrade?.predikat ?? '-',
      ];
    });

    const allRows = [...titleRows, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(allRows);

    // Style Title
    if (ws['A1']) {
      ws['A1'].s = {
        font: { bold: true, sz: 12, color: { rgb: '047857' }, name: 'Calibri' },
      };
    }
    if (ws['A2']) {
      ws['A2'].s = {
        font: { sz: 10, italic: true, color: { rgb: '475569' }, name: 'Calibri' },
      };
    }

    // Style Headers (Row 3, 0-indexed)
    for (let c = 0; c < headers.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 3, c });
      if (ws[cellRef]) {
        ws[cellRef].s = EXCEL_STYLES.headerGrade;
      }
    }

    // Style Data Rows with borders
    for (let r = 4; r < allRows.length; r++) {
      const isOdd = r % 2 === 1;
      const baseStyle = isOdd ? EXCEL_STYLES.cellNormalOdd : EXCEL_STYLES.cellNormalEven;

      for (let c = 0; c < headers.length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };

        const isCentered = c !== 2; // Nama Siswa is left aligned, others centered
        ws[cellRef].s = {
          ...baseStyle,
          alignment: {
            horizontal: isCentered ? 'center' : 'left',
            vertical: 'center',
          },
        };
      }
    }

    ws['!cols'] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 28 },
      { wch: 8 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 18 },
      { wch: 10 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, `Rekap_${rombel}`);
    XLSX.writeFile(wb, `Rekap_Nilai_${settings.nama_sekolah.replace(/\s+/g, '_')}_${rombel}.xlsx`);
  }

  /**
   * Export School Exam (Ujian Sekolah) with Rank, borders and styling
   */
  public static exportSchoolExam(
    students: Student[],
    subjects: Subject[],
    exams: SchoolExam[],
    settings: SchoolSettings,
    rombelFilter: string = 'Semua'
  ): void {
    const wb = XLSX.utils.book_new();

    let targetStudents = students.filter((s) => s.kelas === '6');
    if (rombelFilter !== 'Semua') {
      targetStudents = targetStudents.filter((s) => s.rombel === rombelFilter);
    }

    // Calculate student overall exam average for ranking
    const studentWithAvg = targetStudents.map((s) => {
      const studentExams = exams.filter((e) => e.student_id === s.id && e.nilai !== null);
      const total = studentExams.reduce((sum, e) => sum + (e.nilai || 0), 0);
      const avg = studentExams.length > 0 ? Number((total / studentExams.length).toFixed(2)) : 0;
      return { student: s, avg, total, exams: studentExams };
    });

    // Sort descending by avg for rank
    studentWithAvg.sort((a, b) => b.avg - a.avg);

    const headers = [
      'Peringkat',
      'NISN',
      'Nama Siswa',
      'Rombel',
      ...subjects.map((s) => s.kode),
      'Total Nilai',
      'Rata-rata US',
      'Status Kelulusan',
    ];

    const titleRows = [
      [`DAFTAR NILAI UJIAN SEKOLAH (US) KELAS 6 - ${settings.nama_sekolah}`],
      [`Tahun Ajaran: ${settings.tahun_ajaran} | Filter Rombel: ${rombelFilter}`],
      [''],
      headers,
    ];

    const dataRows = studentWithAvg.map((item, idx) => {
      const row: (string | number)[] = [
        idx + 1,
        item.student.nisn,
        item.student.nama,
        item.student.rombel,
      ];

      subjects.forEach((subj) => {
        const found = item.exams.find((e) => e.subject_id === subj.id);
        row.push(found?.nilai ?? '-');
      });

      row.push(item.total);
      row.push(item.avg);
      row.push(item.avg >= settings.kktp_default ? 'LULUS' : 'REMEDIAL');

      return row;
    });

    const allRows = [...titleRows, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(allRows);

    if (ws['A1']) {
      ws['A1'].s = {
        font: { bold: true, sz: 12, color: { rgb: 'B45309' }, name: 'Calibri' },
      };
    }
    if (ws['A2']) {
      ws['A2'].s = {
        font: { sz: 10, italic: true, color: { rgb: '475569' }, name: 'Calibri' },
      };
    }

    // Style Headers
    for (let c = 0; c < headers.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 3, c });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          fill: { fgColor: { rgb: 'D97706' } }, // Amber 600
          font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10, name: 'Calibri' },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: {
            top: { style: 'medium', color: { rgb: '78350F' } },
            bottom: { style: 'medium', color: { rgb: '78350F' } },
            left: { style: 'thin', color: { rgb: 'FDE68A' } },
            right: { style: 'thin', color: { rgb: 'FDE68A' } },
          },
        };
      }
    }

    // Style Data Rows with cell borders
    for (let r = 4; r < allRows.length; r++) {
      const isOdd = r % 2 === 1;
      const baseStyle = isOdd ? EXCEL_STYLES.cellNormalOdd : EXCEL_STYLES.cellNormalEven;

      for (let c = 0; c < headers.length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };

        const isCentered = c !== 2;
        ws[cellRef].s = {
          ...baseStyle,
          alignment: {
            horizontal: isCentered ? 'center' : 'left',
            vertical: 'center',
          },
        };
      }
    }

    ws['!cols'] = [
      { wch: 10 }, // Peringkat
      { wch: 16 }, // NISN
      { wch: 28 }, // Nama Siswa
      { wch: 8 },  // Rombel
      ...subjects.map(() => ({ wch: 10 })),
      { wch: 12 }, // Total
      { wch: 14 }, // Rata-rata
      { wch: 16 }, // Status
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Ujian Sekolah');
    XLSX.writeFile(wb, `Nilai_Ujian_Sekolah_Kelas6_${settings.nama_sekolah.replace(/\s+/g, '_')}_${rombelFilter}.xlsx`);
  }

  /**
   * Export comprehensive Rekapitulasi Nilai Ijazah to Excel (.xlsx)
   */
  static exportRekapIjazahToExcel(
    rows: Array<{
      peringkat: number;
      nis: string;
      nisn: string;
      nama: string;
      gender: string;
      rombel: string;
      subjectScores: Record<string, {
        rapor: number | null;
        usTulis: number | null;
        usPraktik: number | null;
        usAkhir: number | null;
        nilaiIjazah: number | null;
      }>;
      totalIjazah: number;
      rataIjazah: number;
      status: string;
    }>,
    subjects: Subject[],
    settings: SchoolSettings,
    rombelFilter: string,
    bobotRapor: number,
    bobotUS: number
  ): void {
    const wb = XLSX.utils.book_new();

    const titleRows = [
      [`REKAPITULASI NILAI IJAZAH KELAS 6 - ${settings.nama_sekolah}`],
      [`Tahun Ajaran: ${settings.tahun_ajaran} | Rombel: ${rombelFilter} | Pembobotan: ${bobotRapor}% Nilai Rapor + ${bobotUS}% Ujian Sekolah`],
      [`Standar Kertas Cetak Resmi: F4 Landscape (330 x 210 mm) | Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}`],
      [], // Empty spacer row
    ];

    // Build Headers:
    // Row 4: No, NIS, NISN, Nama Siswa, L/P, Rombel, then for each subject 3 sub-columns (Rapor, US, Ijazah), then Total, Rata-rata, Status, Rank
    const headerRow1 = ['No', 'NIS', 'NISN', 'Nama Siswa', 'L/P', 'Rombel'];
    const headerRow2 = ['', '', '', '', '', ''];

    subjects.forEach((subj) => {
      headerRow1.push(subj.nama_mapel, '', '');
      headerRow2.push('Rapor', 'US', 'Ijazah');
    });

    headerRow1.push('Total Nilai', 'Rata-rata', 'Status', 'Peringkat');
    headerRow2.push('Ijazah', 'Ijazah', 'Kelulusan', '');

    const dataRows = rows.map((r, idx) => {
      const row: (string | number)[] = [
        idx + 1,
        r.nis || '-',
        r.nisn || '-',
        r.nama,
        r.gender,
        r.rombel,
      ];

      subjects.forEach((subj) => {
        const sc = r.subjectScores[subj.id];
        row.push(
          sc?.rapor !== null && sc?.rapor !== undefined ? Math.round(sc.rapor) : '-',
          sc?.usAkhir !== null && sc?.usAkhir !== undefined ? Math.round(sc.usAkhir) : '-',
          sc?.nilaiIjazah !== null && sc?.nilaiIjazah !== undefined ? Number(sc.nilaiIjazah.toFixed(2)) : '-'
        );
      });

      row.push(
        Number(r.totalIjazah.toFixed(2)),
        Number(r.rataIjazah.toFixed(2)),
        r.status,
        r.peringkat
      );

      return row;
    });

    const allRows = [...titleRows, headerRow1, headerRow2, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(allRows);

    // Styling Title Rows
    for (let r = 0; r < 3; r++) {
      const cellRef = XLSX.utils.encode_cell({ r, c: 0 });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true, sz: r === 0 ? 14 : 10, color: { rgb: '1E3A8A' } },
        };
      }
    }

    // Styling Headers
    for (let r = 4; r <= 5; r++) {
      for (let c = 0; c < headerRow1.length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
        ws[cellRef].s = {
          fill: { fgColor: { rgb: '1E3A8A' } },
          font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 9, name: 'Calibri' },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: {
            top: { style: 'thin', color: { rgb: 'CBD5E1' } },
            bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
            left: { style: 'thin', color: { rgb: 'CBD5E1' } },
            right: { style: 'thin', color: { rgb: 'CBD5E1' } },
          },
        };
      }
    }

    // Styling Data Rows
    for (let r = 6; r < allRows.length; r++) {
      const isOdd = r % 2 === 1;
      const baseStyle = isOdd ? EXCEL_STYLES.cellNormalOdd : EXCEL_STYLES.cellNormalEven;

      for (let c = 0; c < headerRow1.length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };

        const isName = c === 3;
        ws[cellRef].s = {
          ...baseStyle,
          alignment: {
            horizontal: isName ? 'left' : 'center',
            vertical: 'center',
          },
        };
      }
    }

    // Column widths
    ws['!cols'] = [
      { wch: 5 },  // No
      { wch: 12 }, // NIS
      { wch: 14 }, // NISN
      { wch: 28 }, // Nama Siswa
      { wch: 6 },  // L/P
      { wch: 8 },  // Rombel
      ...subjects.flatMap(() => [{ wch: 8 }, { wch: 8 }, { wch: 9 }]),
      { wch: 12 }, // Total
      { wch: 12 }, // Rata-rata
      { wch: 14 }, // Status
      { wch: 10 }, // Peringkat
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Nilai Ijazah');
    XLSX.writeFile(
      wb,
      `Rekapitulasi_Nilai_Ijazah_Kelas6_${settings.nama_sekolah.replace(/\s+/g, '_')}_${rombelFilter}_Bobot_${bobotRapor}_${bobotUS}.xlsx`
    );
  }
}

