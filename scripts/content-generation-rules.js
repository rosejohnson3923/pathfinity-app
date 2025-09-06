/**
 * PATHFINITY CONTENT GENERATION RULES
 * Comprehensive guidelines for creating age-appropriate educational content
 */

export const CONTENT_GENERATION_RULES = {
  
  // Text Content Rules by Grade Level
  text_guidelines: {
    'Pre-K': {
      word_count_max: 50,
      sentence_length_max: 6,
      sentences_per_section: 2,
      vocabulary_level: 'pre_reader',
      reading_level: 0.5,
      instruction_steps_max: 3,
      concept_complexity: 'concrete_only'
    },
    'K': {
      word_count_max: 75,
      sentence_length_max: 8,
      sentences_per_section: 3,
      vocabulary_level: 'beginning_reader',
      reading_level: 1.0,
      instruction_steps_max: 4,
      concept_complexity: 'concrete_with_simple_patterns'
    },
    '1': {
      word_count_max: 100,
      sentence_length_max: 10,
      sentences_per_section: 4,
      vocabulary_level: 'early_elementary',
      reading_level: 1.5,
      instruction_steps_max: 5,
      concept_complexity: 'concrete_with_basic_abstractions'
    },
    '2': {
      word_count_max: 150,
      sentence_length_max: 12,
      sentences_per_section: 5,
      vocabulary_level: 'elementary',
      reading_level: 2.0,
      instruction_steps_max: 6,
      concept_complexity: 'introduction_to_abstract_thinking'
    },
    '3': {
      word_count_max: 200,
      sentence_length_max: 15,
      sentences_per_section: 6,
      vocabulary_level: 'intermediate_elementary',
      reading_level: 3.0,
      instruction_steps_max: 7,
      concept_complexity: 'basic_abstract_concepts'
    },
    '4': {
      word_count_max: 250,
      sentence_length_max: 18,
      sentences_per_section: 7,
      vocabulary_level: 'upper_elementary',
      reading_level: 4.0,
      instruction_steps_max: 8,
      concept_complexity: 'multi_step_abstract_thinking'
    },
    '5': {
      word_count_max: 300,
      sentence_length_max: 20,
      sentences_per_section: 8,
      vocabulary_level: 'advanced_elementary',
      reading_level: 5.0,
      instruction_steps_max: 9,
      concept_complexity: 'complex_abstract_concepts'
    },
    '6': {
      word_count_max: 400,
      sentence_length_max: 25,
      sentences_per_section: 10,
      vocabulary_level: 'middle_school',
      reading_level: 6.0,
      instruction_steps_max: 10,
      concept_complexity: 'analytical_thinking'
    },
    '7': {
      word_count_max: 450,
      sentence_length_max: 25,
      sentences_per_section: 11,
      vocabulary_level: 'middle_school_advanced',
      reading_level: 7.0,
      instruction_steps_max: 11,
      concept_complexity: 'critical_analysis'
    },
    '8': {
      word_count_max: 500,
      sentence_length_max: 30,
      sentences_per_section: 12,
      vocabulary_level: 'pre_high_school',
      reading_level: 8.0,
      instruction_steps_max: 12,
      concept_complexity: 'complex_critical_thinking'
    },
    '9': {
      word_count_max: 600,
      sentence_length_max: 35,
      sentences_per_section: 15,
      vocabulary_level: 'high_school',
      reading_level: 9.0,
      instruction_steps_max: 15,
      concept_complexity: 'advanced_analytical_thinking'
    },
    '10': {
      word_count_max: 700,
      sentence_length_max: 35,
      sentences_per_section: 17,
      vocabulary_level: 'high_school_intermediate',
      reading_level: 10.0,
      instruction_steps_max: 17,
      concept_complexity: 'synthesis_and_evaluation'
    },
    '11': {
      word_count_max: 800,
      sentence_length_max: 40,
      sentences_per_section: 20,
      vocabulary_level: 'high_school_advanced',
      reading_level: 11.0,
      instruction_steps_max: 20,
      concept_complexity: 'complex_synthesis'
    },
    '12': {
      word_count_max: 1000,
      sentence_length_max: 45,
      sentences_per_section: 25,
      vocabulary_level: 'college_prep',
      reading_level: 12.0,
      instruction_steps_max: 25,
      concept_complexity: 'advanced_synthesis_and_creation'
    }
  },

  // Visual Content Requirements by Grade Level
  visual_guidelines: {
    'Pre-K': {
      images_required: true,
      images_per_instruction: 3,
      image_types: ['simple_illustrations', 'photos_of_real_objects', 'basic_diagrams'],
      visual_complexity: 'minimal',
      color_usage: 'bright_primary_colors',
      text_on_images: false,
      interactive_elements: true
    },
    'K': {
      images_required: true,
      images_per_instruction: 2,
      image_types: ['illustrations', 'photos', 'simple_charts'],
      visual_complexity: 'simple',
      color_usage: 'primary_and_secondary_colors',
      text_on_images: 'minimal_labels',
      interactive_elements: true
    },
    '1': {
      images_required: true,
      images_per_instruction: 2,
      image_types: ['illustrations', 'diagrams', 'simple_infographics'],
      visual_complexity: 'simple_to_moderate',
      color_usage: 'varied_colors',
      text_on_images: 'short_labels',
      interactive_elements: true
    },
    '2': {
      images_required: true,
      images_per_instruction: 2,
      image_types: ['diagrams', 'charts', 'annotated_illustrations'],
      visual_complexity: 'moderate',
      color_usage: 'purposeful_color_coding',
      text_on_images: 'descriptive_labels',
      interactive_elements: true
    },
    '3': {
      images_required: true,
      images_per_instruction: 1,
      image_types: ['infographics', 'detailed_diagrams', 'process_charts'],
      visual_complexity: 'moderate_to_complex',
      color_usage: 'color_coding_for_organization',
      text_on_images: 'explanatory_text',
      interactive_elements: 'optional'
    },
    '4': {
      images_required: true,
      images_per_instruction: 1,
      image_types: ['complex_diagrams', 'data_visualizations', 'concept_maps'],
      visual_complexity: 'complex',
      color_usage: 'strategic_color_use',
      text_on_images: 'detailed_annotations',
      interactive_elements: 'optional'
    },
    '5': {
      images_required: true,
      images_per_instruction: 1,
      image_types: ['advanced_diagrams', 'graphs', 'technical_illustrations'],
      visual_complexity: 'complex',
      color_usage: 'professional_color_schemes',
      text_on_images: 'comprehensive_labeling',
      interactive_elements: 'optional'
    },
    '6': {
      images_required: 'recommended',
      images_per_instruction: 1,
      image_types: ['scientific_diagrams', 'data_charts', 'technical_graphics'],
      visual_complexity: 'complex_with_detail',
      color_usage: 'academic_color_schemes',
      text_on_images: 'detailed_annotations',
      interactive_elements: 'optional'
    },
    '7': {
      images_required: 'recommended',
      images_per_instruction: 1,
      image_types: ['analytical_charts', 'complex_diagrams', 'research_graphics'],
      visual_complexity: 'sophisticated',
      color_usage: 'professional_presentation',
      text_on_images: 'analytical_annotations',
      interactive_elements: 'optional'
    },
    '8': {
      images_required: 'recommended',
      images_per_instruction: 1,
      image_types: ['advanced_charts', 'research_visualizations', 'technical_schematics'],
      visual_complexity: 'sophisticated',
      color_usage: 'research_quality',
      text_on_images: 'research_annotations',
      interactive_elements: 'optional'
    },
    '9': {
      images_required: 'as_needed',
      images_per_instruction: 1,
      image_types: ['professional_graphics', 'research_charts', 'academic_diagrams'],
      visual_complexity: 'professional',
      color_usage: 'academic_standards',
      text_on_images: 'professional_annotations',
      interactive_elements: 'optional'
    },
    '10': {
      images_required: 'as_needed',
      images_per_instruction: 1,
      image_types: ['advanced_analytics', 'research_visualizations', 'professional_charts'],
      visual_complexity: 'professional',
      color_usage: 'research_quality',
      text_on_images: 'research_level_detail',
      interactive_elements: 'optional'
    },
    '11': {
      images_required: 'as_needed',
      images_per_instruction: 1,
      image_types: ['college_level_graphics', 'research_quality_charts', 'academic_visualizations'],
      visual_complexity: 'college_level',
      color_usage: 'publication_quality',
      text_on_images: 'academic_annotations',
      interactive_elements: 'optional'
    },
    '12': {
      images_required: 'as_needed',
      images_per_instruction: 1,
      image_types: ['publication_quality_graphics', 'advanced_research_charts', 'professional_visualizations'],
      visual_complexity: 'publication_quality',
      color_usage: 'professional_standards',
      text_on_images: 'publication_quality_annotations',
      interactive_elements: 'optional'
    }
  },

  // Learning Style Adaptations
  learning_style_adaptations: {
    visual: {
      content_emphasis: ['diagrams', 'charts', 'color_coding', 'visual_organizers'],
      text_formatting: ['bullet_points', 'highlighted_key_terms', 'visual_hierarchy'],
      interaction_types: ['drag_and_drop', 'visual_matching', 'image_annotation']
    },
    auditory: {
      content_emphasis: ['spoken_instructions', 'sound_cues', 'rhythm_patterns', 'verbal_explanations'],
      text_formatting: ['read_aloud_indicators', 'pronunciation_guides', 'verbal_cues'],
      interaction_types: ['voice_responses', 'audio_feedback', 'listening_exercises']
    },
    kinesthetic: {
      content_emphasis: ['hands_on_activities', 'movement_based_learning', 'manipulatives', 'real_world_applications'],
      text_formatting: ['action_verbs', 'step_by_step_procedures', 'physical_activity_cues'],
      interaction_types: ['drag_and_drop', 'building_activities', 'simulation_games']
    }
  },

  // Attention Span Considerations
  attention_span_guidelines: {
    short: {
      content_chunks: 'micro_lessons',
      max_duration_minutes: 5,
      break_frequency: 'every_2_minutes',
      interaction_frequency: 'every_30_seconds'
    },
    medium: {
      content_chunks: 'mini_lessons',
      max_duration_minutes: 15,
      break_frequency: 'every_5_minutes',
      interaction_frequency: 'every_2_minutes'
    },
    long: {
      content_chunks: 'full_lessons',
      max_duration_minutes: 30,
      break_frequency: 'every_10_minutes',
      interaction_frequency: 'every_5_minutes'
    }
  },

  // Technology Comfort Adaptations
  technology_adaptations: {
    beginner: {
      interface_complexity: 'minimal',
      instructions_detail: 'step_by_step_with_screenshots',
      navigation: 'linear_with_clear_next_steps',
      help_availability: 'always_visible'
    },
    medium: {
      interface_complexity: 'moderate',
      instructions_detail: 'clear_with_visual_cues',
      navigation: 'flexible_with_guidance',
      help_availability: 'easily_accessible'
    },
    high: {
      interface_complexity: 'advanced',
      instructions_detail: 'brief_with_examples',
      navigation: 'free_form_exploration',
      help_availability: 'on_demand'
    }
  }
};

