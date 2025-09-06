/**
 * Modal Type Resolver - P0 Critical Fix
 * Ensures every AI response includes proper modal type declaration
 */

import { 
  AIContentResponse, 
  ModalTypeEnum, 
  ContentTypeEnum,
  ContentData 
} from '../types';

export class ModalTypeResolver {
  private modalTypeMap: Map<ContentTypeEnum, ModalTypeEnum> = new Map([
    // Assessment Types
    [ContentTypeEnum.FILL_BLANK, ModalTypeEnum.FILL_BLANK],
    [ContentTypeEnum.SINGLE_SELECT, ModalTypeEnum.SINGLE_SELECT],
    [ContentTypeEnum.MULTIPLE_SELECT, ModalTypeEnum.MULTI_SELECT],
    [ContentTypeEnum.DRAG_DROP, ModalTypeEnum.DRAG_DROP],
    [ContentTypeEnum.SEQUENCE, ModalTypeEnum.SEQUENCE],
    [ContentTypeEnum.TRUE_FALSE, ModalTypeEnum.TRUE_FALSE],
    [ContentTypeEnum.MATCHING, ModalTypeEnum.MATCHING],
    [ContentTypeEnum.SHORT_ANSWER, ModalTypeEnum.SHORT_ANSWER],
    [ContentTypeEnum.ESSAY, ModalTypeEnum.ESSAY],
    [ContentTypeEnum.DRAWING, ModalTypeEnum.DRAWING],
    
    // Interactive Types
    [ContentTypeEnum.CODE_EDITOR, ModalTypeEnum.CODE_EDITOR],
    [ContentTypeEnum.MATH_INPUT, ModalTypeEnum.MATH_INPUT],
    [ContentTypeEnum.GRAPH_CHART, ModalTypeEnum.GRAPH_CHART],
    [ContentTypeEnum.TIMELINE, ModalTypeEnum.TIMELINE],
    [ContentTypeEnum.HOTSPOT, ModalTypeEnum.HOTSPOT],
    [ContentTypeEnum.SLIDER, ModalTypeEnum.SLIDER],
    [ContentTypeEnum.MATRIX, ModalTypeEnum.MATRIX],
    [ContentTypeEnum.SCENARIO, ModalTypeEnum.SCENARIO],
    [ContentTypeEnum.SIMULATION, ModalTypeEnum.SIMULATION],
    [ContentTypeEnum.VOICE, ModalTypeEnum.VOICE],
    
    // Collaborative Types
    [ContentTypeEnum.PEER_REVIEW, ModalTypeEnum.PEER_REVIEW],
    [ContentTypeEnum.DISCUSSION, ModalTypeEnum.DISCUSSION],
    [ContentTypeEnum.COLLAB_DOC, ModalTypeEnum.COLLAB_DOC],
    [ContentTypeEnum.POLL, ModalTypeEnum.POLL],
    [ContentTypeEnum.BRAINSTORM, ModalTypeEnum.BRAINSTORM]
  ]);

  /**
   * Determine modal type from content analysis
   */
  public resolveModalType(content: any): ModalTypeEnum {
    // First, check if modal type is already specified
    if (content.modalType && this.isValidModalType(content.modalType)) {
      return content.modalType;
    }

    // Check if content type is specified
    if (content.contentType) {
      const mappedType = this.modalTypeMap.get(content.contentType);
      if (mappedType) {
        return mappedType;
      }
    }

    // Intelligent detection based on content structure
    return this.detectModalTypeFromStructure(content);
  }

  /**
   * Detect modal type from content structure
   */
  private detectModalTypeFromStructure(content: any): ModalTypeEnum {
    // Fill-in-blank detection
    if (this.isFillBlankContent(content)) {
      return ModalTypeEnum.FILL_BLANK;
    }

    // Single/Multiple selection detection
    if (this.isSelectionContent(content)) {
      if (content.multipleCorrect || content.maxSelections > 1) {
        return ModalTypeEnum.MULTI_SELECT;
      }
      return ModalTypeEnum.SINGLE_SELECT;
    }

    // Drag and drop detection
    if (this.isDragDropContent(content)) {
      return ModalTypeEnum.DRAG_DROP;
    }

    // Code editor detection
    if (this.isCodeContent(content)) {
      return ModalTypeEnum.CODE_EDITOR;
    }

    // Math input detection
    if (this.isMathContent(content)) {
      return ModalTypeEnum.MATH_INPUT;
    }

    // Drawing detection
    if (this.isDrawingContent(content)) {
      return ModalTypeEnum.DRAWING;
    }

    // Sequence detection
    if (this.isSequenceContent(content)) {
      return ModalTypeEnum.SEQUENCE;
    }

    // True/False detection
    if (this.isTrueFalseContent(content)) {
      return ModalTypeEnum.TRUE_FALSE;
    }

    // Default to short answer for text-based content
    if (this.isTextContent(content)) {
      return ModalTypeEnum.SHORT_ANSWER;
    }

    // Final fallback
    console.warn('Could not determine modal type, defaulting to SHORT_ANSWER');
    return ModalTypeEnum.SHORT_ANSWER;
  }

