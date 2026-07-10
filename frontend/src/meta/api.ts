

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const API = {
  // Authentication
  LOGIN: `${BASE_URL}/login`,
  ME: `${BASE_URL}/me`,

  // Absensi
  ABSENHARIINI: `${BASE_URL}/absensi/today`,
  CHECK_IN_ABSEN: `${BASE_URL}/absensi/check-in`,
  REKAP_ABSEN: `${BASE_URL}/absensi/detail`,
  HISTORY_ABSEN: `${BASE_URL}/absensi/history`,
  CHECK_OUT_ABSEN: `${BASE_URL}/absensi/check-out`,

  // Dashboard
  TOTAL_GURU: `${BASE_URL}/total-guru`,
  STATISTIK_TODAY: `${BASE_URL}/statistik-hari-ini`,
  DATA_GURU : `${BASE_URL}/admin/guru`,

  // Izin
  POST_STATUS_IZIN: `${BASE_URL}/izin/store`,
  BATAL_IZIN: `${BASE_URL}/izin/cancel`,
  SUBMIT_IZIN_DETAIL: `${BASE_URL}/izin/submit-detail`,
  IZIN_DETAIL: `${BASE_URL}/izin/detail`,
  IZIN_APPROVE: `${BASE_URL}/izin/approve`,
  IZIN_REJECT: `${BASE_URL}/izin/reject`,

  // Laporan
  LAPORAN: `${BASE_URL}/laporan`,
  LAPORAN_EXPORT_CSV: `${BASE_URL}/laporan/export-csv`,
  LAPORAN_EXPORT_XLSX: `${BASE_URL}/laporan/export-xlsx`,


  
};