"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

interface FormState {
  nik: string;
  nama_lengkap: string;
  tgl_lahir: string;
  jabatan: string;
  no_hp: string;
  alamat: string;
  email: string;
  username: string;
  password: string;
  role: "guru" | "admin";
}

const initialForm: FormState = {
  nik: "", nama_lengkap: "", tgl_lahir: "", jabatan: "", no_hp: "",
  alamat: "", email: "", username: "", password: "", role: "guru",
};

function Field({
  label, children, error,
}: { label: string; children: React.ReactNode; error?: string[] }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error[0]}</p>}
    </div>
  );
}

const inputClass =
  "w-full bg-slate-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-red-200";

export default function NewTeacherDataPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

    

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setSubmitError(null);

    try {
      const res = await fetch(`${API_BASE}/admin/guru`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.status === 422) {
        const data = await res.json();
        setErrors(data.errors ?? {});
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      router.push("/admin/teachersdata");
    } catch (err) {
      console.error(err);
      setSubmitError("Gagal menyimpan data. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 flex justify-center">
      <div className="w-[390px] min-h-[844px] flex flex-col">
        <div className="bg-white px-4 pt-12 pb-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-800">Tambah Data Guru</h1>
            <p className="text-xs text-slate-400 mt-0.5">Lengkapi data diri & akun guru</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 px-4 pt-4 pb-24">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Data Diri</h2>

          <Field label="NIK" error={errors.nik}>
            <input type="text" value={form.nik} onChange={(e) => update("nik", e.target.value)} className={inputClass} placeholder="NIK Guru" required />
          </Field>

          <Field label="Nama Lengkap" error={errors.nama_lengkap}>
            <input type="text" value={form.nama_lengkap} onChange={(e) => update("nama_lengkap", e.target.value)} className={inputClass} placeholder="Nama Guru + Gelar" required />
          </Field>

          <Field label="Tanggal Lahir" error={errors.tgl_lahir}>
            <input type="date" value={form.tgl_lahir} onChange={(e) => update("tgl_lahir", e.target.value)} className={inputClass} />
          </Field>

          <Field label="Jabatan" error={errors.jabatan}>
            <input type="text" value={form.jabatan} onChange={(e) => update("jabatan", e.target.value)} className={inputClass} placeholder="Jabatan Guru" required />
          </Field>

          <Field label="No. HP" error={errors.no_hp}>
            <input type="text" value={form.no_hp} onChange={(e) => update("no_hp", e.target.value)} className={inputClass} placeholder="No. Hp Guru" />
          </Field>

          <Field label="Alamat" error={errors.alamat}>
            <textarea value={form.alamat} onChange={(e) => update("alamat", e.target.value)} className={`${inputClass} resize-none`} rows={2} placeholder="Alamat Lengkap" />
          </Field>

          <Field label="Email" error={errors.email}>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} placeholder="Email Guru" />
          </Field>

          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 mt-6">Data Akun</h2>

          <Field label="Username" error={errors.username}>
            <input type="text" value={form.username} onChange={(e) => update("username", e.target.value)} className={inputClass} placeholder="Username Akun" required />
          </Field>

          <Field label="Password" error={errors.password}>
            <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} className={inputClass} placeholder="Minimal 6 karakter" required />
            <p className="text-[11px] text-slate-400 mt-1">Password otomatis di-hash sebelum disimpan.</p>
          </Field>

          <Field label="Role" error={errors.role}>
            <select value={form.role} onChange={(e) => update("role", e.target.value)} className={inputClass}>
              <option value="guru">Guru</option>
              <option value="admin">Admin</option>
            </select>
          </Field>

          {submitError && <p className="text-xs text-red-500 mb-3 text-center">{submitError}</p>}

          <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-1.5 bg-red-500 text-white text-sm font-semibold rounded-2xl py-3 hover:bg-red-600 disabled:opacity-60 transition-colors mt-2">
            <Save size={16} />
            {submitting ? "Menyimpan..." : "Simpan Data Guru"}
          </button>
        </form>
      </div>
    </div>
  );
}