import React, { useState } from 'react';
import { X, Upload, BookOpen, Target, AlertCircle, Eye, Users, Lock, Globe } from 'lucide-react';
import { ContentFormData, ContentType, CONTENT_TYPE_OPTIONS, SUBJECT_OPTIONS, GRADE_LEVEL_OPTIONS, DIFFICULTY_OPTIONS, VISIBILITY_OPTIONS } from '../../../types/content';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contentData: ContentFormData) => Promise<void>;
  isLoading?: boolean;
  editingContent?: any; // For edit mode
}

export function AddContentModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false,
  editingContent 
}: AddContentModalProps) {
  const [formData, setFormData] = useState<ContentFormData>({
    title: editingContent?.title || '',
    description: editingContent?.description || '',
    type: editingContent?.type || 'lesson',
    subject: editingContent?.subject || '',
    gradeLevel: editingContent?.gradeLevel || [],
    tags: editingContent?.tags || [],
    difficulty: editingContent?.difficulty || 'beginner',
    objectives: editingContent?.objectives || [''],
    prerequisites: editingContent?.prerequisites || [''],
    visibility: editingContent?.visibility || 'school'
  });
  
  const [errors, setErrors] = useState<Partial<ContentFormData>>({});
  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Partial<ContentFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }

    if (formData.gradeLevel.length === 0) {
      newErrors.gradeLevel = 'At least one grade level is required';
    }

    if (formData.objectives.filter(obj => obj.trim()).length === 0) {
      newErrors.objectives = 'At least one learning objective is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        objectives: formData.objectives.filter(obj => obj.trim()),
        prerequisites: formData.prerequisites.filter(req => req.trim()),
        file: selectedFile || undefined
      };
      
      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error('Error creating content:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      type: 'lesson',
      subject: '',
      gradeLevel: [],
      tags: [],
      difficulty: 'beginner',
      objectives: [''],
      prerequisites: [''],
      visibility: 'school'
    });
    setErrors({});
    setTagInput('');
    setSelectedFile(null);
    onClose();
  };

  const handleInputChange = (field: keyof ContentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleGradeLevelToggle = (grade: string) => {
    const newGrades = formData.gradeLevel.includes(grade)
      ? formData.gradeLevel.filter(g => g !== grade)
      : [...formData.gradeLevel, grade];
    handleInputChange('gradeLevel', newGrades);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    handleInputChange('objectives', newObjectives);
  };

  const handleAddObjective = () => {
    handleInputChange('objectives', [...formData.objectives, '']);
  };

  const handleRemoveObjective = (index: number) => {
    if (formData.objectives.length > 1) {
      const newObjectives = formData.objectives.filter((_, i) => i !== index);
      handleInputChange('objectives', newObjectives);
    }
  };

  const handlePrerequisiteChange = (index: number, value: string) => {
    const newPrerequisites = [...formData.prerequisites];
    newPrerequisites[index] = value;
    handleInputChange('prerequisites', newPrerequisites);
  };

  const handleAddPrerequisite = () => {
    handleInputChange('prerequisites', [...formData.prerequisites, '']);
  };

  const handleRemovePrerequisite = (index: number) => {
    const newPrerequisites = formData.prerequisites.filter((_, i) => i !== index);
    handleInputChange('prerequisites', newPrerequisites);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'school': return <Users className="h-4 w-4" />;
      case 'grade': return <Eye className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingContent ? 'Edit Content' : 'Add New Content'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *
                </label><input id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.title 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter content title"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as ContentType)}
                  aria-label="Select content type"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {CONTENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  aria-label="Select subject"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.subject 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select subject</option>
                  {SUBJECT_OPTIONS.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.description 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Describe the content and what students will learn"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Educational Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Educational Details
            </h3>

            {/* Grade Levels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Grade Levels *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {GRADE_LEVEL_OPTIONS.map((grade) => (
                  <label key={grade} className="flex items-center space-x-2 p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input id="subject"
                      type="checkbox"
                      checked={formData.gradeLevel.includes(grade)}
                      onChange={() => handleGradeLevelToggle(grade)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{grade}</span>
                  </label>
                ))}
              </div>
              {errors.gradeLevel && (
                <p className="text-red-500 text-sm mt-1">{errors.gradeLevel}</p>
              )}
            </div>

            {/* Difficulty & Visibility */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty Level
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  aria-label="Select difficulty level"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Visibility
                </label>
                <select
                  value={formData.visibility}
                  onChange={(e) => handleInputChange('visibility', e.target.value)}
                  aria-label="Select visibility"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {VISIBILITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {getVisibilityIcon(option.value)} {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Learning Objectives */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Learning Objectives *
              </label>
              <div className="space-y-2">
                {formData.objectives.map((objective, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input id="visibility"
                      type="text"
                      value={objective}
                      onChange={(e) => handleObjectiveChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder={`Learning objective ${index + 1}`}
                    />
                    {formData.objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveObjective(index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddObjective}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  + Add objective
                </button>
              </div>
              {errors.objectives && (
                <p className="text-red-500 text-sm mt-1">{errors.objectives}</p>
              )}
            </div>

            {/* Prerequisites */}
            <div>
              <label htmlFor="input9ixwt4" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prerequisites
              </label>
              <div className="space-y-2">
                {formData.prerequisites.map((prerequisite, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input id="input9ixwt4"
                      type="text"
                      value={prerequisite}
                      onChange={(e) => handlePrerequisiteChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder={`Prerequisite ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePrerequisite(index)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddPrerequisite}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  + Add prerequisite
                </button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="input88czo3" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input id="input88czo3"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Content File
            </h3>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="content-file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.avi"
              />
              <label
                htmlFor="content-file"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  {selectedFile ? (
                    <span className="text-blue-600 dark:text-blue-400">
                      Selected: {selectedFile.name}
                    </span>
                  ) : (
                    <>
                      Click to upload or drag and drop<br />
                      PDF, DOC, PPT, MP4 files supported
                    </>
                  )}
                </p>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingContent ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingContent ? 'Update Content' : 'Create Content'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}