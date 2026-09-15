import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { SemesterCode, Subject, GradeImportPreview } from '../types';
import { ExcelService } from '../services/excel';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Download,
  Upload,
  FileSpreadsheet,
  Sparkles,
  Info,
  X,
  RefreshCw,
  Award,
  Layers,
  Search,
  Check,
  FolderDown,
} from 'lucide-react';

interface SemesterOption {
  code: SemesterCode;
  label: string;
  shortLabel: string;
  kelas: '4' | '5' | '6';
  semNum: '1' | '2';
  fase: 'Fase B' | 'Fase C';
}

const SEMESTER_OPTIONS: SemesterOption[] = [
  { code: 'Smt1_Kls4', label: 'Semester 1 - Kelas 4 (Fase B)', shortLabel: 'Smt 1 - Kelas 4', kelas: '4', semNum: '1', fase: 'Fase B' },
  { code: 'Smt2_Kls4', label: 'Semester 2 - Kelas 4 (Fase B)', shortLabel: 'Smt 2 - Kelas 4', kelas: '4', semNum: '2', fase: 'Fase B' },
  { code: 'Smt1_Kls5', label: 'Semester 1 - Kelas 5 (Fase C)', shortLabel: 'Smt 1 - Kelas 5', kelas: '5', semNum: '1', fase: 'Fase C' },
  { code: 'Smt2_Kls5', label: 'Semester 2 - Kelas 5 (Fase C)', shortLabel: 'Smt 2 - Kelas 5', kelas: '5', semNum: '2', fase: 'Fase C' },
  { code: 'Smt1_Kls6', label: 'Semester 1 - Kelas 6 (Fase C)', shortLabel: 'Smt 1 - Kelas 6', kelas: '6', semNum: '1', fase: 'Fase C' },
  { code: 'Smt2_Kls6', label: 'Semester 2 - Kelas 6 (Fase C)', shortLabel: 'Smt 2 - Kelas 6', kelas: '6', semNum: '2', fase: 'Fase C' },
];

interface CellState {
  val: string;
  error?: string;
  isDirty: boolean;
}

interface StudentMatrixRow {
  studentId: string;
  nisn: string;
  nama: string;
  rombel: string;
  // subjectId -> CellState
  cells: Record<string, CellState>;
}