// Content Validation Functions
export const validateContent = (content, grade, learningStyle, attentionSpan) => {
  const rules = CONTENT_GENERATION_RULES.text_guidelines[grade];
  const visualRules = CONTENT_GENERATION_RULES.visual_guidelines[grade];
  
  const validation = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Text validation
  const wordCount = content.text ? content.text.split(' ').length : 0;
  if (wordCount > rules.word_count_max) {
    validation.errors.push(`Word count ${wordCount} exceeds maximum ${rules.word_count_max} for grade ${grade}`);
    validation.valid = false;
  }

  // Visual requirements validation
  if (visualRules.images_required === true && (!content.images || content.images.length === 0)) {
    validation.errors.push(`Images are required for grade ${grade} but none provided`);
    validation.valid = false;
  }

  return validation;
};

// Content Generation Prompt Builder
export const buildContentPrompt = (student, subject, contentType) => {
  const grade = student.grade_level;
  const textRules = CONTENT_GENERATION_RULES.text_guidelines[grade];
  const visualRules = CONTENT_GENERATION_RULES.visual_guidelines[grade];
  const styleAdaptations = CONTENT_GENERATION_RULES.learning_style_adaptations[student.learning_preferences.learning_style];
  const attentionRules = CONTENT_GENERATION_RULES.attention_span_guidelines[student.learning_preferences.attention_span];

  return `Generate ${contentType} content following these strict guidelines:

STUDENT PROFILE:
- Name: ${student.display_name}
- Grade: ${grade} 
- Learning Style: ${student.learning_preferences.learning_style}
- Attention Span: ${student.learning_preferences.attention_span}
- Technology Comfort: ${student.learning_preferences.technology_comfort}

CONTENT RULES FOR GRADE ${grade}:
- Maximum words: ${textRules.word_count_max}
- Maximum sentence length: ${textRules.sentence_length_max} words
- Reading level: ${textRules.reading_level}
- Maximum instruction steps: ${textRules.instruction_steps_max}
- Concept complexity: ${textRules.concept_complexity}

VISUAL REQUIREMENTS:
- Images required: ${visualRules.images_required}
- Images per instruction: ${visualRules.images_per_instruction}
- Image types: ${visualRules.image_types.join(', ')}
- Visual complexity: ${visualRules.visual_complexity}

LEARNING STYLE ADAPTATIONS:
- Emphasis: ${styleAdaptations.content_emphasis.join(', ')}
- Text formatting: ${styleAdaptations.text_formatting.join(', ')}
- Interaction types: ${styleAdaptations.interaction_types.join(', ')}

ATTENTION SPAN CONSIDERATIONS:
- Content chunk size: ${attentionRules.content_chunks}
- Maximum duration: ${attentionRules.max_duration_minutes} minutes
- Interaction frequency: ${attentionRules.interaction_frequency}

CRITICAL: The content MUST comply with ALL word count, sentence length, and complexity requirements for grade ${grade}.`;
};