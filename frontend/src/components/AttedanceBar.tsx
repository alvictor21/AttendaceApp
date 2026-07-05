"use client"
import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

type HariStatistik = {
  hari: string;
  tanggal: string;
  jumlah_hadir: number;
  is_today: boolean;
  is_future: boolean;
};

type StatistikResponse = {
  minggu_mulai: string;
  minggu_selesai: string;
  data: HariStatistik[];
};

const WARNA_AKTIF = "#be123c";
const WARNA_NETRAL = "#e5e7eb";

function AttendanceBar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [statistik, setStatistik] = useState<StatistikResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const token = localStorage.getItem("token"); // sesuaikan dengan cara kamu simpan token sanctum
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch("http://localhost:8000/api/statistik/hadir-mingguan", {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) throw new Error("Gagal mengambil data statistik");

        const json: StatistikResponse = await res.json();
        if (isMounted) {
          setStatistik(json);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    // polling tiap 30 detik biar terasa real-time tanpa websocket
    const interval = setInterval(fetchData, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !statistik) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const labels = statistik.data.map((d) => d.hari);
    const values = statistik.data.map((d) => d.jumlah_hadir);
    const colors = statistik.data.map((d) => (d.is_today ? WARNA_AKTIF : WARNA_NETRAL));

    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.parsed.y} hadir`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: "#9ca3af", font: { size: 11 } },
          },
          y: { display: false },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [statistik]);

  if (loading && !statistik) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-400">
        Memuat data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-red-500">
        {error}
      </div>
    );
  }

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

export default AttendanceBar;