import React, { useState, useRef } from 'react';
import { Assessment } from '../types/assessment.types';
import assessmentService from '../services/assessment.service';
import { Alert } from './Alert';
import {
  X,
  UploadCloud,
  FileText,
  Github,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface SubmissionModalProps {
  assessment: Assessment;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GITHUB_REGEX = /^https:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-._]+$/;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.zip'];

export const SubmissionModal: React.FC<SubmissionModalProps> = ({
  assessment,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [githubUrl, setGithubUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isLate = new Date() > new Date(assessment.deadline);

  const validateFile = (selectedFile: File): boolean => {
    const ext = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(`Invalid file type '${ext}'. Only .pdf, .docx, and .zip files are allowed.`);
      return false;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(
        `File size (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB) exceeds the strict 10MB limit.`
      );
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (validateFile(selected)) {
        setFile(selected);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (validateFile(dropped)) {
        setFile(dropped);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validate GitHub URL
    const cleanUrl = githubUrl.trim();
    if (!cleanUrl) {
      setError('Please provide your project GitHub repository URL.');
      return;
    }

    if (!GITHUB_REGEX.test(cleanUrl)) {
      setError(
        'Invalid GitHub repository URL. Must be in the format: https://github.com/username/repository'
      );
      return;
    }

    if (!file) {
      setError('Please attach your submission document (.pdf, .docx, or .zip).');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('assessmentId', assessment._id);
      formData.append('githubUrl', cleanUrl);
      formData.append('file', file);

      const res = await assessmentService.submitWork(formData);
      setSuccessMessage(res.message || 'Work submitted successfully!');

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to submit milestone. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-xl w-full rounded-xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-6 right-6 text-slate-500 hover:text-slate-900 p-1 rounded-md hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              Milestone Submission
            </span>
            {isLate && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                <Clock className="w-3 h-3 text-red-600" /> Past Deadline
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{assessment.title}</h2>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{assessment.description}</p>
        </div>

        {/* Deadline Notice */}
        <div className="mb-6 p-3 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">Deadline:</span>
          <span className="font-mono text-slate-900 font-semibold">
            {new Date(assessment.deadline).toLocaleString()}
          </span>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        {successMessage && (
          <div className="mb-4">
            <Alert type="success" message={successMessage} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* GitHub Repository URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Github className="w-4 h-4 text-slate-500" /> GitHub Repository URL
            </label>
            <input
              type="url"
              required
              disabled={loading}
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/organization/repository-name"
              className="w-full px-4 py-2.5 text-xs rounded-md bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Provide the official public or accessible repository link for your project.
            </span>
          </div>

          {/* File Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" /> Milestone Deliverable (.pdf, .docx,
              .zip)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.zip"
              className="hidden"
              onChange={handleFileChange}
              disabled={loading}
            />

            {!file ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                }`}
              >
                <UploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  Click to select file or drag & drop here
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supported formats: PDF, DOCX, ZIP (Strictly 10 MB maximum)
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-md bg-white border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[240px]">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-slate-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setFile(null)}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Lateness Warning */}
          {isLate && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-800 leading-relaxed">
                Notice: The deadline for this assessment has passed. Your submission will be recorded
                and automatically flagged as <strong className="text-red-900">Late</strong>.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2.5 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file || !githubUrl.trim()}
              className="px-6 py-2.5 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading to Cloudinary...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Submit Milestone
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmissionModal;
