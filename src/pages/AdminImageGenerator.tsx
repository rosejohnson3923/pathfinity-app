/**
 * Admin Image Generator Page
 * Development tool for generating companion images using DALL-E
 * Can be deprecated once all images are generated
 */

import React, { useState } from 'react';
import { imageGenerationService } from '../services/imageGenerationService';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface CompanionConfig {
  id: string;
  name: string;
  color: string;
  prompt: string;
  emoji: string;
}

const getCompanionPrompt = (companion: string, theme: 'light' | 'dark') => {
  const bgColor = theme === 'dark' ? 'dark gray (#1f2937)' : 'white';
  const glowEffect = theme === 'dark' ? 'with subtle neon glow effects' : '';
  
  const prompts: Record<string, string> = {
    finn: `Create a cute 3D gaming avatar mascot for children's educational game, ${bgColor} background, centered.
      Character: A stylized purple owl warrior avatar with gaming aesthetics.
      - Chunky, simplified purple body (#8B5CF6) with geometric shapes like Fortnite characters
      - Oversized head with huge anime-style eyes that sparkle ${glowEffect}
      - Cool gaming headset or futuristic goggles
      - Small wings that look like a cape or jetpack
      - Chibi proportions (big head, small body) like Fall Guys
      - Glowing purple aura or energy effects around character
      - Cell-shaded or toon-shaded 3D style like Overwatch or Valorant
      - Dynamic action pose like ready for adventure
      - Clean ${bgColor} background, no text or UI elements`,
    sage: `Create a cute 3D gaming avatar mascot for children's educational game, ${bgColor} background, centered.
      Character: A stylized wizard mage avatar with gaming aesthetics.
      - Simplified geometric wizard design like Clash Royale characters
      - Oversized green wizard hat (#10B981) with glowing rune symbols
      - Chibi proportions with big head and small body
      - Floating/levitating pose with magical particles around feet
      - Glowing crystal orb floating between hands ${theme === 'dark' ? 'with bright energy beams' : ''}
      - Short stylized beard like a triangle shape
      - Big expressive eyes with magical sparkles ${glowEffect}
      - Cell-shaded 3D style like League of Legends Wild Rift
      - Green energy effects and floating spell books orbiting character
      - Clean ${bgColor} background, no text or UI elements`,
    spark: `Create a cute 3D gaming avatar mascot for children's educational game, ${bgColor} background, centered.
      Character: An electric speedster avatar with gaming aesthetics.
      - Humanoid character made of living electricity like Pokémon or Sonic style
      - Bright yellow-orange energy body (#F59E0B) with lightning bolt hair ${glowEffect}
      - Chunky gaming character proportions like Brawl Stars
      - Big goggle-eyes with electric pupils
      - Lightning trail effects behind character showing super speed
      - Dynamic action pose mid-dash or jumping ${theme === 'dark' ? 'with bright neon trail effects' : ''}
      - Electric particles and energy rings orbiting the character
      - Cell-shaded 3D style like Splatoon or Fortnite
      - Power-up aura with crackling electricity
      - Clean ${bgColor} background, no text or UI elements`,
    harmony: `Create a cute 3D gaming avatar mascot for educational game, ${bgColor} background, centered.
      Character: A magical flower guardian with gaming aesthetics.
      - Stylized nature character like Animal Crossing or Pokemon style
      - Pink and green color scheme (#EC4899) with glowing accents ${glowEffect}
      - Chibi proportions with large head and small body
      - Decorative butterfly-shaped accessories or cape ${theme === 'dark' ? 'with rainbow prismatic effects' : ''}
      - Standing pose surrounded by floating flower petals
      - Large expressive eyes with star-shaped highlights
      - Holding a magical flower staff or nature wand ${theme === 'dark' ? 'glowing with soft light' : ''}
      - Cell-shaded 3D style like modern Nintendo games
      - Particle effects with petals, leaves, and sparkles orbiting
      - Clean ${bgColor} background, no text or UI elements`
  };
  
  return prompts[companion] || '';
};

