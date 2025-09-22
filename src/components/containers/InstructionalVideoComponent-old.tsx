/**
 * Instructional Video Component
 * Displays YouTube educational videos within the narrative context
 * Part of the Learn Container's three-phase learning system
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Maximize2, SkipForward, BookOpen, Sparkles, ChevronRight } from 'lucide-react';
import { LearnContainerContent } from '../../services/micro-generators/LearnMicroGenerator';
import { MasterNarrative } from '../../services/narrative/MasterNarrativeGenerator';
import { YouTubeService } from '../../services/content-providers/YouTubeService';
import { videoValidator } from '../../services/content-providers/VideoValidator';
import styles from './InstructionalVideoComponent.module.css';
import '../../design-system/index.css';

interface InstructionalVideoComponentProps {
  content: LearnContainerContent;
  narrative: MasterNarrative;
  studentName: string;
  gradeLevel: string;
  subject: string;
  skill: any;
  theme?: 'light' | 'dark' | 'cyberpunk';
  onComplete: () => void;
  onSkipToQuestions: () => void;
}

interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isFullscreen: boolean;
}

export const InstructionalVideoComponent: React.FC<InstructionalVideoComponentProps> = ({
  content,
  narrative,
  studentName,
  gradeLevel,
  subject,
  skill,
  theme = 'light',
  onComplete,
  onSkipToQuestions
}) => {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [videoState, setVideoState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isFullscreen: false
  });
  const [showNarrativeIntro, setShowNarrativeIntro] = useState(false);

  // Debug logging
  console.log('🎨 InstructionalVideoComponent rendering:', {
    showNarrativeIntro,
    isLoading,
    hasVideos: videos.length,
    narrative: !!narrative,
    narrativeRole: narrative?.character?.role,
    content: !!content,
    studentName,
    gradeLevel,
    skillName: skill?.skillName || skill?.skill_name || skill?.name,
    subject
  });
  const [hasWatched, setHasWatched] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Use a ref to maintain the service instance across renders
  const youtubeServiceRef = useRef<YouTubeService | null>(null);
  if (!youtubeServiceRef.current) {
    youtubeServiceRef.current = new YouTubeService();
  }
  const youtubeService = youtubeServiceRef.current;

  useEffect(() => {
    fetchEducationalVideos();
  }, [skill, subject]);

  const fetchEducationalVideos = async () => {
    try {
      setIsLoading(true);
      // Convert grade level to format expected by service (e.g., "Kindergarten" -> "K")
      const grade = gradeLevel.toLowerCase() === 'kindergarten' ? 'K' : gradeLevel;

      const searchResults = await youtubeService.searchEducationalVideos(
        grade,
        subject,
        skill.skillName
      );

      if (searchResults && searchResults.videos && searchResults.videos.length > 0) {
        // Validate videos before showing them
        const validVideos = [];
        for (const video of searchResults.videos) {
          if (video.id) {
            const validation = await videoValidator.validateVideo(video.id);
            if (validation.isPlayable) {
              validVideos.push(video);
              if (validVideos.length >= 3) break; // Get up to 3 valid videos
            } else {
              console.warn(`Video ${video.id} not playable: ${validation.reason}`);
            }
          }
        }

        if (validVideos.length > 0) {
          setVideos(validVideos);
          setSelectedVideo(validVideos[0]);
        } else {
          console.warn('No playable videos found, will show fallback message');
          setVideos([]);
          setSelectedVideo(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      // Use mock data if API fails
      setVideos([]);
      setSelectedVideo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoComplete = () => {
    setHasWatched(true);
    onComplete();
  };

  const handleVideoSelect = (video: any) => {
    setSelectedVideo(video);
    setHasWatched(false);
    setVideoError(null);
  };

  // Handle video playback errors
  const handleVideoError = async (failedVideoId: string) => {
    console.error(`Video ${failedVideoId} failed to play`);

    // Add to blacklist
    await videoValidator.validateVideo(failedVideoId); // This will blacklist it

    // Try next video
    const currentIndex = videos.findIndex(v => v.id === failedVideoId);
    if (currentIndex < videos.length - 1) {
      const nextVideo = videos[currentIndex + 1];
      setSelectedVideo(nextVideo);
      setVideoError(`Previous video unavailable. Trying alternative...`);
      setTimeout(() => setVideoError(null), 3000);
    } else {
      setVideoError('No playable videos available. Please skip to practice questions.');
    }
  };

  // Keep showing narrative intro even if no videos are available
  // This ensures the welcome page is always visible
  useEffect(() => {
    // Don't auto-skip the intro anymore
    // if (!isLoading && videos.length === 0) {
    //   setShowNarrativeIntro(false);
    // }
  }, [isLoading, videos]);

  // Extract skill name with fallback
  const skillDisplayName = skill?.skillName || skill?.skill_name || skill?.name || 'new skills';

  // Use fallback values if narrative/content not loaded yet
  const narrativeRole = narrative?.character?.role || 'Explorer';
  const narrativeGreeting = narrative?.character?.greeting || "I'm excited to learn with you today!";
  const narrativeMission = narrative?.cohesiveStory?.mission || 'make a difference in the world';
  const introText = content?.instructional?.introduction || `Today we're going to master ${skillDisplayName}. This is going to be an amazing adventure!`;

  return (
    <>
      {/* Narrative Introduction - Full Screen Welcome */}
      {showNarrativeIntro && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-8 overflow-y-auto">
          <div className="max-w-4xl w-full">
            {/* Main Content Card */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header Section with Gradient */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Ready to Learn</p>
                      <h2 className="text-2xl font-bold">{skillDisplayName}</h2>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Grade Level</p>
                    <p className="text-xl font-semibold">{gradeLevel}</p>
                  </div>
                </div>
              </div>

              {/* Welcome Message Section */}
              <div className="p-8 space-y-6">
                {/* Greeting from Companion */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Hi {studentName}! 👋
                    </h3>
                    <p className="text-lg text-gray-700 leading-relaxed mb-4">
                      {narrativeGreeting}
                    </p>
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                      <p className="text-gray-700">
                        {introText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Career Connection */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      Your Future as a {narrativeRole}
                    </h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Understanding {skillDisplayName} will help you {narrativeMission}.
                    Every {narrativeRole} uses these skills to make a difference!
                  </p>
                </div>

                {/* Learning Journey Preview */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-xl">📺</span>
                    </div>
                    <p className="font-semibold text-gray-800">Watch</p>
                    <p className="text-sm text-gray-600">Learn with videos</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-xl">✏️</span>
                    </div>
                    <p className="font-semibold text-gray-800">Practice</p>
                    <p className="text-sm text-gray-600">Try it yourself</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-200">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-xl">🏆</span>
                    </div>
                    <p className="font-semibold text-gray-800">Master</p>
                    <p className="text-sm text-gray-600">Show what you know</p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setShowNarrativeIntro(false)}
                    className="group bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-3"
                  >
                    <span>Let's Watch & Learn</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Companion Character Info */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Learning with <span className="font-semibold text-purple-600">Harmony</span> •
                Subject: <span className="font-semibold text-blue-600">{subject}</span> •
                Career Path: <span className="font-semibold text-green-600">{narrativeRole}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Section */}
      {!showNarrativeIntro && (
        <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-8 overflow-y-auto">
          <div className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Video Header */}
          <div className="p-4 border-b ds-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 ds-text-primary" />
                <div>
                  <h2 className="font-semibold ds-text-content-primary">
                    {content?.instructional?.videoIntro?.hook || `Let's learn ${skillDisplayName}!`}
                  </h2>
                  <p className="text-sm ds-text-content-secondary">
                    {content?.instructional?.keyExpert?.title || `Learning with expert guidance`}
                  </p>
                </div>
              </div>
              <button
                onClick={onSkipToQuestions}
                className="ds-btn-secondary ds-btn-sm"
              >
                Skip to Practice
                <SkipForward className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>

          {/* Main Video Area */}
          {isLoading ? (
            <div className="aspect-video bg-black flex items-center justify-center">
              <div className="text-center">
                <div className="ds-spinner-primary mb-4"></div>
                <p className="text-white">Loading educational content...</p>
              </div>
            </div>
          ) : selectedVideo ? (
            <div className="relative">
              {/* YouTube Embed */}
              <div className="aspect-video bg-black relative">
                {videoError && (
                  <div className="absolute top-0 left-0 right-0 z-10 bg-yellow-500 text-black p-2 text-center">
                    {videoError}
                  </div>
                )}
                {selectedVideo.id ? (
                  <iframe
                    key={selectedVideo.id}  // Force new iframe when video changes
                    src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="w-full h-full"
                    onLoad={() => {
                      // Track when video loads
                      console.log('Video loaded:', selectedVideo.id);
                      setVideoError(null);
                    }}
                    onError={() => {
                      handleVideoError(selectedVideo.id);
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <p>Video ID not available</p>
                  </div>
                )}
              </div>

              {/* Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-4">
                    <button className="ds-btn-icon-sm hover:bg-white/20 transition-colors">
                      {videoState.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4" />
                      <div className="w-20 h-1 bg-white/30 rounded-full">
                        <div className="h-full w-3/4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <button className="ds-btn-icon-sm hover:bg-white/20 transition-colors">
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-black flex items-center justify-center">
              <p className="text-white">No videos available for this topic</p>
            </div>
          )}

          {/* Video Info & Career Context */}
          <div className="p-6 space-y-4">
            {/* Current Video Info */}
            {selectedVideo && (
              <div className="ds-card-secondary p-4">
                <h3 className="font-semibold ds-text-content-primary mb-2">
                  {selectedVideo.title}
                </h3>
                <p className="text-sm ds-text-content-secondary mb-3">
                  {selectedVideo.description?.substring(0, 200)}...
                </p>
                <div className="flex items-center space-x-4 text-xs ds-text-content-tertiary">
                  <span>{selectedVideo.channelTitle}</span>
                  <span>•</span>
                  <span>{Math.floor(selectedVideo.duration / 60)}:{(selectedVideo.duration % 60).toString().padStart(2, '0')}</span>
                  <span>•</span>
                  <span>{selectedVideo.viewCount?.toLocaleString() || '0'} views</span>
                </div>
              </div>
            )}

            {/* Key Learning Points */}
            <div className="ds-card-info p-4">
              <h4 className="font-semibold ds-text-content-primary mb-3">
                What You're Learning
              </h4>
              <div className="space-y-2">
                {(content?.instructional?.keyLearningPoints || [
                  `Understanding ${skillDisplayName}`,
                  `Practicing with real examples`,
                  `Applying what you've learned`
                ]).map((point, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-6 h-6 ds-bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold ds-text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm ds-text-content-secondary">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Connection */}
            <div className="ds-card-accent p-4">
              <h4 className="font-semibold ds-text-content-primary mb-2">
                Why This Matters for a {narrativeRole}
              </h4>
              <p className="text-sm ds-text-content-secondary mb-3">
                {content?.instructional?.videoIntro?.careerContext || `This skill will help you in your future career as a ${narrativeRole}.`}
              </p>
              <div className="flex items-center space-x-2 text-xs ds-text-primary">
                <Sparkles className="w-4 h-4" />
                <span>{content?.instructional?.keyExpert?.funFact || `Did you know? Professionals use this skill every day!`}</span>
              </div>
            </div>


            {/* Suggested Videos Section */}
            {videos.length > 1 && (
              <div className={styles.alternativeVideosSection} data-theme={theme}>
                <h4 className={styles.alternativeVideosTitle}>
                  Alternative Videos
                </h4>
                <div className={styles.alternativeVideosList}>
                  {videos.slice(0, 3).map((video, index) => (
                    <button
                      key={video.id}
                      onClick={() => handleVideoSelect(video)}
                      className={
                        selectedVideo?.id === video.id
                          ? styles.videoCardActive
                          : styles.videoCard
                      }
                    >
                      <div className={styles.videoCardContent}>
                        <div className={styles.videoThumbnail}>
                          {video.thumbnail && (
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className={styles.thumbnailImage}
                            />
                          )}
                        </div>
                        <div className={styles.videoInfo}>
                          <h5 className={styles.videoTitle}>
                            {video.title}
                          </h5>
                          <p className={styles.videoMeta}>
                            {video.channelTitle} • {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {videos.length > 3 && (
                  <p className={styles.moreVideosText}>
                    {videos.length - 3} more videos available
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setShowNarrativeIntro(true)}
                className="ds-btn-secondary"
              >
                Review Introduction
              </button>
              <button
                onClick={handleVideoComplete}
                className="ds-btn-primary ds-btn-lg"
                disabled={!hasWatched && selectedVideo}
              >
                I'm Ready for Practice Questions
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstructionalVideoComponent;