import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Plus, Edit2, Trash2, CheckCircle2,
  AlertCircle, X, MapPin, Clock, DollarSign, Camera,
  Tv, MessageSquare, Flag, Shield, Play, ExternalLink,
  Upload, Link as LinkIcon, Image as ImageIcon, Star
} from 'lucide-react';
import { resolveImageUrl, handleImageError } from '../utils/imageUrl';

export default function AdminDashboard({ attractions, adminToken, onRefreshAttractions }) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('attractions'); // 'attractions' | 'photos' | 'videos' | 'moderation'
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Attractions management state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const emptyForm = {
    name: '',
    category: 'Nature',
    distanceKm: '5.0',
    latitude: '6.6991',
    longitude: '79.9304',
    shortDescription: '',
    description: '',
    openingHours: '08:00 AM - 06:00 PM',
    entranceFee: 'Free',
    visitDurationMinutes: '60',
    facilities: 'Parking, Restrooms',
    parkingInfo: 'Available on site',
    travelTips: 'Wear comfortable walking shoes.',
    images: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80'
  };
  const [formData, setFormData] = useState(emptyForm);

  // Photographs management state (Multiple Uploads & Multiple URLs)
  const [selectedPlaceForPhotos, setSelectedPlaceForPhotos] = useState(attractions[0]?._id || attractions[0]?.id || '');
  const [placePhotos, setPlacePhotos] = useState([]);
  const [currentCoverImage, setCurrentCoverImage] = useState('');
  const [photoMode, setPhotoMode] = useState('files'); // 'files' | 'urls'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [multiPhotoUrls, setMultiPhotoUrls] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // YouTube Videos management state (Add & Edit)
  const [selectedPlaceForVideos, setSelectedPlaceForVideos] = useState(attractions[0]?._id || attractions[0]?.id || '');
  const [placeVideos, setPlaceVideos] = useState([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoCategory, setNewVideoCategory] = useState('Travel Vlog');
  const [newVideoChannel, setNewVideoChannel] = useState('');

  // Video Editing state
  const [showEditVideoModal, setShowEditVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editVideoForm, setEditVideoForm] = useState({
    url: '',
    title: '',
    category: 'Travel Vlog',
    channelName: '',
    description: ''
  });

  // Moderation state
  const [reportedReviews, setReportedReviews] = useState([]);

  useEffect(() => {
    if (!selectedPlaceForPhotos && attractions.length > 0) {
      setSelectedPlaceForPhotos(attractions[0]._id || attractions[0].id);
    }
    if (!selectedPlaceForVideos && attractions.length > 0) {
      setSelectedPlaceForVideos(attractions[0]._id || attractions[0].id);
    }
  }, [attractions]);

  // Load photos for selected place
  const loadPhotos = async (placeId) => {
    if (!placeId) return;
    try {
      const res = await fetch(`/api/places/${placeId}/images`);
      const data = await res.json();
      if (data.success) {
        setPlacePhotos(data.data || []);
        const matched = attractions.find(a => (a._id || a.id) === placeId);
        setCurrentCoverImage(data.coverImage || matched?.images?.[0] || '');
      }
    } catch (err) {
      console.error('Failed to load photos:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'photos' && selectedPlaceForPhotos) {
      loadPhotos(selectedPlaceForPhotos);
    }
  }, [activeTab, selectedPlaceForPhotos]);

  // Load videos for selected place
  const loadVideos = async (placeId) => {
    if (!placeId) return;
    try {
      const res = await fetch(`/api/places/${placeId}/videos`);
      const data = await res.json();
      if (data.success) setPlaceVideos(data.data || []);
    } catch (err) {
      console.error('Failed to load videos:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'videos' && selectedPlaceForVideos) {
      loadVideos(selectedPlaceForVideos);
    }
  }, [activeTab, selectedPlaceForVideos]);

  // Load reported reviews
  const loadReported = async () => {
    try {
      const res = await fetch('/api/reviews/reported', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) setReportedReviews(data.data || []);
    } catch (err) {
      console.error('Failed to load reported reviews:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'moderation') {
      loadReported();
    }
  }, [activeTab]);

  if (!adminToken) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Access Restricted</h2>
        <p className="text-sm text-[var(--text-secondary)]">Please sign in as an administrator to access the dashboard.</p>
        <button
          onClick={() => navigate('/admin/login')}
          className="btn-primary"
        >
          Go to Admin Login
        </button>
      </div>
    );
  }

  // ── Attraction Handlers ──
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      category: item.category || 'Nature',
      distanceKm: item.distanceKm?.toString() || '5.0',
      latitude: item.latitude?.toString() || '6.6991',
      longitude: item.longitude?.toString() || '79.9304',
      shortDescription: item.shortDescription || '',
      description: item.description || '',
      openingHours: item.openingHours || '',
      entranceFee: item.entranceFee || '',
      visitDurationMinutes: item.visitDurationMinutes?.toString() || '60',
      facilities: Array.isArray(item.facilities) ? item.facilities.join(', ') : item.facilities || '',
      parkingInfo: item.parkingInfo || '',
      travelTips: item.travelTips || '',
      images: Array.isArray(item.images) ? item.images[0] : item.images || ''
    });
    setShowModal(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!formData.name || !formData.category || !formData.shortDescription || !formData.description) {
      setFeedback({ type: 'error', message: 'Please enter all required fields.' });
      return;
    }

    const payload = {
      ...formData,
      distanceKm: parseFloat(formData.distanceKm) || 5.0,
      latitude: parseFloat(formData.latitude) || 6.6991,
      longitude: parseFloat(formData.longitude) || 79.9304,
      visitDurationMinutes: parseInt(formData.visitDurationMinutes) || 60,
      facilities: formData.facilities.split(',').map(s => s.trim()).filter(Boolean),
      images: [formData.images]
    };

    const isEdit = !!editingItem;
    const url = isEdit 
      ? `/api/attractions/${editingItem.id || editingItem._id}`
      : '/api/attractions';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Operation failed.' });
      } else {
        setFeedback({
          type: 'success',
          message: isEdit ? 'Attraction updated successfully.' : 'Attraction added successfully.'
        });
        setShowModal(false);
        onRefreshAttractions();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to communicate with API server.' });
    }
  };

  const handleDelete = async (id) => {
    setFeedback({ type: '', message: '' });
    try {
      const res = await fetch(`/api/attractions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Delete failed.' });
      } else {
        setFeedback({ type: 'success', message: 'Attraction deleted successfully.' });
        setDeletingId(null);
        onRefreshAttractions();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to delete attraction.' });
    }
  };

  // ── Multiple Photo Upload Handler (Files or Multiple URLs) ──
  const handleUploadMultiplePhotos = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    setUploadingPhotos(true);

    try {
      let res;
      if (photoMode === 'files') {
        if (!selectedFiles || selectedFiles.length === 0) {
          setFeedback({ type: 'error', message: 'Please select at least one image file from your computer.' });
          setUploadingPhotos(false);
          return;
        }

        const dataForm = new FormData();
        Array.from(selectedFiles).forEach(file => {
          dataForm.append('images', file);
        });
        if (newPhotoCaption.trim()) {
          dataForm.append('caption', newPhotoCaption.trim());
        }

        res = await fetch(`/api/places/${selectedPlaceForPhotos}/images`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` },
          body: dataForm
        });
      } else {
        // Multi-URL mode
        if (!multiPhotoUrls.trim()) {
          setFeedback({ type: 'error', message: 'Please provide at least one image URL.' });
          setUploadingPhotos(false);
          return;
        }

        res = await fetch(`/api/places/${selectedPlaceForPhotos}/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          },
          body: JSON.stringify({
            imageUrls: multiPhotoUrls.trim(),
            caption: newPhotoCaption.trim()
          })
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setMultiPhotoUrls('');
        setSelectedFiles([]);
        setNewPhotoCaption('');
        setFeedback({ type: 'success', message: data.message || `Uploaded ${data.count} photographs successfully!` });
        loadPhotos(selectedPlaceForPhotos);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to upload photographs.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error uploading photographs.' });
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleDeletePhoto = async (imageId, imageUrl) => {
    if (!window.confirm('Are you sure you want to remove this photograph from this destination?')) return;
    try {
      const res = await fetch(`/api/places/${selectedPlaceForPhotos}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ imageUrl })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: 'Photograph removed from destination successfully.' });
        if (onRefreshAttractions) onRefreshAttractions();
        loadPhotos(selectedPlaceForPhotos);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to delete photograph' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Error deleting photograph.' });
    }
  };

  const handleSetCoverPhoto = async (imageUrl) => {
    try {
      const res = await fetch(`/api/places/${selectedPlaceForPhotos}/cover-image`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ imageUrl })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentCoverImage(data.coverImage || imageUrl);
        setFeedback({ type: 'success', message: 'Main cover photograph updated successfully! It is now the primary image for this destination.' });
        if (onRefreshAttractions) onRefreshAttractions();
        loadPhotos(selectedPlaceForPhotos);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to update cover photo' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error updating cover photograph.' });
    }
  };

  // ── YouTube Video Handlers ──
  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!newVideoUrl.trim() || !newVideoTitle.trim()) return;
    try {
      const res = await fetch(`/api/places/${selectedPlaceForVideos}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          url: newVideoUrl.trim(),
          title: newVideoTitle.trim(),
          category: newVideoCategory,
          channelName: newVideoChannel.trim() || 'Travel Channel'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewVideoUrl('');
        setNewVideoTitle('');
        setFeedback({ type: 'success', message: 'YouTube travel video added successfully.' });
        loadVideos(selectedPlaceForVideos);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to add video' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error adding video.' });
    }
  };

  const handleOpenEditVideo = (video) => {
    setEditingVideo(video);
    setEditVideoForm({
      url: video.videoUrl || video.youtubeVideoId,
      title: video.title || '',
      category: video.category || 'Travel Vlog',
      channelName: video.channelName || '',
      description: video.description || ''
    });
    setShowEditVideoModal(true);
  };

  const handleUpdateVideo = async (e) => {
    e.preventDefault();
    if (!editingVideo) return;
    try {
      const res = await fetch(`/api/places/${selectedPlaceForVideos}/videos/${editingVideo._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(editVideoForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowEditVideoModal(false);
        setEditingVideo(null);
        setFeedback({ type: 'success', message: 'YouTube video updated successfully!' });
        loadVideos(selectedPlaceForVideos);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to update video' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error updating video.' });
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this YouTube video?')) return;
    try {
      const res = await fetch(`/api/places/${selectedPlaceForVideos}/videos/${videoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: 'YouTube video removed successfully.' });
        loadVideos(selectedPlaceForVideos);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Error deleting video.' });
    }
  };

  // ── Moderation Handlers ──
  const handleModerateReview = async (reviewId, newStatus, dismissReport) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus, dismissReport })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: data.message });
        loadReported();
      }
    } catch {
      setFeedback({ type: 'error', message: 'Moderation action failed.' });
    }
  };

  return (
    <div className="page-container space-y-8 pb-12 animate-fadeIn">
      
      {/* Dashboard Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-7 h-7 text-[var(--text-accent)]" />
            Administrator Control Center
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage tourist attractions, upload multiple photo gallery images, edit YouTube videos, and moderate reviews.
          </p>
        </div>

        {activeTab === 'attractions' && (
          <button
            onClick={handleOpenAdd}
            className="btn-primary self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Attraction
          </button>
        )}
      </div>

      {/* Prominent Admin Tabs Bar (Large & Clearly Identifiable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
        {[
          {
            key: 'attractions',
            title: 'Attractions Directory',
            desc: 'Places, fees, timings & CRUD',
            badge: `${attractions.length} Places`,
            icon: LayoutDashboard
          },
          {
            key: 'photos',
            title: 'Photo Galleries',
            desc: 'Multi-file & batch URL upload',
            badge: 'Multi-Upload',
            icon: Camera
          },
          {
            key: 'videos',
            title: 'YouTube Videos',
            desc: 'Add & edit travel video links',
            badge: 'Add & Edit',
            icon: Tv
          },
          {
            key: 'moderation',
            title: 'Review Moderation',
            desc: 'Flagged & reported user reviews',
            badge: reportedReviews.length > 0 ? `${reportedReviews.length} Flagged` : '0 Flagged',
            icon: Flag
          },
        ].map(({ key, title, desc, badge, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`text-left p-4 sm:p-5 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 border-2 ${
                isActive
                  ? 'bg-gradient-to-br from-teal-500 via-teal-400 to-emerald-500 text-slate-950 border-teal-300 shadow-xl shadow-teal-500/25 scale-[1.02]'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] hover:border-teal-500/40 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-3 rounded-xl ${
                  isActive
                    ? 'bg-slate-950/20 text-slate-950'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-accent)] border border-[var(--border-subtle)]'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${
                  isActive
                    ? 'bg-slate-950 text-teal-300'
                    : reportedReviews.length > 0 && key === 'moderation'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                }`}>
                  {badge}
                </span>
              </div>

              <div>
                <h3 className={`text-base sm:text-lg font-black tracking-tight leading-snug ${
                  isActive ? 'text-slate-950 font-black' : 'text-[var(--text-primary)] font-bold'
                }`}>
                  {title}
                </h3>
                <p className={`text-xs mt-1 leading-relaxed ${
                  isActive ? 'text-slate-950/80 font-semibold' : 'text-[var(--text-muted)]'
                }`}>
                  {desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback Alert Message */}
      {feedback.message && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold ${
          feedback.type === 'error'
            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
            : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="p-1 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Tab 1: Attractions Directory ── */}
      {activeTab === 'attractions' && (
        <div className="space-y-6">
          {/* Summary Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-glass)]">
              <span className="text-xs text-[var(--text-muted)] uppercase font-bold tracking-wider">Total Attractions</span>
              <p className="text-3xl font-black text-[var(--text-accent)] mt-1">{attractions.length}</p>
            </div>
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-glass)]">
              <span className="text-xs text-[var(--text-muted)] uppercase font-bold tracking-wider">Coverage Radius</span>
              <p className="text-3xl font-black text-emerald-400 mt-1">25 km</p>
            </div>
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-glass)]">
              <span className="text-xs text-[var(--text-muted)] uppercase font-bold tracking-wider">Reference Location</span>
              <p className="text-3xl font-black text-cyan-400 mt-1">Panadura</p>
            </div>
          </div>

          {/* Attractions Table */}
          <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden shadow-[var(--shadow-card)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--bg-secondary)] text-xs uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                  <tr>
                    <th className="py-4 px-6">Place Name</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Distance</th>
                    <th className="py-4 px-6">Rating &amp; Reviews</th>
                    <th className="py-4 px-6">Fee</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-secondary)]">
                  {attractions.map((spot) => {
                    const id = spot.id || spot._id;
                    return (
                      <tr key={id} className="hover:bg-[var(--bg-hover)] transition-colors">
                        <td className="py-4 px-6 font-bold text-[var(--text-primary)] flex items-center gap-3">
                          <img
                            src={resolveImageUrl(spot.images?.[0])}
                            alt=""
                            onError={handleImageError}
                            className="w-10 h-10 rounded-lg object-cover border border-[var(--border-subtle)]"
                          />
                          <span>{spot.name}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[var(--bg-hover)] text-[var(--text-accent)] border border-[var(--border-subtle)]">
                            {spot.category}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs">{spot.distanceKm} km</td>
                        <td className="py-4 px-6 text-xs text-amber-500 font-semibold">
                          {spot.avgRating ? `${spot.avgRating.toFixed(1)} ★ (${spot.reviewCount || 0})` : 'New'}
                        </td>
                        <td className="py-4 px-6 text-xs">{spot.entranceFee || 'Free'}</td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(spot)}
                              className="p-2 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--border-glass)] text-[var(--text-accent)] border border-[var(--border-subtle)] transition-colors cursor-pointer"
                              title="Edit Attraction"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingId(id)}
                              className="p-2 rounded-lg bg-[var(--bg-hover)] hover:bg-red-500/15 text-red-500 border border-[var(--border-subtle)] transition-colors cursor-pointer"
                              title="Delete Attraction"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Photographs Management (Multiple Uploads) ── */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          {/* Select Place Header */}
          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-glass)] flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[var(--text-muted)] uppercase font-bold">Select Destination:</span>
              <select
                value={selectedPlaceForPhotos}
                onChange={e => setSelectedPlaceForPhotos(e.target.value)}
                className="tb-input block mt-1 min-w-[280px]"
              >
                {attractions.map(a => (
                  <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Multiple Photographs Form */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-glass)]">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Camera className="w-5 h-5 text-[var(--text-accent)]" />
                Upload Multiple Photographs to Destination Gallery
              </h3>

              {/* Mode switch: Files vs URLs */}
              <div className="flex rounded-lg bg-[var(--bg-hover)] p-1 border border-[var(--border-subtle)] text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPhotoMode('files')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer transition-all ${
                    photoMode === 'files' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" /> Local Image Files
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode('urls')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer transition-all ${
                    photoMode === 'urls' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" /> Image URLs
                </button>
              </div>
            </div>

            <form onSubmit={handleUploadMultiplePhotos} className="space-y-4">
              {photoMode === 'files' ? (
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                    Select One or Multiple Image Files (JPEG, PNG, WEBP) *
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={e => setSelectedFiles(e.target.files)}
                    className="tb-input w-full p-2"
                    required={selectedFiles.length === 0}
                  />
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 text-xs text-teal-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected ready for upload:
                      <span className="text-[var(--text-muted)] ml-1">
                        ({Array.from(selectedFiles).map(f => f.name).join(', ')})
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                    Paste Image URLs (One URL per line or separated by commas) *
                  </label>
                  <textarea
                    placeholder="https://images.unsplash.com/photo-1...&#10;https://images.unsplash.com/photo-2...&#10;https://images.unsplash.com/photo-3..."
                    value={multiPhotoUrls}
                    onChange={e => setMultiPhotoUrls(e.target.value)}
                    className="tb-input w-full font-mono text-xs"
                    rows={4}
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                    Caption for Photographs (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Scenic sunset & coastline view"
                    value={newPhotoCaption}
                    onChange={e => setNewPhotoCaption(e.target.value)}
                    className="tb-input w-full"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={uploadingPhotos}
                    className="btn-primary w-full justify-center rounded-xl py-3"
                  >
                    {uploadingPhotos ? (
                      'Uploading to Database...'
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {photoMode === 'files' ? `Upload ${selectedFiles.length || ''} File(s) to DB` : 'Save Image URLs to DB'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Current Gallery Grid */}
          <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 shadow-[var(--shadow-card)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">
              Current Destination Photographs ({placePhotos.length})
            </h3>
            {placePhotos.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No gallery photos for this attraction yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {placePhotos.map(photo => {
                  const currentSelectedAttraction = attractions.find(a => (a._id || a.id) === selectedPlaceForPhotos);
                  const isCover = photo.imageUrl === currentCoverImage ||
                    (currentSelectedAttraction && currentSelectedAttraction.images?.[0] === photo.imageUrl);

                  return (
                    <div
                      key={photo._id}
                      className={`relative rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col justify-between ${
                        isCover
                          ? 'border-amber-400 bg-amber-500/5 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/10'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-teal-500/50'
                      }`}
                    >
                      {/* Cover Photo Badge */}
                      {isCover && (
                        <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-md shadow-amber-500/40 pointer-events-none">
                          <Star className="w-3.5 h-3.5 fill-current" /> Cover Photo
                        </div>
                      )}

                      <div className="relative group h-44 overflow-hidden bg-slate-950">
                        <img
                          src={resolveImageUrl(photo.imageUrl)}
                          alt={photo.caption || ''}
                          onError={handleImageError}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Hover Overlay with Action Buttons */}
                        <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                          <div className="flex items-center justify-between gap-2">
                            {isCover ? (
                              <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-current" /> Main Cover
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetCoverPhoto(photo.imageUrl)}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer transition-transform hover:scale-105 shadow-md"
                                title="Set as primary cover photo"
                              >
                                <Star className="w-3.5 h-3.5 fill-current" /> Set as Cover
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(photo._id, photo.imageUrl)}
                              className="p-1.5 rounded-lg bg-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                              title="Delete Photograph"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <span className="text-xs text-white line-clamp-2">
                            {photo.caption || 'Destination photograph'}
                          </span>
                        </div>
                      </div>

                      {/* Card Bottom Bar */}
                      <div className="p-3 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                        <span className="text-xs text-[var(--text-secondary)] font-medium truncate">
                          {photo.caption || 'Gallery photo'}
                        </span>

                        {isCover ? (
                          <span className="text-[11px] font-black text-amber-400 flex items-center gap-1 shrink-0">
                            <Star className="w-3 h-3 fill-current" /> Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetCoverPhoto(photo.imageUrl)}
                            className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Star className="w-3 h-3" /> Set Cover
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab 3: YouTube Videos Management (Add & Edit) ── */}
      {activeTab === 'videos' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-glass)]">
            <span className="text-xs text-[var(--text-muted)] uppercase font-bold">Select Destination:</span>
            <select
              value={selectedPlaceForVideos}
              onChange={e => setSelectedPlaceForVideos(e.target.value)}
              className="tb-input block mt-1 min-w-[280px]"
            >
              {attractions.map(a => (
                <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Add Video Form */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-glass)]">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Tv className="w-5 h-5 text-red-500" />
              Add YouTube Travel Video
            </h3>
            <form onSubmit={handleAddVideo} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="YouTube URL or Video ID"
                value={newVideoUrl}
                onChange={e => setNewVideoUrl(e.target.value)}
                className="tb-input"
                required
              />
              <input
                type="text"
                placeholder="Video Title"
                value={newVideoTitle}
                onChange={e => setNewVideoTitle(e.target.value)}
                className="tb-input"
                required
              />
              <select
                value={newVideoCategory}
                onChange={e => setNewVideoCategory(e.target.value)}
                className="tb-input"
              >
                <option value="Travel Vlog">Travel Vlog</option>
                <option value="Tourist Review">Tourist Review</option>
                <option value="Historical Info">Historical Info</option>
                <option value="Walking Tour">Walking Tour</option>
                <option value="Travel Guide">Travel Guide</option>
                <option value="Things to Do">Things to Do</option>
              </select>
              <button
                type="submit"
                className="btn-primary justify-center rounded-xl"
              >
                Add Video
              </button>
            </form>
          </div>

          {/* Current Videos List with EDIT & DELETE */}
          <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 shadow-[var(--shadow-card)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">
              Attached YouTube Videos ({placeVideos.length})
            </h3>
            {placeVideos.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No videos configured for this attraction yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {placeVideos.map(vid => (
                  <div key={vid._id} className="rounded-xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                    <img src={vid.thumbnailUrl} alt="" className="w-full h-36 object-cover" />
                    <div className="p-4 flex flex-col justify-between">
                      <span className="text-xs font-bold text-red-500">{vid.category}</span>
                      <h4 className="text-sm font-bold text-[var(--text-primary)] line-clamp-2 mt-1">{vid.title}</h4>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-subtle)]">
                        <span className="text-xs text-[var(--text-secondary)]">{vid.channelName}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditVideo(vid)}
                            className="p-1.5 rounded-lg bg-teal-500/15 text-teal-400 hover:bg-teal-500 hover:text-slate-950 transition-colors cursor-pointer"
                            title="Edit Video Link & Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(vid._id)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                            title="Delete Video"
                          >
                            <Trash2 className="w-4 h-4" />
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
      )}

      {/* ── Tab 4: Content Moderation ── */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 shadow-[var(--shadow-card)]">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              Flagged &amp; Reported Visitor Reviews
            </h3>

            {reportedReviews.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-muted)]">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3 opacity-60" />
                <p className="text-sm">No reviews are currently flagged for moderation.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reportedReviews.map(rev => (
                  <div key={rev._id} className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[var(--text-primary)]">{rev.userName}</span>
                        <span className="text-xs text-[var(--text-muted)]">for {rev.placeId?.name || 'Attraction'}</span>
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-500">
                          {rev.rating} ★
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)] mt-2">{rev.title}</h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{rev.reviewText}</p>
                      <div className="mt-2 text-xs text-red-500 font-semibold">
                        Report Reason: {rev.reportReason || 'Flagged by visitor'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => handleModerateReview(rev._id, 'active', true)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer"
                      >
                        Dismiss Flag
                      </button>
                      <button
                        onClick={() => handleModerateReview(rev._id, 'hidden', false)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      >
                        Hide Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Edit YouTube Video Modal ── */}
      {showEditVideoModal && editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--bg-card)] border border-[var(--border-accent)] p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Tv className="w-5 h-5 text-red-500" />
                Edit YouTube Video Link &amp; Details
              </h3>
              <button
                onClick={() => {
                  setShowEditVideoModal(false);
                  setEditingVideo(null);
                }}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  YouTube Video Link or Video ID *
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... or 11-char ID"
                  value={editVideoForm.url}
                  onChange={e => setEditVideoForm({ ...editVideoForm, url: e.target.value })}
                  className="tb-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  Video Title *
                </label>
                <input
                  type="text"
                  placeholder="Video Title"
                  value={editVideoForm.title}
                  onChange={e => setEditVideoForm({ ...editVideoForm, title: e.target.value })}
                  className="tb-input w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    Category
                  </label>
                  <select
                    value={editVideoForm.category}
                    onChange={e => setEditVideoForm({ ...editVideoForm, category: e.target.value })}
                    className="tb-input w-full"
                  >
                    <option value="Travel Vlog">Travel Vlog</option>
                    <option value="Tourist Review">Tourist Review</option>
                    <option value="Historical Info">Historical Info</option>
                    <option value="Walking Tour">Walking Tour</option>
                    <option value="Travel Guide">Travel Guide</option>
                    <option value="Things to Do">Things to Do</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    Channel Name
                  </label>
                  <input
                    type="text"
                    placeholder="Channel Name"
                    value={editVideoForm.channelName}
                    onChange={e => setEditVideoForm({ ...editVideoForm, channelName: e.target.value })}
                    className="tb-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  Short Description (Optional)
                </label>
                <textarea
                  placeholder="What is this travel video about?"
                  value={editVideoForm.description}
                  onChange={e => setEditVideoForm({ ...editVideoForm, description: e.target.value })}
                  className="tb-input w-full"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditVideoModal(false);
                    setEditingVideo(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Attraction Add/Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <h2 className="text-xl font-black text-[var(--text-primary)]">
                {editingItem ? 'Edit Attraction' : 'Add New Tourist Attraction'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[var(--text-secondary)]">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="tb-input w-full mt-1.5"
                    required
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)]">Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="tb-input w-full mt-1.5"
                  >
                    <option value="Beach">Beach</option>
                    <option value="Religious">Religious</option>
                    <option value="Nature">Nature</option>
                    <option value="Recreation">Recreation</option>
                    <option value="Heritage">Heritage</option>
                    <option value="Wildlife">Wildlife</option>
                    <option value="Museum">Museum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[var(--text-secondary)]">Short Description (Summary) *</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="tb-input w-full mt-1.5"
                  required
                />
              </div>

              <div>
                <label className="text-[var(--text-secondary)]">Full Description *</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="tb-input w-full mt-1.5"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[var(--text-secondary)]">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.distanceKm}
                    onChange={e => setFormData({ ...formData, distanceKm: e.target.value })}
                    className="tb-input w-full mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)]">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                    className="tb-input w-full mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)]">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                    className="tb-input w-full mt-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[var(--text-secondary)]">Opening Hours</label>
                  <input
                    type="text"
                    value={formData.openingHours}
                    onChange={e => setFormData({ ...formData, openingHours: e.target.value })}
                    className="tb-input w-full mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)]">Entrance Fee</label>
                  <input
                    type="text"
                    value={formData.entranceFee}
                    onChange={e => setFormData({ ...formData, entranceFee: e.target.value })}
                    className="tb-input w-full mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)]">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={formData.visitDurationMinutes}
                    onChange={e => setFormData({ ...formData, visitDurationMinutes: e.target.value })}
                    className="tb-input w-full mt-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-[var(--text-secondary)]">Facilities (comma-separated)</label>
                <input
                  type="text"
                  value={formData.facilities}
                  onChange={e => setFormData({ ...formData, facilities: e.target.value })}
                  className="tb-input w-full mt-1.5"
                />
              </div>

              <div>
                <label className="text-[var(--text-secondary)] block mb-1">
                  Primary Cover Photograph
                </label>
                <input
                  type="text"
                  placeholder="Cover photo path or URL (e.g. /uploads/... or https://...)"
                  value={formData.images}
                  onChange={e => setFormData({ ...formData, images: e.target.value })}
                  className="tb-input w-full"
                />

                {/* Thumbnail Picker from Attraction's Existing Photos */}
                {editingItem && editingItem.images && editingItem.images.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs text-[var(--text-muted)] font-bold block mb-1.5">
                      Or click an existing photo to select it as the main cover:
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {editingItem.images.map((imgUrl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setFormData({ ...formData, images: imgUrl })}
                          className={`relative rounded-xl overflow-hidden shrink-0 border-2 cursor-pointer transition-all ${
                            formData.images === imgUrl
                              ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105 shadow-md'
                              : 'border-[var(--border-subtle)] opacity-70 hover:opacity-100 hover:border-teal-500/50'
                          }`}
                          style={{ width: 72, height: 52 }}
                          title="Click to choose this as cover"
                        >
                          <img
                            src={resolveImageUrl(imgUrl)}
                            alt=""
                            onError={handleImageError}
                            className="w-full h-full object-cover"
                          />
                          {formData.images === imgUrl && (
                            <div className="absolute inset-0 bg-amber-500/25 flex items-center justify-center">
                              <span className="p-0.5 rounded-full bg-amber-500 text-slate-950">
                                <CheckCircle2 className="w-4 h-4 fill-current text-slate-950" />
                              </span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingItem ? 'Save Changes' : 'Create Attraction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 space-y-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Confirm Attraction Deletion</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Are you sure you want to permanently delete this attraction? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
