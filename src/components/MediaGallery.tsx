import React, { useState, useEffect, useRef } from "react";
import { UploadedImage, User } from "../types";
import { 
  Image as ImageIcon, 
  UploadCloud, 
  Trash2, 
  Edit2, 
  Copy, 
  Check, 
  Calendar, 
  FileText, 
  Loader2, 
  Eye, 
  AlertCircle,
  Sparkles,
  RefreshCw,
  User as UserIcon
} from "lucide-react";

interface MediaGalleryProps {
  token: string;
  user: User;
  onAvatarUpdate: (newAvatarUrl: string) => void;
}

export default function MediaGallery({ token, user, onAvatarUpdate }: MediaGalleryProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload States
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Edit States
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [updatingMetadata, setUpdatingMetadata] = useState(false);

  // Feedback states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, [token]);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/images", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
      } else {
        const body = await res.json();
        setError(body.error || "Failed to load uploaded images.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith("image/")) {
        setFile(droppedFile);
      } else {
        alert("Only image files are allowed.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", caption);

    try {
      const res = await fetch("/api/images/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const body = await res.json();

      if (res.ok) {
        setImages((prev) => [body.image, ...prev]);
        setFile(null);
        setCaption("");
        setUploadSuccess(true);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        setError(body.error || "Failed to upload image.");
      }
    } catch (err) {
      setError("Network error occurred while uploading image.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateCaption = async (id: string) => {
    setUpdatingMetadata(true);
    try {
      const res = await fetch(`/api/images/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ caption: editCaption })
      });

      if (res.ok) {
        const data = await res.json();
        setImages((prev) => prev.map((img) => img.id === id ? data.image : img));
        setEditingImageId(null);
      } else {
        const body = await res.json();
        alert(body.error || "Failed to update caption.");
      }
    } catch (err) {
      alert("Error updating image caption.");
    } finally {
      setUpdatingMetadata(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this image from the server?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/images/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== id));
      } else {
        const body = await res.json();
        alert(body.error || "Failed to delete image.");
      }
    } catch (err) {
      alert("Error deleting image.");
    }
  };

  const handleSetProfileAvatar = async (imageUrl: string) => {
    setAvatarLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ avatar: imageUrl })
      });

      if (res.ok) {
        onAvatarUpdate(imageUrl);
        alert("Your profile picture has been updated successfully!");
      } else {
        const body = await res.json();
        alert(body.error || "Failed to update profile avatar.");
      }
    } catch (err) {
      alert("Error updating avatar.");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAvatarUploadDirect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const avatarFile = e.target.files[0];

    setAvatarLoading(true);
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    try {
      const res = await fetch("/api/auth/avatar", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const body = await res.json();
      if (res.ok) {
        onAvatarUpdate(body.avatarUrl);
        // Refresh images list as well
        fetchImages();
        alert("Avatar uploaded and updated successfully!");
      } else {
        alert(body.error || "Failed to upload avatar.");
      }
    } catch (err) {
      alert("Error connecting to server to upload avatar.");
    } finally {
      setAvatarLoading(false);
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10" id="media-gallery-root">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase font-bold">Venture Assets</span>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Media Gallery & Upload Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-semibold mt-1">
            Upload, secure, and manage visual artifacts, competitor screenshots, and founder profile branding.
          </p>
        </div>
        <button 
          onClick={fetchImages}
          className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold tracking-tight transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Media
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-2xl flex items-center gap-2.5 mb-8 animate-fade-in" id="gallery-error-alert">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Direct Upload Portal */}
        <div className="lg:col-span-1 space-y-6" id="upload-form-panel">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-9 h-9 bg-slate-800 border border-slate-700 text-indigo-400 rounded-xl flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-white tracking-tight">
                  Upload Portal
                </h4>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                  Secure File Intake
                </p>
              </div>
            </div>

            {/* Drag and Drop Area */}
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div 
                className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all ${
                  dragActive 
                    ? "border-indigo-500 bg-indigo-500/5 scale-98" 
                    : file 
                    ? "border-emerald-500/50 bg-emerald-500/5" 
                    : "border-slate-800 hover:border-slate-700 bg-slate-950/40"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: "pointer" }}
                id="drop-zone"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  accept="image/*" 
                  className="hidden" 
                />

                {file ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mx-auto">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {formatSize(file.size)}
                      </p>
                    </div>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-700 text-[10px] text-slate-300 font-semibold rounded-lg transition-all"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <UploadCloud className="w-8 h-8 text-slate-500 mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-slate-300">
                        Drag & Drop or Click to browse
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        JPEG, PNG, GIF, WEBP up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Caption Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Image Caption / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Competitor platform screenshot"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-800 rounded-xl text-xs bg-slate-950/60 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-200 font-medium placeholder:text-slate-600"
                  id="image-caption-input"
                />
              </div>

              <button
                type="submit"
                disabled={!file || uploading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 disabled:text-slate-500 text-white rounded-xl text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
                id="image-upload-submit"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Securing File Upload...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    Upload Image to Server
                  </>
                )}
              </button>

              {uploadSuccess && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold rounded-xl text-center animate-fade-in">
                  Image uploaded successfully and stored in server!
                </div>
              )}
            </form>

            {/* Profile Avatar Quick Upload Panel */}
            <div className="border-t border-slate-800/80 pt-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Profile Photo Intake</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Directly upload a custom avatar. Files are stored and applied to your founder identity profile.
              </p>
              
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-white text-sm font-bold shadow-xs shrink-0 overflow-hidden">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                  {avatarLoading && (
                    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <input
                    type="file"
                    id="avatar-upload-file"
                    accept="image/*"
                    onChange={handleAvatarUploadDirect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={avatarLoading}
                    onClick={() => document.getElementById("avatar-upload-file")?.click()}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700/80 disabled:bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-bold tracking-tight transition-all cursor-pointer"
                  >
                    Upload Avatar
                  </button>
                  <p className="text-[9px] text-slate-500">Auto-saves to database.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right 2 Columns: Visual Media Catalog */}
        <div className="lg:col-span-2 space-y-6" id="media-catalog-panel">
          
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                <h4 className="font-display font-bold text-white text-sm">
                  Visual Media Library
                </h4>
                <span className="font-mono text-[10px] bg-slate-850 text-slate-400 border border-slate-750 px-2 py-0.5 rounded-full font-bold">
                  {images.length} File{images.length !== 1 && "s"}
                </span>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                Durable Server Disk storage
              </div>
            </div>

            {loading ? (
              <div className="py-24 text-center flex flex-col items-center justify-center space-y-3" id="gallery-loading">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                <span className="text-xs text-slate-400 font-mono tracking-widest uppercase">Fetching Visual Ledger...</span>
              </div>
            ) : images.length === 0 ? (
              <div className="py-20 text-center space-y-4 max-w-sm mx-auto" id="gallery-empty">
                <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
                <div>
                  <h5 className="font-display font-bold text-white text-sm">Visual Library Empty</h5>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">No secure assets uploaded yet. Use the Upload Portal on the left to securely save venture images to the server directory.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="images-grid">
                {images.map((img) => (
                  <div 
                    key={img.id}
                    className="bg-slate-950/40 border border-slate-850 rounded-2xl overflow-hidden group hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    {/* Visual Preview Container */}
                    <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-850">
                      <img 
                        src={img.url} 
                        alt={img.caption || img.originalName} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Floating overlay actions */}
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                        <a 
                          href={img.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 bg-slate-900 border border-slate-800 text-slate-200 hover:text-white rounded-lg transition-all"
                          title="Open in Full Size"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => copyToClipboard(img.url, img.id)}
                          className="p-2 bg-slate-900 border border-slate-800 text-slate-200 hover:text-white rounded-lg transition-all"
                          title="Copy Share Link"
                        >
                          {copiedId === img.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button 
                          onClick={() => handleSetProfileAvatar(img.url)}
                          className="p-2 bg-slate-900 border border-slate-800 text-indigo-400 hover:text-indigo-300 rounded-lg transition-all text-xs font-bold"
                          title="Set as Avatar"
                        >
                          <UserIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata & Description */}
                    <div className="p-4 space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[11px] font-mono text-slate-400 truncate max-w-[160px]" title={img.originalName}>
                            {img.originalName}
                          </p>
                          <span className="text-[9px] font-mono text-slate-500">
                            {formatSize(img.size)}
                          </span>
                        </div>

                        {/* Caption (CRUD Update) */}
                        {editingImageId === img.id ? (
                          <div className="flex gap-1.5 mt-2">
                            <input
                              type="text"
                              value={editCaption}
                              onChange={(e) => setEditCaption(e.target.value)}
                              className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-[11px] rounded-lg text-white font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                              placeholder="New Caption"
                            />
                            <button
                              onClick={() => handleUpdateCaption(img.id)}
                              disabled={updatingMetadata}
                              className="px-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 rounded-lg text-[10px] text-white font-bold"
                            >
                              {updatingMetadata ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                "Save"
                              )}
                            </button>
                            <button
                              onClick={() => setEditingImageId(null)}
                              className="px-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] text-slate-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs font-semibold text-white leading-normal line-clamp-2 mt-1 min-h-[16px]">
                            {img.caption || <span className="text-slate-600 italic font-medium">No caption registered</span>}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-850/60 pt-2.5 mt-1 text-[10px] font-semibold text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-600" />
                          <span>{new Date(img.uploadedAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {editingImageId !== img.id && (
                            <button
                              onClick={() => {
                                setEditingImageId(img.id);
                                setEditCaption(img.caption || "");
                              }}
                              className="p-1 text-slate-500 hover:text-white hover:bg-slate-800/60 rounded transition-colors cursor-pointer"
                              title="Update Caption"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteImage(img.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                            title="Delete Image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