export const InputNilaiView: React.FC = () => {
  const { currentUser, isAdmin, canAccessRombel } = useAuth();
  const {
    students,
    subjects,
    grades,
    settings,
    rombels,
    saveGradesBatch,
    addToast,
  } = useApp();

  // Selected rombel: default to teacher's rombel if guru, or '6A'
  const defaultRombel = !isAdmin && currentUser?.rombel ? currentUser.rombel : '6A';
  const [selectedRombel, setSelectedRombel] = useState<string>(defaultRombel);
  
  // Chronological semester starting from Semester 1 - Kelas 4
  const [selectedSemester, setSelectedSemester] = useState<SemesterCode>('Smt1_Kls4');

  // Search filter and focus subject filter (all vs single subject)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [focusedSubjectId, setFocusedSubjectId] = useState<string>('ALL');

  // Matrix state: student rows with all combined subjects
  const [matrixRows, setMatrixRows] = useState<StudentMatrixRow[]>([]);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Import Excel Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isProcessingImport, setIsProcessingImport] = useState<boolean>(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreviewRows, setImportPreviewRows] = useState<GradeImportPreview[]>([]);
  const [importStats, setImportStats] = useState<{
    total: number;
    valid: number;
    invalid: number;
    uniqueStudents: number;
    uniqueSubjects: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available rombels based on user role
  const availableRombels = useMemo(() => {
    if (!isAdmin && currentUser?.rombel) {
      const matched = rombels.filter((r) => r.nama === currentUser.rombel);
      if (matched.length > 0) return matched;
      return [
        {
          id: `rombel_${currentUser.rombel.toLowerCase()}`,
          nama: currentUser.rombel,
          kelas: (currentUser.rombel.charAt(0) as '4' | '5' | '6') || '6',
          wali_kelas: currentUser.nama,
          kapasitas: 32,
        },
      ];
    }
    return rombels;
  }, [isAdmin, currentUser, rombels]);

  useEffect(() => {
    if (!isAdmin && currentUser?.rombel) {
      setSelectedRombel(currentUser.rombel);
    } else if (availableRombels.length > 0 && !availableRombels.some((r) => r.nama === selectedRombel)) {
      setSelectedRombel(availableRombels[0].nama);
    }
  }, [isAdmin, currentUser, availableRombels, selectedRombel]);

  // Active subjects ordered by urutan
  const activeSubjects = useMemo(() => {
    return subjects
      .filter((s) => s.aktif)
      .sort((a, b) => a.urutan - b.urutan);
  }, [subjects]);

  // Displayed subjects (filtered if focused on one subject, otherwise all active)
  const displayedSubjects = useMemo(() => {
    if (focusedSubjectId === 'ALL') return activeSubjects;
    const single = activeSubjects.filter((s) => s.id === focusedSubjectId);
    return single.length > 0 ? single : activeSubjects;
  }, [activeSubjects, focusedSubjectId]);

  // Target students in selected rombel
  const targetStudents = useMemo(() => {
    return students
      .filter((s) => s.rombel === selectedRombel && s.status === 'Aktif')
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }, [students, selectedRombel]);

  // Derived current class from selected rombel
  const derivedKelas: '4' | '5' | '6' = (selectedRombel.charAt(0) as '4' | '5' | '6') || '6';

  // Selected semester metadata
  const currentSemesterMeta = useMemo(() => {
    return SEMESTER_OPTIONS.find((s) => s.code === selectedSemester) || SEMESTER_OPTIONS[0];
  }, [selectedSemester]);

  // Load existing grades into matrix rows whenever selectedRombel, selectedSemester, targetStudents, or grades change
  useEffect(() => {
    const rows: StudentMatrixRow[] = targetStudents.map((student) => {
      const cells: Record<string, CellState> = {};

      activeSubjects.forEach((subject) => {
        const existingGrade = grades.find(
          (g) =>
            g.student_id === student.id &&
            g.subject_id === subject.id &&
            g.semester === selectedSemester
        );

        const val =
          existingGrade && existingGrade.nilai_akhir !== null && existingGrade.nilai_akhir !== undefined
            ? String(existingGrade.nilai_akhir)
            : '';

        cells[subject.id] = {
          val,
          error: undefined,
          isDirty: false,
        };
      });

      return {
        studentId: student.id,
        nisn: student.nisn,
        nama: student.nama,
        rombel: student.rombel || selectedRombel,
        cells,
      };
    });

    setMatrixRows(rows);
  }, [targetStudents, activeSubjects, selectedSemester, selectedRombel, grades]);

  // Handle cell numeric input change with real-time validation
  const handleCellChange = (studentId: string, subjectId: string, rawVal: string) => {
    setMatrixRows((prev) =>
      prev.map((row) => {
        if (row.studentId !== studentId) return row;

        let error: string | undefined = undefined;
        const trimmed = rawVal.trim();

        if (trimmed !== '') {
          const num = Number(trimmed);
          if (isNaN(num)) {
            error = 'Hanya angka';
          } else if (num < 0 || num > 100) {
            error = '0 - 100';
          }
        }

        return {
          ...row,
          cells: {
            ...row.cells,
            [subjectId]: {
              val: rawVal,
              error,
              isDirty: true,
            },
          },
        };
      })
    );
  };

  // Check if any row has unsaved changes
  const hasDirtyRows = useMemo(() => {
    return matrixRows.some((row) =>
      Object.values(row.cells).some((cell: CellState) => cell.isDirty)
    );
  }, [matrixRows]);

  // Save all entered grades across all active subjects for this semester in one atomic batch
  const handleSaveAll = () => {
    // Check validation
    for (const row of matrixRows) {
      for (const [subjId, cell] of Object.entries(row.cells) as [string, CellState][]) {
        if (cell.error) {
          const subj = activeSubjects.find((s) => s.id === subjId);
          addToast(
            'error',
            `Nilai untuk ${row.nama} pada mapel ${subj?.nama_mapel || subjId} tidak valid (${cell.error}). Harus berupa angka 0 - 100.`
          );
          return;
        }
      }
    }

    const itemsToSave: Array<{
      studentId: string;
      subjectId: string;
      semester: SemesterCode;
      kelas: '4' | '5' | '6';
      rombel: string;
      nilaiAkhir: number | null;
      catatan?: string;
    }> = [];

    matrixRows.forEach((row) => {
      activeSubjects.forEach((subject) => {
        const cell = row.cells[subject.id];
        const val = cell ? cell.val.trim() : '';
        const num = val !== '' && !isNaN(Number(val)) ? Number(val) : null;

        itemsToSave.push({
          studentId: row.studentId,
          subjectId: subject.id,
          semester: selectedSemester,
          kelas: derivedKelas,
          rombel: selectedRombel,
          nilaiAkhir: num,
          catatan: '',
        });
      });
    });

    saveGradesBatch(itemsToSave);
    setLastSavedTime(new Date().toLocaleTimeString('id-ID'));

    // Mark all cells as clean
    setMatrixRows((prev) =>
      prev.map((row) => {
        const cleanedCells: Record<string, CellState> = {};
        (Object.entries(row.cells) as [string, CellState][]).forEach(([subjId, cell]) => {
          cleanedCells[subjId] = { ...cell, isDirty: false };
        });
        return { ...row, cells: cleanedCells };
      })
    );

    addToast(
      'success',
      `Berhasil menyimpan nilai untuk ${matrixRows.length} siswa pada ${activeSubjects.length} mata pelajaran (${currentSemesterMeta.shortLabel}).`
    );
  };

  // Quick Action: Fill empty cells with KKTP (75)
  const handleQuickFillKKTP = () => {
    let filledCount = 0;
    setMatrixRows((prev) =>
      prev.map((row) => {
        const updatedCells: Record<string, CellState> = {};
        activeSubjects.forEach((subject) => {
          const currentCell = row.cells[subject.id];
          if (!currentCell || currentCell.val.trim() === '') {
            filledCount++;
            updatedCells[subject.id] = {
              val: String(subject.kktp || 75),
              error: undefined,
              isDirty: true,
            };
          } else {
            updatedCells[subject.id] = currentCell;
          }
        });
        return { ...row, cells: updatedCells };
      })
    );

    addToast(
      'info',
      `${filledCount} sel kosong telah diisi dengan nilai standar KKTP. Klik "Simpan Semua Nilai" untuk mempermanenkan.`
    );
  };

  // Download template for current selected semester with all subjects combined in columns
  const handleDownloadSemesterTemplate = () => {
    ExcelService.downloadGradeTemplate({
      semester: selectedSemester,
      rombel: selectedRombel,
      subjects: activeSubjects,
      students: targetStudents,
      includeStudents: true,
    });
    addToast(
      'info',
      `Template Excel format gabungan (${currentSemesterMeta.shortLabel}) untuk rombel ${selectedRombel} berhasil diunduh.`
    );
  };

  // Download complete package workbook with all semesters (Semester 1 - Kelas 4 s.d. Semester 2 - Kelas 6)
  const handleDownloadAllSemestersPackage = () => {
    ExcelService.downloadAllSemestersGradePackage({
      rombel: selectedRombel,
      subjects: activeSubjects,
      students: targetStudents,
      includeStudents: true,
    });
    addToast(
      'success',
      `Paket Excel Lengkap Semua Semester (6 Sheet) untuk rombel ${selectedRombel} berhasil diunduh.`
    );
  };

  // Export current table with all subjects and student averages to Excel
  const handleExportCurrentTable = () => {
    ExcelService.exportGradeTable({
      students: targetStudents,
      subjects: activeSubjects,
      semester: selectedSemester,
      rombel: selectedRombel,
      grades,
      settings,
    });
    addToast(
      'success',
      `Tabel nilai rapor ${currentSemesterMeta.shortLabel} rombel ${selectedRombel} berhasil diekspor ke Excel.`
    );
  };

  // Handle Excel File Selected for Import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        addToast('error', 'Format file tidak didukung. Harap unggah file spreadsheet Excel (.xlsx atau .xls).');
        return;
      }
      setImportFile(file);
      setIsProcessingImport(true);

      try {
        const preview = await ExcelService.parseGradeFile(file, students, activeSubjects, selectedSemester);
        setImportPreviewRows(preview.rows);

        const uniqueStudentsSet = new Set(preview.rows.filter((r) => r.isValid).map((r) => r.nisn));
        const uniqueSubjectsSet = new Set(preview.rows.filter((r) => r.isValid).map((r) => r.mapel));

        setImportStats({
          total: preview.totalRows,
          valid: preview.validCount,
          invalid: preview.invalidCount,
          uniqueStudents: uniqueStudentsSet.size,
          uniqueSubjects: uniqueSubjectsSet.size,
        });
      } catch (err: any) {
        addToast('error', err.message || 'Gagal membaca isi file Excel.');
        setImportFile(null);
        setImportPreviewRows([]);
        setImportStats(null);
      } finally {
        setIsProcessingImport(false);
      }
    }
  };

  // Apply parsed Excel rows into current table or directly save them
  const handleApplyImport = (directSave: boolean = false) => {
    if (importPreviewRows.length === 0) return;

    let appliedCount = 0;
    const itemsToSave: Array<{
      studentId: string;
      subjectId: string;
      semester: SemesterCode;
      kelas: '4' | '5' | '6';
      rombel: string;
      nilaiAkhir: number | null;
      catatan?: string;
    }> = [];

    // Map rows for fast lookup
    // Key: `${nisn}_${subjectId}_${semester}`
    const importedMap = new Map<string, GradeImportPreview>();
    importPreviewRows.forEach((r) => {
      if (r.isValid && r.nilai_akhir !== null) {
        const sKey = `${r.nisn}_${r.subject_id || r.mapel.toLowerCase()}_${r.semester}`;
        importedMap.set(sKey, r);

        // Also index for current semester match
        const sKeyCurrent = `${r.nisn}_${r.subject_id || r.mapel.toLowerCase()}`;
        importedMap.set(sKeyCurrent, r);

        const matchedStudent = students.find((s) => s.nisn === r.nisn);
        const matchedSubject = activeSubjects.find(
          (sub) => sub.id === r.subject_id || sub.nama_mapel.toLowerCase() === r.mapel.toLowerCase()
        );

        if (matchedStudent && matchedSubject) {
          itemsToSave.push({
            studentId: matchedStudent.id,
            subjectId: matchedSubject.id,
            semester: r.semester,
            kelas: r.kelas,
            rombel: matchedStudent.rombel || r.rombel,
            nilaiAkhir: r.nilai_akhir,
            catatan: '',
          });
        }
      }
    });

    // Update current table view
    setMatrixRows((prev) =>
      prev.map((row) => {
        let rowModified = false;
        const updatedCells = { ...row.cells };

        activeSubjects.forEach((sub) => {
          // Lookup exact or semester-agnostic match
          const item =
            importedMap.get(`${row.nisn}_${sub.id}_${selectedSemester}`) ||
            importedMap.get(`${row.nisn}_${sub.id}`) ||
            importedMap.get(`${row.nisn}_${sub.nama_mapel.toLowerCase()}`);

          if (item && item.nilai_akhir !== null) {
            appliedCount++;
            rowModified = true;
            updatedCells[sub.id] = {
              val: String(item.nilai_akhir),
              error: undefined,
              isDirty: true,
            };
          }
        });

        return rowModified ? { ...row, cells: updatedCells } : row;
      })
    );

    if (directSave && itemsToSave.length > 0) {
      saveGradesBatch(itemsToSave);
      setLastSavedTime(new Date().toLocaleTimeString('id-ID'));
      addToast(
        'success',
        `Berhasil menyimpan ${itemsToSave.length} nilai dari file Excel langsung ke database sistem.`
      );
    } else {
      addToast(
        'success',
        `Berhasil memuat ${appliedCount} nilai dari file Excel ke tabel ini. Klik "Simpan Semua Nilai" untuk mempermanenkan.`
      );
    }

    setIsImportModalOpen(false);
    setImportFile(null);
    setImportPreviewRows([]);
    setImportStats(null);
  };

  // Filtered rows by search query
  const filteredMatrixRows = useMemo(() => {
    if (!searchQuery.trim()) return matrixRows;
    const q = searchQuery.toLowerCase().trim();
    return matrixRows.filter(
      (r) => r.nama.toLowerCase().includes(q) || r.nisn.includes(q)
    );
  }, [matrixRows, searchQuery]);

  // Overall calculations per student row
  const rowAverages = useMemo(() => {
    const map = new Map<string, { avg: number | null; tuntasCount: number; totalEntered: number }>();

    matrixRows.forEach((row) => {
      let sum = 0;
      let count = 0;
      let tuntas = 0;

      activeSubjects.forEach((sub) => {
        const cell = row.cells[sub.id];
        if (cell && cell.val.trim() !== '' && !isNaN(Number(cell.val))) {
          const num = Number(cell.val);
          if (num >= 0 && num <= 100) {
            sum += num;
            count++;
            if (num >= (sub.kktp || 75)) {
              tuntas++;
            }
          }
        }
      });

      const avg = count > 0 ? Math.round((sum / count) * 10) / 10 : null;
      map.set(row.studentId, { avg, tuntasCount: tuntas, totalEntered: count });
    });

    return map;
  }, [matrixRows, activeSubjects]);

  // Column statistics (average per subject)
  const columnAverages = useMemo(() => {
    const map = new Map<string, { avg: number | null; count: number }>();

    activeSubjects.forEach((sub) => {
      let sum = 0;
      let count = 0;

      matrixRows.forEach((row) => {
        const cell = row.cells[sub.id];
        if (cell && cell.val.trim() !== '' && !isNaN(Number(cell.val))) {
          const num = Number(cell.val);
          if (num >= 0 && num <= 100) {
            sum += num;
            count++;
          }
        }
      });

      map.set(sub.id, {
        avg: count > 0 ? Math.round((sum / count) * 10) / 10 : null,
        count,
      });
    });

    return map;
  }, [matrixRows, activeSubjects]);

  const isAuthorized = canAccessRombel(selectedRombel);

  return (
    <div className="space-y-5">
      {/* Top Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs no-print">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Input Nilai Rapor</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Input Nilai Rapor
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Seluruh mata pelajaran digabungkan dalam satu tabel terpadu, dikelompokkan masing-masing per semester dari Semester 1 - Kelas 4 dan seterusnya.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {lastSavedTime && (
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tersimpan {lastSavedTime}</span>
            </span>
          )}

          {/* Unduh Template Format Excel Semester Ini */}
          <button
            type="button"
            onClick={handleDownloadSemesterTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
            title="Unduh format template Excel untuk semester ini (semua mapel digabung dalam 1 file)"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Format Excel ({currentSemesterMeta.shortLabel})</span>
          </button>

          {/* Unduh Paket Lengkap 6 Semester */}
          <button
            type="button"
            onClick={handleDownloadAllSemestersPackage}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition-all border border-purple-200 cursor-pointer"
            title="Unduh paket lengkap semua semester (Semester 1 - Kelas 4 s.d. Semester 2 - Kelas 6 dalam 6 sheet)"
          >
            <FolderDown className="w-3.5 h-3.5 text-purple-600" />
            <span>Paket 6 Semester (.xlsx)</span>
          </button>

          {/* Ekspor Tabel Saat Ini */}
          <button
            type="button"
            onClick={handleExportCurrentTable}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-200 cursor-pointer"
            title="Ekspor tabel nilai saat ini lengkap dengan rata-rata ke Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor Leger</span>
          </button>

          {/* Impor Nilai Excel */}
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-all border border-blue-200 cursor-pointer"
            title="Unggah file Excel (format gabungan atau paket semua semester)"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Impor Excel</span>
          </button>

          {/* Simpan Button */}
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={!isAuthorized || matrixRows.length === 0}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              hasDirtyRows
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 ring-2 ring-blue-500/20 animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{hasDirtyRows ? 'Simpan Perubahan*' : 'Simpan Semua Nilai'}</span>
          </button>
        </div>
      </div>

      {/* Semester Selector Navigation Pills: Smt 1 - Kelas 4 s.d. Smt 2 - Kelas 6 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Pilih Semester
            </span>
          </div>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
            {currentSemesterMeta.fase}
          </span>
        </div>

        {/* Chronological Semester Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {SEMESTER_OPTIONS.map((opt) => {
            const isSelected = selectedSemester === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => setSelectedSemester(opt.code)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                  <span>{opt.shortLabel}</span>
                </div>
                <span
                  className={`text-[10px] font-normal ${
                    isSelected ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {opt.fase}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rombel & Filter Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Rombel Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Rombel:</span>
            <select
              value={selectedRombel}
              disabled={!isAdmin && Boolean(currentUser?.rombel)}
              onChange={(e) => setSelectedRombel(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-800 cursor-pointer"
            >
              {availableRombels.map((r) => (
                <option key={r.id} value={r.nama}>
                  Rombel {r.nama} (Kelas {r.kelas})
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Focus Subject Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Tampilan Kolom:</span>
            <select
              value={focusedSubjectId}
              onChange={(e) => setFocusedSubjectId(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua Mata Pelajaran (Gabungan)</option>
              {activeSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  Fokus Mapel: [{s.kode}] {s.nama_mapel}
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Search Student */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa / NISN..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 w-48"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Fill Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleQuickFillKKTP}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-200"
            title="Isi semua sel nilai yang masih kosong dengan nilai standar KKTP (75)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Isi KKTP (75) ke Sel Kosong</span>
          </button>
        </div>
      </div>

      {/* Permission Warning if not authorized */}
      {!isAuthorized && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Anda sedang melihat data rombel <strong>{selectedRombel}</strong> dalam mode pratinjau (hanya baca).
            Akun Anda tidak memiliki hak akses simpan untuk rombel ini.
          </span>
        </div>
      )}

      {/* Official Print Kop */}
      <div className="hidden print:flex items-center gap-4 border-b-2 border-black pb-3 mb-4 font-serif">
        <img
          src={settings.logo_url || "https://i.ibb.co.com/rRhHc2PD/logo-bakot-01.png"}
          alt="Logo"
          className="w-16 h-16 object-contain shrink-0"
        />
        <div className="flex-1 text-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            PEMERINTAH KABUPATEN BEKASI • DINAS PENDIDIKAN
          </h3>
          <h1 className="text-base font-black text-slate-900 tracking-tight">{settings.nama_sekolah}</h1>
          <p className="text-[10px] text-slate-600">
            {settings.alamat_sekolah} • NSS: {settings.nss || '-'} • NPSN: {settings.npsn || '-'}
          </p>
          <p className="text-xs font-bold mt-1 text-slate-900 underline uppercase">
            LEGER NILAI RAPOR PESERTA DIDIK • {currentSemesterMeta.label.toUpperCase()} • ROMBEL {selectedRombel} • T.A. {settings.tahun_ajaran}
          </p>
        </div>
      </div>

      {/* Main Combined Grade Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden printable-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-10 text-center border-r border-slate-200 sticky left-0 bg-slate-50 z-10">
                  No
                </th>
                <th className="py-3 px-3 w-28 border-r border-slate-200 sticky left-10 bg-slate-50 z-10">
                  NISN
                </th>
                <th className="py-3 px-3 min-w-[170px] border-r border-slate-200 sticky left-38 bg-slate-50 z-10">
                  Nama Siswa
                </th>
                <th className="py-3 px-2 w-14 text-center border-r border-slate-200">
                  Rombel
                </th>

                {/* Combined Subject Columns */}
                {displayedSubjects.map((sub) => (
                  <th
                    key={sub.id}
                    className="py-2.5 px-2 w-24 text-center border-r border-slate-200 bg-blue-50/50 text-slate-800"
                    title={`${sub.nama_mapel} — KKTP: ${sub.kktp || 75}`}
                  >
                    <div className="font-extrabold text-[11px] text-blue-900 tracking-tight">
                      {sub.kode || sub.nama_mapel}
                    </div>
                    <div className="text-[9px] font-normal text-slate-500 truncate max-w-[85px] mx-auto">
                      KKTP: {sub.kktp || 75}
                    </div>
                  </th>
                ))}

                {/* Calculated Average & Ketuntasan */}
                <th className="py-3 px-3 w-20 text-center border-r border-slate-200 bg-emerald-50/80 text-emerald-950 font-black">
                  Rata²
                </th>
                <th className="py-3 px-3 w-28 text-center bg-slate-50 text-slate-700 font-bold">
                  Ketuntasan
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredMatrixRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={displayedSubjects.length + 6}
                    className="py-12 text-center text-slate-400"
                  >
                    <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600">Tidak ada siswa yang ditemukan</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Periksa pilihan Rombel atau kata kunci pencarian.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMatrixRows.map((row, idx) => {
                  const stat = rowAverages.get(row.studentId) || {
                    avg: null,
                    tuntasCount: 0,
                    totalEntered: 0,
                  };
                  const isAllTuntas = stat.totalEntered > 0 && stat.tuntasCount === stat.totalEntered;

                  return (
                    <tr
                      key={row.studentId}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* No */}
                      <td className="py-2 px-3 text-center text-slate-500 font-mono border-r border-slate-100 sticky left-0 bg-white z-10">
                        {idx + 1}
                      </td>

                      {/* NISN */}
                      <td className="py-2 px-3 font-mono font-bold text-slate-700 border-r border-slate-100 sticky left-10 bg-white z-10">
                        {row.nisn}
                      </td>

                      {/* Nama Siswa */}
                      <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-100 sticky left-38 bg-white z-10 truncate max-w-[200px]">
                        {row.nama}
                      </td>

                      {/* Rombel */}
                      <td className="py-2 px-2 text-center border-r border-slate-100">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {row.rombel}
                        </span>
                      </td>

                      {/* Subject Input Cells */}
                      {displayedSubjects.map((sub) => {
                        const cell = row.cells[sub.id] || { val: '', isDirty: false };
                        const rawVal = cell.val.trim();
                        const num = rawVal !== '' && !isNaN(Number(rawVal)) ? Number(rawVal) : null;
                        const kktp = sub.kktp || 75;
                        const isTuntas = num !== null && num >= kktp;
                        const isUnderKktp = num !== null && num < kktp;

                        return (
                          <td
                            key={sub.id}
                            className={`py-1.5 px-1.5 text-center border-r border-slate-100 ${
                              cell.isDirty ? 'bg-amber-50/40' : ''
                            }`}
                          >
                            <div className="relative inline-block w-full max-w-[70px]">
                              <input
                                type="text"
                                inputMode="numeric"
                                disabled={!isAuthorized}
                                value={cell.val}
                                onChange={(e) => handleCellChange(row.studentId, sub.id, e.target.value)}
                                placeholder="—"
                                className={`w-full h-7 text-center font-bold text-xs font-mono rounded-lg border transition-all ${
                                  cell.error
                                    ? 'bg-rose-50 border-rose-400 text-rose-700 focus:ring-2 focus:ring-rose-400/20'
                                    : isTuntas
                                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900 font-extrabold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs'
                                    : isUnderKktp
                                    ? 'bg-amber-50/60 border-amber-300 text-amber-900 font-extrabold focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20'
                                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                } disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed`}
                                title={`${row.nama} - ${sub.nama_mapel} (KKTP: ${kktp})`}
                              />
                              {cell.error && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Rata-Rata */}
                      <td className="py-2 px-2 text-center border-r border-slate-100 bg-emerald-50/20 font-mono font-black text-slate-800">
                        {stat.avg !== null ? (
                          <span
                            className={
                              stat.avg >= 75
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }
                          >
                            {stat.avg.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-normal">—</span>
                        )}
                      </td>

                      {/* Ketuntasan */}
                      <td className="py-2 px-2 text-center">
                        {stat.totalEntered > 0 ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isAllTuntas
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {isAllTuntas && <CheckCircle2 className="w-2.5 h-2.5" />}
                            <span>
                              {stat.tuntasCount}/{stat.totalEntered} Tuntas
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Footer Summary: Average per Subject */}
            {filteredMatrixRows.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100/80 border-t-2 border-slate-200 font-bold text-slate-700 text-[11px]">
                  <td
                    colSpan={4}
                    className="py-3 px-3 text-right pr-4 font-black uppercase text-slate-600 sticky left-0 bg-slate-100 z-10"
                  >
                    Rata-Rata Kelas:
                  </td>

                  {displayedSubjects.map((sub) => {
                    const colStat = columnAverages.get(sub.id) || { avg: null, count: 0 };
                    return (
                      <td
                        key={sub.id}
                        className="py-3 px-2 text-center border-r border-slate-200 font-mono font-black"
                      >
                        {colStat.avg !== null ? (
                          <span
                            className={
                              colStat.avg >= (sub.kktp || 75)
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }
                          >
                            {colStat.avg.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    );
                  })}

                  <td className="py-3 px-2 text-center font-mono font-black text-blue-900 border-r border-slate-200 bg-emerald-100/50">
                    {(() => {
                      const allAverages = Array.from(columnAverages.values())
                        .map((c) => (c as { avg: number | null; count: number }).avg)
                        .filter((a): a is number => a !== null);
                      if (allAverages.length === 0) return '—';
                      return (allAverages.reduce((a, b) => a + b, 0) / allAverages.length).toFixed(1);
                    })()}
                  </td>
                  <td className="py-3 px-2 text-center text-[10px] text-slate-500">
                    {filteredMatrixRows.length} Siswa
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Tanda Tangan Resmi (Hanya tampil saat dicetak) */}
        <div className="hidden print:grid grid-cols-2 gap-8 mt-8 p-4 text-xs text-center font-serif">
          <div>
            <p>Mengetahui,</p>
            <p>Kepala {settings.nama_sekolah}</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{settings.nama_kepsek || '....................................'}</p>
            <p>NIP. {settings.nip_kepsek || '-'}</p>
          </div>
          <div>
            <p>{settings.kecamatan || 'Bekasi'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p>Guru Kelas / Rombel {selectedRombel}</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{currentUser?.nama || '....................................'}</p>
            <p>NIP. {currentUser?.nip || '-'}</p>
          </div>
        </div>
      </div>

      {/* Modal: Impor Nilai dari Excel */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Impor Nilai Rapor dari Excel
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mendukung format gabungan (seluruh mapel dalam kolom) atau paket multi-semester (6 sheet).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportFile(null);
                  setImportPreviewRows([]);
                  setImportStats(null);
                }}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Drop area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileSpreadsheet className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                {importFile ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800 font-mono">
                      {importFile.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {(importFile.size / 1024).toFixed(1)} KB • Klik untuk ganti file
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">
                      Klik atau pilih file Excel (.xlsx / .xls)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Format kolom otomatis dicocokkan berdasarkan NISN / Nama Siswa dan Mata Pelajaran
                    </p>
                  </div>
                )}
              </div>

              {/* Processing Spinner */}
              {isProcessingImport && (
                <div className="flex items-center justify-center gap-2 py-4 text-xs text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Membaca dan memverifikasi data Excel...</span>
                </div>
              )}

              {/* Preview Stats */}
              {importStats && (
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs space-y-2 text-blue-950">
                  <div className="font-bold flex items-center gap-1.5 text-blue-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Hasil Pembacaan File Excel:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div className="bg-white/80 p-2 rounded-lg border border-blue-100">
                      <span className="text-[10px] text-slate-500 block">Total Nilai Valid</span>
                      <strong className="text-sm text-emerald-700">{importStats.valid} nilai</strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-blue-100">
                      <span className="text-[10px] text-slate-500 block">Siswa & Mapel Terdeteksi</span>
                      <strong className="text-sm text-blue-700">{importStats.uniqueStudents} Siswa • {importStats.uniqueSubjects} Mapel</strong>
                    </div>
                  </div>
                  {importStats.invalid > 0 && (
                    <p className="text-[11px] text-rose-600">
                      *Terdapat {importStats.invalid} nilai tidak valid (&lt;0 atau &gt;100 atau siswa tidak cocok).
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportFile(null);
                  setImportPreviewRows([]);
                  setImportStats(null);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!importStats || importStats.valid === 0}
                  onClick={() => handleApplyImport(false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Terapkan nilai ke dalam tabel ini untuk diperiksa terlebih dahulu"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Terapkan ke Tabel</span>
                </button>

                <button
                  type="button"
                  disabled={!importStats || importStats.valid === 0}
                  onClick={() => handleApplyImport(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Simpan langsung seluruh nilai yang terbaca ke database sistem"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Langsung ke Sistem</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
