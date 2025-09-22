/**
 * Instructional Video Component - Clean Version with Design Tokens
 * Displays YouTube educational videos within the narrative context
 * Part of the Learn Container's three-phase learning system
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Maximize2, SkipForward, BookOpen, Sparkles, ChevronRight } from 'lucide-react';
import { LearnContainerContent } from '../../services/micro-generators/LearnMicroGenerator';
import { MasterNarrative } from '../../services/narrative/MasterNarrativeGenerator';
import { YouTubeService } from '../../services/content-providers/YouTubeService';
import { videoValidator } from '../../services/content-providers/VideoValidator';
import { FallbackVideoContent } from './FallbackVideoContent';
import styles from './InstructionalVideoComponent.module.css';

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
  const [showNarrativeIntro, setShowNarrativeIntro] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasWatched, setHasWatched] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoState, setVideoState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0
  });

  const youtubeServiceRef = useRef<YouTubeService | null>(null);
  const watchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const skillDisplayName = skill?.skill_name || skill?.name || 'essential concepts';
  const narrativeRole = narrative?.careerContext?.title || 'Professional';
  const narrativeMission = narrative?.careerContext?.mission || 'make a difference in your field';
  const narrativeGreeting = narrative?.greeting || `Let's explore ${skillDisplayName} together!`;
  const introText = narrative?.introduction || `Today we'll learn about ${skillDisplayName} and how it applies to real-world situations.`;

  useEffect(() => {
    if (!youtubeServiceRef.current) {
      youtubeServiceRef.current = new YouTubeService();
    }
    loadVideos();
  }, [skill]);

  const loadVideos = async () => {
    try {
      setIsLoading(true);

      // Debug: Log what we received
      console.log('📹 Video Component Received:', {
        skillObject: skill,
        hasSkillName: !!skill?.skill_name,
        hasName: !!skill?.name,
        hasYouTubeTerms: !!skill?.youtube_search_terms,
        gradeLevel: gradeLevel,
        subject: subject
      });

      // Use optimized search terms from database if available,
      // otherwise use the skill_name (which will be optimized by YouTubeService)
      const searchTerm = skill?.youtube_search_terms || skill?.skill_name || skill?.name || 'educational content';

      console.log('📹 Loading videos with search term:', searchTerm);

      // Use the correct method with proper parameters
      const searchResult = await youtubeServiceRef.current!.searchEducationalVideos(
        gradeLevel || 'K',
        subject || 'Math',
        searchTerm
      );

      // Extract videos from the search result
      const results = searchResult.videos || [];

      // For now, skip validation since videoValidator doesn't have validateVideos method
      // We can add validation later if needed
      const validVideos = results;

      setVideos(validVideos);
      if (validVideos.length > 0) {
        setSelectedVideo(validVideos[0]);
      } else {
        setSelectedVideo(null);
        console.log('⚠️ No valid videos found for:', searchTerm);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
      setVideoError('Unable to load videos. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoComplete = () => {
    if (watchTimerRef.current) {
      clearTimeout(watchTimerRef.current);
    }
    onComplete();
  };

  const handleVideoSelect = (video: any) => {
    setSelectedVideo(video);
    setHasWatched(false);
    setVideoError(null);
  };

  useEffect(() => {
    if (selectedVideo && !hasWatched) {
      watchTimerRef.current = setTimeout(() => {
        setHasWatched(true);
      }, 15000);
    }

    return () => {
      if (watchTimerRef.current) {
        clearTimeout(watchTimerRef.current);
      }
    };
  }, [selectedVideo, hasWatched]);

  return (
    <div className={styles.container} data-theme={theme}>
      {/* Narrative Introduction - Full Screen Welcome */}
      {showNarrativeIntro && (
        <div className={styles.narrativeOverlay}>
          <div className={styles.narrativeContainer}>
            <div className={styles.narrativeCard}>
              {/* Header Section */}
              <div className={styles.narrativeHeader}>
                <div className={styles.narrativeHeaderContent}>
                  <div className={styles.narrativeHeaderLeft}>
                    <div className={styles.narrativeIconWrapper}>
                      <BookOpen className={styles.narrativeIcon} />
                    </div>
                    <div>
                      <p className={styles.narrativeSubtitle}>Ready to Learn</p>
                      <h2 className={styles.narrativeTitle}>{skillDisplayName}</h2>
                    </div>
                  </div>
                  <div className={styles.narrativeHeaderRight}>
                    <p className={styles.narrativeGradeLabel}>Grade Level</p>
                    <p className={styles.narrativeGrade}>{gradeLevel}</p>
                  </div>
                </div>
              </div>

              {/* Welcome Message */}
              <div className={styles.narrativeContent}>
                <div className={styles.welcomeSection}>
                  <div className={styles.companionAvatar}>
                    <Sparkles className={styles.companionIcon} />
                  </div>
                  <div className={styles.welcomeContent}>
                    <h3 className={styles.welcomeTitle}>Hi {studentName}! 👋</h3>
                    <p className={styles.welcomeText}>{narrativeGreeting}</p>
                    <div className={styles.introBox}>
                      <p className={styles.introText}>{introText}</p>
                    </div>
                  </div>
                </div>

                {/* Career Connection */}
                <div className={styles.careerBox}>
                  <div className={styles.careerHeader}>
                    <div className={styles.careerIconWrapper}>
                      <span className={styles.careerEmoji}>🎯</span>
                    </div>
                    <h4 className={styles.careerTitle}>Your Future as a {narrativeRole}</h4>
                  </div>
                  <p className={styles.careerText}>
                    Understanding {skillDisplayName} will help you {narrativeMission}.
                    Every {narrativeRole} uses these skills to make a difference!
                  </p>
                </div>

                {/* Learning Journey */}
                <div className={styles.journeyGrid}>
                  <div className={styles.journeyCard}>
                    <div className={styles.journeyIconWrapper}>
                      <span className={styles.journeyEmoji}>📺</span>
                    </div>
                    <p className={styles.journeyTitle}>Watch</p>
                    <p className={styles.journeyDesc}>Learn with videos</p>
                  </div>
                  <div className={styles.journeyCard}>
                    <div className={styles.journeyIconWrapper}>
                      <span className={styles.journeyEmoji}>✏️</span>
                    </div>
                    <p className={styles.journeyTitle}>Practice</p>
                    <p className={styles.journeyDesc}>Try it yourself</p>
                  </div>
                  <div className={styles.journeyCard}>
                    <div className={styles.journeyIconWrapper}>
                      <span className={styles.journeyEmoji}>🏆</span>
                    </div>
                    <p className={styles.journeyTitle}>Master</p>
                    <p className={styles.journeyDesc}>Show what you know</p>
                  </div>
                </div>

                {/* Action Button */}
                <div className={styles.narrativeActions}>
                  <button
                    onClick={() => setShowNarrativeIntro(false)}
                    className={styles.narrativeButton}
                  >
                    <span>Let's Watch & Learn</span>
                    <ChevronRight className={styles.narrativeButtonIcon} />
                  </button>
                </div>
              </div>
            </div>

            {/* Companion Info */}
            <div className={styles.companionInfo}>
              <p className={styles.companionText}>
                Learning with <span className={styles.companionName}>Harmony</span> •
                Subject: <span className={styles.subjectName}>{subject}</span> •
                Career Path: <span className={styles.careerName}>{narrativeRole}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Section */}
      {!showNarrativeIntro && (
        <div className={styles.videoSection}>
          <div className={styles.videoContainer}>
            {/* Video Header */}
            <div className={styles.videoHeader}>
              <div className={styles.videoHeaderContent}>
                <div className={styles.videoHeaderLeft}>
                  <BookOpen className={styles.headerIcon} />
                  <div>
                    <h2 className={styles.videoTitle}>
                      {content?.instructional?.videoIntro?.hook || `Let's learn ${skillDisplayName}!`}
                    </h2>
                    <p className={styles.videoSubtitle}>
                      {content?.instructional?.keyExpert?.title || `Learning with expert guidance`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onSkipToQuestions}
                  className={styles.skipButton}
                >
                  Skip to Practice
                  <SkipForward className={styles.skipIcon} />
                </button>
              </div>
            </div>

            {/* Main Video Area */}
            {isLoading ? (
              <div className={styles.videoPlayer}>
                <div className={styles.loadingState}>
                  <div className={styles.spinner}></div>
                  <p>Loading educational content...</p>
                </div>
              </div>
            ) : selectedVideo ? (
              <div className={styles.videoWrapper}>
                <div className={styles.videoPlayer}>
                  {videoError && (
                    <div className={styles.videoError}>{videoError}</div>
                  )}
                  {selectedVideo.id ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`}
                      title={selectedVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      className={styles.videoFrame}
                    />
                  ) : (
                    <div className={styles.noVideo}>
                      <p>Video ID not available</p>
                    </div>
                  )}
                </div>

                {/* Video Controls Overlay */}
                <div className={styles.videoControls}>
                  <div className={styles.controlsContent}>
                    <div className={styles.controlsLeft}>
                      <button className={styles.controlButton}>
                        {videoState.isPlaying ? <Pause className={styles.controlIcon} /> : <Play className={styles.controlIcon} />}
                      </button>
                      <div className={styles.volumeControl}>
                        <Volume2 className={styles.volumeIcon} />
                        <div className={styles.volumeSlider}>
                          <div className={styles.volumeLevel}></div>
                        </div>
                      </div>
                    </div>
                    <button className={styles.controlButton}>
                      <Maximize2 className={styles.controlIcon} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <FallbackVideoContent
                skillName={skillDisplayName}
                gradeLevel={gradeLevel}
                subject={subject}
                onRetry={loadVideos}
                onSkipToQuestions={onSkipToQuestions}
              />
            )}

            {/* Video Info Section */}
            <div className={styles.infoSection}>
              {/* Current Video Info */}
              {selectedVideo && (
                <div className={styles.videoInfoCard}>
                  <h3 className={styles.infoTitle}>{selectedVideo.title}</h3>
                  <p className={styles.infoDescription}>
                    {selectedVideo.description?.substring(0, 200)}...
                  </p>
                  <div className={styles.infoMeta}>
                    <span>{selectedVideo.channelTitle}</span>
                    <span>•</span>
                    <span>{Math.floor(selectedVideo.duration / 60)}:{(selectedVideo.duration % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>
              )}

              {/* Learning Points */}
              <div className={styles.learningCard}>
                <h4 className={styles.learningTitle}>What You're Learning</h4>
                <div className={styles.learningPoints}>
                  {(content?.instructional?.keyLearningPoints || [
                    `Understanding ${skillDisplayName}`,
                    `Practicing with real examples`,
                    `Applying what you've learned`
                  ]).map((point, index) => (
                    <div key={index} className={styles.learningPoint}>
                      <div className={styles.pointNumber}>{index + 1}</div>
                      <p className={styles.pointText}>{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Career Connection */}
              <div className={styles.careerCard}>
                <h4 className={styles.careerCardTitle}>
                  Why This Matters for a {narrativeRole}
                </h4>
                <p className={styles.careerCardText}>
                  {content?.instructional?.videoIntro?.careerContext || `This skill will help you in your future career as a ${narrativeRole}.`}
                </p>
                <div className={styles.careerInsight}>
                  <Sparkles className={styles.insightIcon} />
                  <span>{content?.instructional?.keyExpert?.funFact || `Did you know? Professionals use this skill every day!`}</span>
                </div>
              </div>

              {/* Alternative Videos */}
              {videos.length > 1 && (
                <div className={styles.alternativeVideosSection} data-theme={theme}>
                  <h4 className={styles.alternativeVideosTitle}>Alternative Videos</h4>
                  <div className={styles.alternativeVideosList}>
                    {videos.slice(0, 3).map((video) => (
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
                            <h5 className={styles.videoTitle}>{video.title}</h5>
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
              <div className={styles.actionButtons}>
                <button
                  onClick={() => setShowNarrativeIntro(true)}
                  className={styles.reviewButton}
                >
                  Review Introduction
                </button>
                <button
                  onClick={handleVideoComplete}
                  className={styles.continueButton}
                  disabled={!hasWatched && selectedVideo}
                >
                  I'm Ready for Practice Questions
                  <ChevronRight className={styles.continueIcon} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructionalVideoComponent;