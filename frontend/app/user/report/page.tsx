"use client";

import { useState, useRef } from "react";
import { ChevronDown, Calendar, FileText, Upload, Info, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { API } from "@/src/meta/api";

const leaveReasons = [
  "Sick Leave",
  "Family Emergency",
  "Medical Appointment",
  "Personal Reason",
  "Other",
];

export default function AbsenceReportingPage() {
  const router = useRouter();
  const [leaveType, setLeaveType] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async () => {
    if (!leaveType) {
      alert("Pilih jenis izin terlebih dahulu.");
      return;
    }
    if (!startDate) {
      alert("Tanggal mulai wajib diisi.");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("jenis", leaveType);
      formData.append("tanggal", startDate);
      if (endDate) formData.append("tanggal_selesai", endDate);
      if (description) formData.append("keterangan", description);
      if (file) formData.append("dokumen", file);

      const response = await fetch(API.SUBMIT_IZIN_DETAIL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal mengirim pengajuan.");
        return;
      }

      alert(data.message);
      router.push("/user/dashboard");
    } catch (error) {
      console.error("Error submit izin:", error);
      alert("Terjadi kesalahan, coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-10 font-sans">

      {/* ── Header ── */}
      <div className="bg-white px-5 pt-10 pb-5 border-b border-gray-100 relative">
        <div className="absolute top-8 right-5 w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
          <FileText size={26} className="text-rose-300" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 pr-16">Absence Reporting</h1>
        <p className="text-[12px] text-gray-400 mt-1 pr-16 leading-relaxed">
          Please provide accurate details for your request.
        </p>
      </div>

      <div className="px-4 pt-5 space-y-4">

        {/* ── Leave Type ── */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
            Leave Type
          </label>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex items-center justify-between shadow-sm"
            >
              <span className={`text-[14px] ${leaveType ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                {leaveType || "Select a reason"}
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {showDropdown && (
              <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {leaveReasons.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setLeaveType(r); setShowDropdown(false); }}
                    className={`w-full text-left px-4 py-3 text-[14px] transition-colors ${
                      leaveType === r
                        ? "bg-rose-50 text-rose-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Start Date ── */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
            Start Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-[14px] text-gray-700 shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
            />
            <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* ── End Date ── */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
            End Date <span className="text-gray-300 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-[14px] text-gray-700 shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
            />
            <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* ── Description / Notes ── */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
            Description / Notes
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter additional details about your request..."
            rows={4}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-[14px] text-gray-700 placeholder-gray-300 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
          />
        </div>

        {/* ── Supporting Documents ── */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
            Supporting Documents
          </label>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full bg-white border border-dashed border-gray-300 rounded-xl py-6 flex flex-col items-center gap-2 shadow-sm active:bg-gray-50 transition-colors"
          >
            {fileName ? (
              <>
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <FileText size={20} className="text-green-600" strokeWidth={1.8} />
                </div>
                <p className="text-[12px] text-gray-700 font-medium px-4 text-center truncate max-w-full">{fileName}</p>
                <p className="text-[11px] text-gray-400">Tap to change file</p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Upload size={20} className="text-gray-400" strokeWidth={1.8} />
                </div>
                <p className="text-[13px] font-semibold text-gray-600">Tap to upload files</p>
                <p className="text-[11px] text-gray-400">PDF, JPG or PNG (Max 5MB)</p>
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFile}
            className="hidden"
          />
        </div>

        {/* ── Actions ── */}
        <div className="space-y-3 pt-1">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-rose-700 hover:bg-rose-800 active:bg-rose-900 disabled:bg-gray-300 text-white font-bold text-[15px] py-4 rounded-xl transition-colors duration-200 shadow-sm"
          >
            {submitting ? "Mengirim..." : "Submit Request"}
          </button>
          <button
            onClick={() => router.push("/user/dashboard")}
            className="w-full bg-white border border-gray-200 text-gray-700 font-semibold text-[15px] py-4 rounded-xl transition-colors active:bg-gray-50 shadow-sm"
          >
            Cancel
          </button>
        </div>

        {/* ── Reminder ── */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3.5 flex gap-3">
          <Info size={16} className="text-amber-500 mt-0.5 shrink-0" strokeWidth={2} />
          <p className="text-[12px] text-amber-800 leading-relaxed">
            <span className="font-bold">Reminder:</span> All sick leave requests exceeding 2 days require a valid medical certificate from a registered practitioner. Requests are usually processed within 24 business hours.
          </p>
        </div>

      </div>
    </div>
  );
}