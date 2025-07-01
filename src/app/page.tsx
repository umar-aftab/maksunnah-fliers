'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

interface Flyer {
  id: string;
  title: string;
  file_url: string;
  created_at: string;
}

function isImage(url: string) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}
function isPdf(url: string) {
  return /\.pdf$/i.test(url);
}

export default function FlyersPage() {
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlyers() {
      const { data, error } = await supabase
        .from('flyers')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setFlyers(data as Flyer[]);
      setLoading(false);
    }
    fetchFlyers();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 bg-[#F7F5F2] min-h-screen">
      <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="Maktabah As Sunnah Logo" className="h-20 w-auto mb-2" />
      </div>
      <h1 className="text-4xl font-bold mb-8 text-[#3F3D56]">Our Latest Flyers</h1>
      {loading && <div className="text-center text-lg text-[#A24C44]">Loading…</div>}
      <div className="space-y-4">
        {flyers.length === 0 && !loading && (
          <p className="text-[#2E2E2E] text-center text-lg">No flyers available yet. Check back soon!</p>
        )}
        {flyers.map(f => (
          <div
            key={f.id}
            className="flex items-center justify-between bg-white border border-[#C1A260] p-4 rounded shadow transition hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              {isImage(f.file_url) ? (
                <img
                  src={f.file_url}
                  alt={f.title}
                  className="w-16 h-16 object-cover rounded"
                />
              ) : isPdf(f.file_url) ? (
                <a
                  href={f.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View PDF"
                  className="block"
                >
                  <span className="inline-block w-12 h-12 bg-[#3F3D56] text-white rounded flex items-center justify-center text-2xl font-bold">
                    PDF
                  </span>
                </a>
              ) : null}
              <a
                href={f.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A24C44] text-lg font-bold underline hover:text-[#3F3D56] transition"
              >
                {f.title}
              </a>
            </div>
            <span className="text-xs text-[#2E2E2E] ml-2">{new Date(f.created_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