const companions: CompanionConfig[] = [
  {
    id: 'finn',
    name: 'Finn',
    color: '#8B5CF6',
    emoji: '🦉',
    prompt: '' // Will be set dynamically based on theme
  },
  {
    id: 'sage',
    name: 'Sage',
    color: '#10B981',
    emoji: '🧙',
    prompt: '' // Will be set dynamically based on theme
  },
  {
    id: 'spark',
    name: 'Spark',
    color: '#F59E0B',
    emoji: '⚡',
    prompt: '' // Will be set dynamically based on theme
  },
  {
    id: 'harmony',
    name: 'Harmony',
    color: '#EC4899',
    emoji: '🌸',
    prompt: '' // Will be set dynamically based on theme
  }
];

interface LogoConfig {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

const logoConfigs: LogoConfig[] = [
  {
    id: 'p-infinity-loop-metallic',
    name: 'P with Infinity Loop - Metallic',
    description: 'Letter P where the tail curves back up to connect, forming infinity',
    prompt: 'Logo symbol: Start with a clear, bold letter "P" shape. The stem/tail of the P extends down and curves back up to connect to the top-left of the P bowl, creating a continuous infinity loop. The P shape is PRIMARY and obvious. Metallic chrome finish with purple gradient (#8B5CF6). Small star or diamond accent in the center space created by the loop. No text. Symbol only. The viewer should see "P" first, infinity second.'
  },
  {
    id: 'p-infinity-loop-flat',
    name: 'P with Infinity Loop - Flat Design',
    description: 'Clear P shape with tail connecting to form infinity, flat colors',
    prompt: 'Logo symbol: Bold letter "P" where the bottom tail curves back up and connects to the upper left of the P, forming an infinity loop. P shape must be PRIMARY and immediately readable. Flat design: solid purple (#8B5CF6) for the P, lighter purple (#C084FC) for the connecting loop. Small geometric shape (triangle or circle) in the negative space. No text. Symbol only. P first, infinity second.'
  },
  {
    id: 'p-infinity-vertical-connection',
    name: 'Vertical P with Loop Connection',
    description: 'Tall P with flowing connection creating infinity',
    prompt: 'Logo symbol: Tall, elegant letter "P" with extended vertical stem. The bottom of the P curves smoothly leftward and upward, connecting back to the top-left of the P bowl to create infinity flow. The P is DOMINANT and clear. Purple gradient from dark (#8B5CF6) to light (#A78BFA). Dot or star accent in the loop space. No text. Symbol only. Emphasis on P readability.'
  },
  {
    id: 'p-infinity-ribbon-metallic',
    name: 'P Ribbon Loop - Metallic',
    description: 'P formed from a ribbon that loops to create infinity',
    prompt: 'Logo symbol: Letter "P" constructed from a continuous ribbon. The ribbon forms a clear P shape, then the tail flows down and curves back up to connect to the P top, creating infinity. Metallic silver ribbon with purple reflections (#8B5CF6). The P must be OBVIOUS and primary. Small gem or node where the ribbon connects. No text. Symbol only. P shape dominates the design.'
  },
  {
    id: 'p-infinity-geometric',
    name: 'Geometric P with Infinity Circuit',
    description: 'Angular P with geometric connection path',
    prompt: 'Logo symbol: Geometric, angular letter "P" with straight lines and sharp corners. The P stem extends down, makes a 90-degree turn left, then up, then right to connect back to the P bowl top, forming a rectangular infinity path. Bold purple (#8B5CF6) for P, teal (#10B981) for connecting path. Square or diamond in the center space. No text. Symbol only. P is primary element.'
  },
  {
    id: 'p-infinity-modern-twist',
    name: 'Modern P with Twisted Loop',
    description: 'P with a twisted möbius-like connection',
    prompt: 'Logo symbol: Modern letter "P" where the descender twists as it curves back up to connect to the P bowl, creating a möbius-like infinity effect. The P shape remains CLEAR and readable. Purple to blue gradient (#8B5CF6 to #6366F1). The twist adds dimension. Sphere or orb floating in the loop space. No text. Symbol only. P is the dominant shape.'
  },
  {
    id: 'p-infinity-double-loop',
    name: 'P with Figure-8 Base',
    description: 'P sitting on a figure-8 infinity base',
    prompt: 'Logo symbol: Clear, bold letter "P" with the stem extending down into a small figure-8 infinity symbol at the base, then connecting back up to the P bowl. The P is LARGE and dominant, the infinity loop is smaller and secondary. Two-tone purple (#8B5CF6 and #9333EA). Plus sign or cross in the loop center. No text. Symbol only. P must be immediately recognizable.'
  },
  {
    id: 'p-infinity-pathway',
    name: 'P as Learning Pathway',
    description: 'P with a path/road that loops back to create infinity',
    prompt: 'Logo symbol: Letter "P" designed as a pathway or road. The P is clearly formed, then the path continues from the P base, curves around like a road, and connects back to the P top, suggesting infinite journey. Purple gradient pathway (#8B5CF6 to #C084FC) with white line markings. Arrow or milestone marker in the loop space. No text. Symbol only. P shape is primary and obvious.'
  }
];

export const AdminImageGenerator: React.FC = () => {
  const { user } = useAuth();
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [savedImages, setSavedImages] = useState<string[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [logoImages, setLogoImages] = useState<Record<string, string>>({});
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [customImage, setCustomImage] = useState<string | null>(null);

  const getLogoPrompt = (logo: LogoConfig, theme: 'light' | 'dark'): string => {
    const backgroundColor = theme === 'light' ? 'clean white' : 'dark charcoal gray (#1f2937)';
    
    // Add theme-specific modifications for modern metallic designs
    return logo.prompt + ` Background: ${backgroundColor}. CRITICAL: No text/words anywhere in the design - symbol only. Modern, premium, metallic finish like high-end tech companies (Apple, Tesla, etc.). The design should feel expensive, innovative, and futuristic. Must still work when simplified to 2-3 colors for print applications, but show the metallic, reflective quality in this rendering.`;
  };

  // Only allow admins or developers
  const isAuthorized = user?.role === 'product_admin' || 
                      user?.role === 'district_admin' ||
                      user?.email?.includes('@pathfinity.com') ||
                      process.env.NODE_ENV === 'development';

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  const generateImage = async (companion: CompanionConfig) => {
    setGenerating(companion.id);
    setError(null);

    try {
      console.log(`🎨 Generating ${theme} theme image for ${companion.name}...`);
      
      const prompt = getCompanionPrompt(companion.id, theme);
      const imageUrl = await imageGenerationService.generateEducationalImage(
        prompt,
        'K', // Use K for most cartoon-friendly style
        {
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid'
        }
      );

      const key = `${companion.id}-${theme}`;
      setGeneratedImages(prev => ({
        ...prev,
        [key]: imageUrl
      }));

      console.log(`✅ Generated image for ${companion.name}`);
    } catch (err) {
      console.error(`❌ Failed to generate ${companion.name}:`, err);
      setError(`Failed to generate ${companion.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setGenerating(null);
    }
  };

  const convertToBase64 = async (imageUrl: string): Promise<string> => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      return imageUrl; // Return original URL as fallback
    }
  };

  const generateCustomImage = async () => {
    if (!customPrompt.trim()) {
      setError('Please enter a prompt for image generation');
      return;
    }

    setGenerating('custom');
    setError(null);

    try {
      console.log('🎨 Generating custom image...');

      const imageUrl = await imageGenerationService.generateEducationalImage(
        customPrompt,
        'K', // Use K for most cartoon-friendly style
        {
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid'
        }
      );

      setCustomImage(imageUrl);
      console.log('✅ Generated custom image');
    } catch (err) {
      console.error('❌ Failed to generate custom image:', err);
      setError(`Failed to generate custom image: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setGenerating(null);
    }
  };

  const generateLogo = async (logo: LogoConfig) => {
    setGenerating(logo.id);
    setError(null);

    try {
      console.log(`🎨 Generating ${theme} theme logo: ${logo.name}...`);
      
      const prompt = getLogoPrompt(logo, theme);
      const imageUrl = await imageGenerationService.generateEducationalImage(
        prompt,
        'K', // Use K for most cartoon-friendly style
        {
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid'
        }
      );

      // Convert to base64 for permanent storage
      console.log('📦 Converting to base64 for permanent storage...');
      const base64Image = await convertToBase64(imageUrl);

      const key = `${logo.id}-${theme}`;
      setLogoImages(prev => ({
        ...prev,
        [key]: base64Image
      }));

      // Also save to localStorage for persistence
      const savedLogos = JSON.parse(localStorage.getItem('pathfinity-logos') || '{}');
      savedLogos[key] = base64Image;
      localStorage.setItem('pathfinity-logos', JSON.stringify(savedLogos));

      console.log(`✅ Generated and saved logo: ${logo.name}`);
    } catch (err) {
      console.error(`❌ Failed to generate logo ${logo.name}:`, err);
      setError(`Failed to generate logo ${logo.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setGenerating(null);
    }
  };

  const generateAll = async () => {
    for (const companion of companions) {
      const key = `${companion.id}-${theme}`;
      if (!generatedImages[key]) {
        await generateImage(companion);
        // Wait 2 seconds between generations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  };

  const generateAllLogos = async () => {
    for (const logo of logoConfigs) {
      const key = `${logo.id}-${theme}`;
      if (!logoImages[key]) {
        await generateLogo(logo);
        // Wait 2 seconds between generations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  };

  const saveToLocalStorage = (companionId: string) => {
    const key = `${companionId}-${theme}`;
    const imageUrl = generatedImages[key];
    if (!imageUrl) return;

    // Save to localStorage for persistence
    const savedData = JSON.parse(localStorage.getItem('companion-images') || '{}');
    savedData[key] = {
      url: imageUrl,
      generated: new Date().toISOString(),
      name: companions.find(c => c.id === companionId)?.name,
      theme: theme
    };
    localStorage.setItem('companion-images', JSON.stringify(savedData));
    
    setSavedImages(prev => [...prev, key]);
    console.log(`💾 Saved ${companionId} (${theme} theme) to localStorage`);
  };

  const downloadImage = async (companionId: string) => {
    const key = `${companionId}-${theme}`;
    const imageUrl = generatedImages[key];
    if (!imageUrl) return;

    try {
      // For data URLs, we can create a download link directly
      if (imageUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${companionId}-${theme}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For external URLs, we need to fetch and convert to blob
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${companionId}-${theme}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      console.log(`⬇️ Downloaded ${companionId} (${theme} theme)`);
    } catch (err) {
      console.error(`Failed to download ${companionId} (${theme} theme):`, err);
    }
  };

  const loadFromLocalStorage = () => {
    const savedData = JSON.parse(localStorage.getItem('companion-images') || '{}');
    const images: Record<string, string> = {};
    const saved: string[] = [];
    
    Object.keys(savedData).forEach(id => {
      if (savedData[id]?.url) {
        images[id] = savedData[id].url;
        saved.push(id);
      }
    });
    
    setGeneratedImages(images);
    setSavedImages(saved);
    console.log(`📂 Loaded ${saved.length} images from localStorage`);
  };

  // Load saved images on mount
  React.useEffect(() => {
    loadFromLocalStorage();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: '#f3f4f6',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <header style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ margin: 0, color: '#1f2937' }}>🎨 Admin: Companion Image Generator</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#6b7280' }}>
            Generate DALL-E images for AI companions in both light and dark themes.
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              padding: '0.25rem',
              backgroundColor: '#e5e7eb',
              borderRadius: '0.5rem'
            }}>
              <button
                onClick={() => setTheme('light')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: theme === 'light' ? 'white' : 'transparent',
                  color: theme === 'light' ? '#1f2937' : '#6b7280',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: theme === 'light' ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ☀️ Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: theme === 'dark' ? '#1f2937' : 'transparent',
                  color: theme === 'dark' ? 'white' : '#6b7280',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: theme === 'dark' ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🌙 Dark
              </button>
            </div>
            <button
              onClick={generateAll}
              disabled={generating !== null}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                cursor: generating ? 'not-allowed' : 'pointer',
                opacity: generating ? 0.5 : 1,
                marginRight: '1rem'
              }}
            >
              {generating ? 'Generating...' : `Generate All (${theme} theme)`}
            </button>
            <button
              onClick={loadFromLocalStorage}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Reload Saved Images
            </button>
          </div>
        </header>

        {error && (
          <div style={{
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '0.5rem',
            color: '#991b1b'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Custom Image Generator Section */}
        <div style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '2px solid #8b5cf6'
        }}>
          <h2 style={{ margin: '0 0 1rem', color: '#1f2937' }}>
            🎨 Custom Image Generator (Free Form)
          </h2>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter any prompt for DALL-E image generation. Be as descriptive as possible..."
              style={{
                flex: 1,
                minHeight: '100px',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            onClick={generateCustomImage}
            disabled={generating === 'custom' || !customPrompt.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: generating === 'custom' || !customPrompt.trim() ? '#9ca3af' : '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              cursor: generating === 'custom' || !customPrompt.trim() ? 'not-allowed' : 'pointer',
              marginBottom: '1rem'
            }}
          >
            {generating === 'custom' ? '⚙️ Generating...' : '✨ Generate Custom Image'}
          </button>

          {customImage && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, color: '#374151' }}>Generated Image:</h3>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(customImage);
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `custom-image-${Date.now()}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    } catch (err) {
                      console.error('Failed to download:', err);
                    }
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: 'semibold',
                    cursor: 'pointer'
                  }}
                >
                  ⬇️ Download
                </button>
              </div>
              <div style={{
                width: '100%',
                maxHeight: '500px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                padding: '1rem'
              }}>
                <img
                  src={customImage}
                  alt="Generated custom image"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '500px',
                    objectFit: 'contain',
                    borderRadius: '0.5rem'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <h2 style={{ margin: '0 0 1rem', color: '#1f2937' }}>
          🤖 AI Companion Images
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {companions.map(companion => (
            <div
              key={companion.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: `2px solid ${companion.color}20`
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1rem',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '2rem' }}>{companion.emoji}</span>
                <h2 style={{ 
                  margin: 0, 
                  color: companion.color,
                  fontSize: '1.25rem'
                }}>
                  {companion.name}
                </h2>
                {savedImages.includes(`${companion.id}-${theme}`) && (
                  <span style={{
                    marginLeft: 'auto',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    SAVED ({theme})
                  </span>
                )}
              </div>

              <div style={{
                width: '100%',
                height: '200px',
                backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${companion.color}40`,
                overflow: 'hidden'
              }}>
                {generatedImages[`${companion.id}-${theme}`] ? (
                  <img
                    src={generatedImages[`${companion.id}-${theme}`]}
                    alt={companion.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                ) : generating === companion.id ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      animation: 'spin 1s linear infinite',
                      fontSize: '2rem',
                      marginBottom: '0.5rem'
                    }}>
                      ⚙️
                    </div>
                    <p style={{ margin: 0, color: '#6b7280' }}>Generating...</p>
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center',
                    color: '#9ca3af'
                  }}>
                    <span style={{ fontSize: '3rem', opacity: 0.5 }}>
                      {companion.emoji}
                    </span>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem' }}>
                      No image generated
                    </p>
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                <button
                  onClick={() => generateImage(companion)}
                  disabled={generating !== null}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: companion.color,
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    fontWeight: 'medium',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    opacity: generating ? 0.5 : 1
                  }}
                >
                  Generate
                </button>
                
                {generatedImages[`${companion.id}-${theme}`] && (
                  <>
                    <button
                      onClick={() => saveToLocalStorage(companion.id)}
                      disabled={savedImages.includes(`${companion.id}-${theme}`)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: savedImages.includes(`${companion.id}-${theme}`) ? '#d1d5db' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        fontWeight: 'medium',
                        cursor: savedImages.includes(`${companion.id}-${theme}`) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {savedImages.includes(`${companion.id}-${theme}`) ? '✓' : 'Save'}
                    </button>
                    
                    <button
                      onClick={() => downloadImage(companion.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        fontWeight: 'medium',
                        cursor: 'pointer'
                      }}
                    >
                      ⬇️
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pathfinity Logo Generation Section */}
        <section style={{ marginTop: '3rem' }}>
          <header style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: 0, color: '#1f2937' }}>P∞ Letter P Creating Infinity Loop</h2>
            <p style={{ margin: '0.5rem 0 0', color: '#6b7280' }}>
              Letter "P" as the primary shape, with the tail/stem connecting back to create an infinity loop. The P must be immediately recognizable, with infinity as a secondary element. Includes accent symbols in the loop space. Purple brand colors, no text.
            </p>
            <div style={{ marginTop: '1rem' }}>
              <button
                onClick={generateAllLogos}
                disabled={generating !== null}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#ec4899',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  cursor: generating ? 'not-allowed' : 'pointer',
                  opacity: generating ? 0.5 : 1
                }}
              >
                {generating ? 'Generating...' : `Generate All Logo Concepts (${theme} theme)`}
              </button>
            </div>
          </header>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem'
          }}>
            {logoConfigs.map((logo) => {
              const key = `${logo.id}-${theme}`;
              const logoUrl = logoImages[key];
              const isGenerating = generating === logo.id;

              return (
                <div key={logo.id} style={{
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  borderRadius: '0.75rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: logoUrl ? '2px solid #10b981' : '2px solid #e5e7eb'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.125rem' }}>
                      {logo.name}
                    </h3>
                    {logoUrl && (
                      <div style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#10b981',
                        borderRadius: '50%'
                      }} />
                    )}
                  </div>
                  
                  <p style={{ 
                    margin: '0 0 1rem', 
                    color: '#6b7280',
                    fontSize: '0.875rem'
                  }}>
                    {logo.description}
                  </p>

                  <div style={{
                    width: '100%',
                    height: '300px',
                    backgroundColor: '#f9fafb',
                    border: '2px dashed #d1d5db',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    overflow: 'hidden'
                  }}>
                    {isGenerating ? (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        color: '#6b7280'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          border: '4px solid #e5e7eb',
                          borderTop: '4px solid #8b5cf6',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        <span>Generating logo...</span>
                      </div>
                    ) : logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt={logo.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        color: '#9ca3af'
                      }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎨</div>
                        <div>Logo not generated yet</div>
                      </div>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '0.75rem'
                  }}>
                    <button
                      onClick={() => generateLogo(logo)}
                      disabled={isGenerating}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: isGenerating ? '#d1d5db' : '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 'medium',
                        cursor: isGenerating ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isGenerating ? 'Generating...' : 'Generate'}
                    </button>
                    
                    {logoUrl && (
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.download = `pathfinity-logo-${logo.id}-${theme}.png`;
                          link.href = logoUrl;
                          link.click();
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          fontWeight: 'medium',
                          cursor: 'pointer'
                        }}
                      >
                        ⬇️
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <footer style={{
          marginTop: '3rem',
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <p style={{ margin: 0 }}>
            💡 Images are saved to localStorage and can be downloaded. 
            This tool can be deprecated once all companion images are finalized.
          </p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem' }}>
            Access this page at: <code>/admin/image-generator</code>
          </p>
        </footer>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};