'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import { supabase } from '@/utils/supabaseClient';

interface Flyer {
  id: string;
  title: string;
  file_url: string;
  created_at: string;
}

export default function AdminFlyersPage() {
  // Admin login
  const [adminPass, setAdminPass] = useState('');
  const [inputPass, setInputPass] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);

  // Flyer states
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load admin password from env
  useEffect(() => {
    setAdminPass(process.env.NEXT_PUBLIC_ADMIN_PASS || '');
    fetchFlyers();
  }, []);

  // Fetch flyers from Supabase
  async function fetchFlyers() {
    const { data, error } = await supabase
      .from('flyers')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setFlyers(data as Flyer[]);
  }

  // Auth check
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (inputPass === adminPass) setIsAuthed(true);
    else alert('Wrong password');
  };

  // Upload & add flyer
  const handleAddFlyer = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file) return;
    setUploading(true);

    // 1. Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('flyers')
      .upload(fileName, file);

    if (storageError) {
      alert('Upload failed');
      setUploading(false);
      return;
    }

    // 2. Get public URL
    const storagePath = storageData?.path;
    if (!storagePath) {
        alert('Failed to get storage path');
        setUploading(false);
        return;
    }
    const { data: urlData } = supabase
        .storage
        .from('flyers')
        .getPublicUrl(storagePath);
    const publicUrl = urlData?.publicUrl;

    // 3. Save metadata to table
    const { data: newFlyer, error: insertError } = await supabase
      .from('flyers')
      .insert([{ title, file_url: publicUrl }])
      .select()
      .single();

    if (insertError) {
      alert('Database error');
    } else {
      setFlyers([newFlyer, ...flyers]);
      setTitle('');
      setFile(null);
    }
    setUploading(false);
  };

  // Delete flyer (from storage & db)
  const handleDelete = async (id: string, fileUrl: string) => {
    // Extract filename from URL
    const path = fileUrl.split('/flyers/')[1]?.split('?')[0];
    if (path) {
      await supabase.storage.from('flyers').remove([path]);
    }
    await supabase.from('flyers').delete().eq('id', id);
    setFlyers(flyers.filter(f => f.id !== id));
  };

  // ---- UI ----
  if (!isAuthed) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#F7F5F2]">
        <form onSubmit={handleLogin} className="p-8 bg-white rounded-lg shadow-xl space-y-6 border border-[#C1A260]">
          <h1 className="text-3xl font-bold text-[#3F3D56]">Admin Login</h1>
          <input
            type="password"
            placeholder="Enter admin password"
            value={inputPass}
            onChange={e => setInputPass(e.target.value)}
            className="border border-[#C1A260] p-2 rounded w-72 focus:outline-[#A24C44]"
          />
          <button
            type="submit"
            className="bg-[#A24C44] text-[#F7F5F2] font-bold px-4 py-2 rounded hover:bg-[#B55C50] w-full transition"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 bg-[#F7F5F2] min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-[#3F3D56]">Upload Flyers</h1>
      <form
        onSubmit={handleAddFlyer}
        className="space-y-5 mb-10 bg-white rounded-xl shadow p-6 border border-[#C1A260]"
      >
        <div>
          <label className="block text-[#A24C44] font-semibold mb-1">Flyer Title</label>
          <input
            type="text"
            placeholder="Flyer Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border border-[#C1A260] rounded px-3 py-2 w-full focus:outline-[#A24C44]"
            required
          />
        </div>
        <div>
          <label className="block text-[#A24C44] font-semibold mb-1">Upload PDF/Image</label>
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="border border-[#C1A260] rounded px-3 py-2 w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-[#A24C44] text-[#F7F5F2] font-bold px-6 py-2 rounded hover:bg-[#B55C50] w-full transition"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Add Flyer'}
        </button>
      </form>
      <div className="space-y-4">
        {flyers.length === 0 && (
          <p className="text-[#2E2E2E] text-center text-lg">No flyers yet. Add your first above!</p>
        )}
        {flyers.map(f => (
          <div
            key={f.id}
            className="flex justify-between items-center bg-white border border-[#C1A260] p-3 rounded shadow"
          >
            <a
              href={f.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A24C44] font-semibold underline hover:text-[#3F3D56] transition"
            >
              {f.title}
            </a>
            <button
              onClick={() => handleDelete(f.id, f.file_url)}
              className="text-sm text-red-600 hover:underline ml-6"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