  /**
   * Content type detection methods
   */
  private isFillBlankContent(content: any): boolean {
    return !!(
      content.text && 
      (content.blanks || content.gaps || 
       content.text.includes('___') || 
       content.text.includes('[blank]') ||
       content.text.includes('{{'))
    );
  }

  private isSelectionContent(content: any): boolean {
    return !!(
      content.options || 
      content.choices || 
      content.answers ||
      (content.question && Array.isArray(content.items))
    );
  }

  private isDragDropContent(content: any): boolean {
    return !!(
      (content.sources && content.targets) ||
      (content.draggables && content.droppables) ||
      content.dragItems ||
      content.dropZones
    );
  }

  private isCodeContent(content: any): boolean {
    return !!(
      content.language ||
      content.code ||
      content.testCases ||
      content.starterCode ||
      content.programmingLanguage
    );
  }

  private isMathContent(content: any): boolean {
    return !!(
      content.equation ||
      content.formula ||
      content.mathExpression ||
      content.latex ||
      (content.problem && content.answerFormat === 'mathematical')
    );
  }

  private isDrawingContent(content: any): boolean {
    return !!(
      content.canvas ||
      content.drawingTools ||
      content.sketchpad ||
      content.artboard
    );
  }

  private isSequenceContent(content: any): boolean {
    return !!(
      content.sequence ||
      content.ordering ||
      content.sortable ||
      (content.items && content.correctOrder)
    );
  }

  private isTrueFalseContent(content: any): boolean {
    return !!(
      content.statement && 
      (content.correctAnswer === true || 
       content.correctAnswer === false ||
       content.options?.length === 2)
    );
  }

  private isTextContent(content: any): boolean {
    return !!(
      content.prompt ||
      content.question ||
      content.instructions
    );
  }

  /**
   * Validate modal type
   */
  private isValidModalType(modalType: string): boolean {
    return Object.values(ModalTypeEnum).includes(modalType as ModalTypeEnum);
  }

  /**
   * Add modal type to response
   */
  public ensureModalType(response: any): AIContentResponse {
    const modalType = this.resolveModalType(response);
    
    // Add modal type to response
    response.modalType = modalType;
    
    // Log for monitoring
    console.log(`Modal type resolved: ${modalType}`, {
      contentId: response.contentId,
      originalType: response.contentType,
      detectedType: modalType
    });
    
    return response;
  }

  /**
   * Batch process responses to add modal types
   */
  public async batchEnsureModalTypes(
    responses: any[]
  ): Promise<AIContentResponse[]> {
    return responses.map(response => this.ensureModalType(response));
  }

  /**
   * Get confidence score for modal type detection
   */
  public getConfidenceScore(content: any): number {
    let score = 0;
    const maxScore = 5;

    // Has explicit modal type
    if (content.modalType && this.isValidModalType(content.modalType)) {
      return 1.0;
    }

    // Has content type that maps to modal
    if (content.contentType && this.modalTypeMap.has(content.contentType)) {
      score += 2;
    }

    // Has clear structural indicators
    if (this.hasStrongStructuralIndicators(content)) {
      score += 2;
    }

    // Has metadata hints
    if (content.metadata?.suggestedModal) {
      score += 1;
    }

    return Math.min(score / maxScore, 1.0);
  }

  private hasStrongStructuralIndicators(content: any): boolean {
    const indicators = [
      this.isFillBlankContent,
      this.isSelectionContent,
      this.isDragDropContent,
      this.isCodeContent,
      this.isMathContent,
      this.isDrawingContent,
      this.isSequenceContent,
      this.isTrueFalseContent
    ];

    return indicators.some(indicator => indicator.call(this, content));
  }
}

// Singleton export
export const modalTypeResolver = new ModalTypeResolver();