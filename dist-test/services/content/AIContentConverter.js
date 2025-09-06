"use strict";
/**
 * AI CONTENT CONVERTER
 * Converts AI-generated content from AILearningJourneyService format
 * to proper Question objects that work with QuestionRenderer
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiContentConverter = exports.AIContentConverter = void 0;
class AIContentConverter {
    constructor() {
        this.idCounter = 0;
    }
    static getInstance() {
        if (!AIContentConverter.instance) {
            AIContentConverter.instance = new AIContentConverter();
        }
        return AIContentConverter.instance;
    }
    /**
     * Generate unique IDs for questions
     */
    generateQuestionId(prefix = 'q') {
        this.idCounter++;
        return `${prefix}-${Date.now()}-${this.idCounter}`;
    }
    /**
     * Convert assessment from AI format to Question object
     */
    convertAssessment(assessment, skillInfo) {
        // Log the assessment structure to debug
        console.log('📝 Converting assessment:', {
            question: assessment?.question,
            type: assessment?.type,
            visual: assessment?.visual,
            options: assessment?.options,
            correctAnswer: assessment?.correct_answer
        });
        // Detect type if not provided
        const questionType = this.detectQuestionType(assessment, skillInfo);
        console.log('🎯 Detected question type:', questionType);
        // No need to normalize type variants anymore
        const normalizedType = questionType;
        // Convert based on type
        switch (normalizedType) {
            case 'counting':
                return this.toCountingQuestion(assessment, skillInfo);
            case 'multiple_choice':
                return this.toMultipleChoiceQuestion(assessment, skillInfo);
            case 'true_false':
                return this.toTrueFalseQuestion(assessment, skillInfo);
            case 'fill_blank':
                return this.toFillBlankQuestion(assessment, skillInfo);
            case 'numeric':
                return this.toNumericQuestion(assessment, skillInfo);
            case 'short_answer':
                return this.toShortAnswerQuestion(assessment, skillInfo);
            case 'long_answer':
                return this.toLongAnswerQuestion(assessment, skillInfo);
            case 'matching':
                return this.toMatchingQuestion(assessment, skillInfo);
            case 'ordering':
                return this.toOrderingQuestion(assessment, skillInfo);
            case 'classification':
                return this.toClassificationQuestion(assessment, skillInfo);
            case 'visual_identification':
                return this.toVisualIdentificationQuestion(assessment, skillInfo);
            case 'pattern_recognition':
                return this.toPatternRecognitionQuestion(assessment, skillInfo);
            case 'code_completion':
                return this.toCodeCompletionQuestion(assessment, skillInfo);
            case 'diagram_labeling':
                return this.toDiagramLabelingQuestion(assessment, skillInfo);
            case 'open_ended':
                return this.toOpenEndedQuestion(assessment, skillInfo);
            default:
                // Default to multiple choice if we have options
                if (assessment.options && assessment.options.length > 0) {
                    return this.toMultipleChoiceQuestion(assessment, skillInfo);
                }
                return this.toShortAnswerQuestion(assessment, skillInfo);
        }
    }
    /**
     * Convert practice questions from AI format to Question objects
     */
    convertPracticeQuestions(practice, skillInfo) {
        return practice.map((q, index) => {
            console.log(`🔍 Converting practice question ${index}:`, {
                originalQuestion: q,
                questionField: q.question,
                contentField: q.content,
                hasVisual: !!q.visual,
                visual: q.visual,
                type: q.type
            });
            const question = this.convertAssessment({
                ...q,
                success_message: 'Great job!'
            }, skillInfo);
            // Add practice-specific metadata
            question.id = this.generateQuestionId(`practice-${index}`);
            if (q.hint) {
                question.hints = [q.hint];
            }
            console.log(`✅ Converted practice question ${index}:`, {
                id: question.id,
                type: question.type,
                content: question.content,
                hasContent: !!question.content,
                hasMedia: !!question.media,
                media: question.media
            });
            return question;
        });
    }
    detectQuestionType(assessment, skillInfo) {
        // Ensure question is a string first
        const questionText = String(assessment.question || '').toLowerCase();
        // Check for counting patterns
        // But trust the AI's type since we've improved the prompt
        const countingPatterns = [
            'how many',
            'count',
            'total number',
            'what is the number',
            'how much',
            'find the number'
        ];
        const hasCountingPattern = countingPatterns.some(pattern => questionText.includes(pattern));
        // If it has counting pattern AND visual with emojis, override to counting
        if (hasCountingPattern && assessment.visual) {
            // Handle visual as either string or object with content property
            const visualContent = typeof assessment.visual === 'string'
                ? assessment.visual
                : assessment.visual?.content || assessment.visual?.text || '';
            const hasEmojis = visualContent && /[\p{Emoji}]/u.test(visualContent);
            if (hasEmojis) {
                console.log('🎯 Overriding type to counting due to pattern + emojis', {
                    visual: assessment.visual,
                    visualContent,
                    hasEmojis
                });
                return 'counting';
            }
        }
        // If it has counting pattern AND all numeric options, check context first
        if (hasCountingPattern && assessment.options) {
            // CRITICAL: Check if it's a selection/comparison question first
            const selectionKeywords = ['which', 'what is the', 'select', 'choose', 'largest', 'smallest', 'biggest', 'highest', 'lowest', 'best', 'worst', 'greatest', 'least'];
            const hasSelectionKeyword = selectionKeywords.some(keyword => questionText.includes(keyword));
            if (hasSelectionKeyword) {
                console.log('🎯 Detected as multiple_choice due to selection/comparison keywords');
                return 'multiple_choice';
            }
            // Only treat as counting if numeric options AND no selection keywords
            const allNumeric = assessment.options.every((opt) => !isNaN(Number(opt)));
            if (allNumeric && !hasSelectionKeyword) {
                console.log('🎯 Overriding type to counting due to pattern + numeric options (no selection keywords)');
                return 'counting';
            }
        }
        // Now check if type is explicitly set and handle it
        if (assessment.type) {
            // No variants needed - just use the type as-is
            return assessment.type;
        }
        // Also check if it's a math question for young grades with visual (fallback)
        if (assessment.visual && skillInfo.subject === 'Math' &&
            (parseInt(skillInfo.grade) <= 2 || skillInfo.grade === 'K')) {
            return 'counting';
        }
        // Check for fill in the blank
        if (questionText.includes('_____') || questionText.includes('___')) {
            return 'fill_blank';
        }
        // Check for true/false
        if (assessment.options?.length === 2 &&
            (assessment.options.includes('True') || assessment.options.includes('true'))) {
            return 'true_false';
        }
        // For questions with counting patterns but numeric options, still treat as counting
        if (hasCountingPattern && assessment.options) {
            const allNumeric = assessment.options.every((opt) => !isNaN(Number(opt)));
            if (allNumeric) {
                console.log('🎯 Detected as counting question due to pattern + numeric options');
                return 'counting';
            }
        }
        // Default to multiple choice if options exist
        if (assessment.options && assessment.options.length > 0) {
            return 'multiple_choice';
        }
        // Check for numeric
        if (skillInfo.subject === 'Math' && !isNaN(Number(assessment.correct_answer))) {
            return 'numeric';
        }
        return 'short_answer';
    }
    toCountingQuestion(assessment, skillInfo) {
        // Count emojis in visual - this is the primary source of truth
        let correctCount = 0;
        if (assessment.visual && assessment.visual !== '❓') {
            // Handle visual as either string or object with content property
            const visualContent = typeof assessment.visual === 'string'
                ? assessment.visual
                : assessment.visual?.content || assessment.visual?.text || '';
            const matches = visualContent.match(/[\p{Emoji}]/gu);
            correctCount = matches ? matches.length : 0;
            console.log('🔢 Counting visual emojis:', {
                visual: assessment.visual,
                visualContent,
                emojiCount: correctCount
            });
        }
        // Fallback: If no visual or no emojis found, check correct_answer
        if (correctCount === 0) {
            if (typeof assessment.correct_answer === 'number') {
                // Check if it's an index into options
                if (assessment.options && assessment.correct_answer < assessment.options.length) {
                    const optionValue = assessment.options[assessment.correct_answer];
                    correctCount = parseInt(optionValue) || assessment.correct_answer;
                }
                else {
                    // It's the actual count
                    correctCount = assessment.correct_answer;
                }
            }
            else if (typeof assessment.correct_answer === 'string') {
                correctCount = parseInt(assessment.correct_answer) || 0;
            }
        }
        console.log('🔢 Counting question:', {
            visual: assessment.visual,
            correctCount,
            originalAnswer: assessment.correct_answer
        });
        return {
            id: this.generateQuestionId('assessment'),
            type: 'counting',
            content: String(assessment.content || assessment.question || ''),
            topic: skillInfo.skill_name,
            subject: skillInfo.subject,
            difficulty: 'easy',
            points: 10,
            visualElements: (assessment.visual && assessment.visual !== '❓') ? {
                type: 'objects',
                description: typeof assessment.visual === 'string'
                    ? assessment.visual
                    : assessment.visual?.content || assessment.visual?.text || ''
            } : undefined,
            correctCount, // Use the determined count
            countWhat: 'items', // Default label
            minCount: 0,
            maxCount: 10,
            explanation: assessment.explanation,
            metadata: {
                bloomsLevel: 'remember',
                estimatedTime: 30
            }
        };
    }
    toMultipleChoiceQuestion(assessment, skillInfo) {
        const options = assessment.options || [];
        // CRITICAL DEBUG: Log exactly what we receive
        console.log('🔍 MULTIPLE CHOICE RAW INPUT:', {
            correct_answer: assessment.correct_answer,
            correctAnswer: assessment.correctAnswer, // Check camelCase too
            correct_answer_type: typeof assessment.correct_answer,
            correctAnswer_type: typeof assessment.correctAnswer,
            options: assessment.options,
            has_correct_answer: 'correct_answer' in assessment,
            has_correctAnswer: 'correctAnswer' in assessment,
            assessment_keys: Object.keys(assessment)
        });
        // Handle correct_answer which can be either snake_case or camelCase
        // Check both correct_answer and correctAnswer fields
        const rawCorrectAnswer = assessment.correct_answer !== undefined
            ? assessment.correct_answer
            : assessment.correctAnswer;
        // Handle correct_answer which can be either:
        // 1. A number (index into options array)
        // 2. A string (the actual answer text)
        let correctAnswer;
        if (typeof rawCorrectAnswer === 'number') {
            // It's an index
            if (rawCorrectAnswer >= 0 && rawCorrectAnswer < options.length) {
                correctAnswer = String(options[rawCorrectAnswer]);
            }
            else {
                console.warn('⚠️ Invalid correct_answer index:', rawCorrectAnswer, 'for options:', options);
                correctAnswer = '';
            }
        }
        else if (rawCorrectAnswer) {
            // It's the actual answer text
            correctAnswer = String(rawCorrectAnswer);
        }
        else {
            // No correct answer provided - default to first option
            console.warn('⚠️ No correct_answer provided for multiple choice, defaulting to first option');
            correctAnswer = options.length > 0 ? String(options[0]) : '';
            // Also set the raw value for index calculation
            assessment.correct_answer = 0;
        }
        // Try to find the correct index
        let correctIndex = -1;
        if (typeof rawCorrectAnswer === 'number') {
            // We already handled this above by setting correctAnswer to the option text
            correctIndex = rawCorrectAnswer;
        }
        else if (correctAnswer) {
            // Find the index by matching the text
            for (let i = 0; i < options.length; i++) {
                const optionText = String(options[i]).trim();
                const answerText = correctAnswer.trim();
                // Try exact match first
                if (optionText === answerText) {
                    correctIndex = i;
                    break;
                }
                // Try case-insensitive match
                if (optionText.toLowerCase() === answerText.toLowerCase()) {
                    correctIndex = i;
                    break;
                }
            }
        }
        console.log('🎯 MultipleChoice conversion:', {
            options,
            correctAnswer,
            correctIndex,
            foundMatch: correctIndex !== -1,
            optionsAsStrings: options.map(o => String(o))
        });
        // Log warning if no correct answer found
        if (correctIndex === -1) {
            console.warn('⚠️ No matching option found for correct answer:', {
                correctAnswer,
                availableOptions: options,
                assessment
            });
        }
        // Handle visual field - it can be a string (emoji) or an object with content property
        let mediaObject = undefined;
        if (assessment.visual) {
            const visualContent = typeof assessment.visual === 'string'
                ? assessment.visual
                : assessment.visual.content || assessment.visual;
            console.log('🎨 Converting MultipleChoice visual:', {
                original: assessment.visual,
                extracted: visualContent,
                type: typeof assessment.visual
            });
            // Only add media if we have actual emoji content (not the placeholder '📝')
            if (visualContent && visualContent !== '📝') {
                mediaObject = {
                    type: 'image',
                    url: visualContent,
                    alt: 'Question visual'
                };
            }
        }
        return {
            id: this.generateQuestionId('assessment'),
            type: 'multiple_choice',
            content: String(assessment.content || assessment.question || ''),
            topic: skillInfo.skill_name,
            subject: skillInfo.subject,
            difficulty: 'medium',
            points: 10,
            options: options.map((opt, idx) => ({
                id: `opt-${idx}`,
                text: String(opt),
                isCorrect: idx === correctIndex
            })),
            allowMultiple: false,
            randomizeOptions: false,
            explanation: assessment.explanation,
            media: mediaObject,
            metadata: {
                bloomsLevel: 'understand',
                estimatedTime: 45
            }
        };
    }
    toTrueFalseQuestion(assessment, skillInfo) {
        // Handle correct_answer which can be either snake_case or camelCase
        const rawCorrectAnswer = assessment.correct_answer !== undefined
            ? assessment.correct_answer
            : assessment.correctAnswer;
        // Handle different formats of correct answer
        let correctAnswer;
        console.log('🔍 TrueFalse conversion - input:', {
            correct_answer: assessment.correct_answer,
            correctAnswer: assessment.correctAnswer,
            rawCorrectAnswer: rawCorrectAnswer,
            type: typeof rawCorrectAnswer,
            options: assessment.options,
            question: assessment.question,
            visual: assessment.visual
        });
        if (typeof rawCorrectAnswer === 'boolean') {
            // AI now sends proper boolean values
            correctAnswer = rawCorrectAnswer;
        }
        else if (typeof rawCorrectAnswer === 'string') {
            // Legacy support for string formats
            const answerStr = String(rawCorrectAnswer).trim().toLowerCase();
            correctAnswer = answerStr === 'true' || answerStr === 't' || answerStr === 'yes' || answerStr === '1';
        }
        else if (typeof rawCorrectAnswer === 'number') {
            // If options array exists, use index
            if (assessment.options && assessment.options.length > 0) {
                const selectedOption = assessment.options[rawCorrectAnswer];
                correctAnswer = selectedOption?.toLowerCase() === 'true';
            }
            else {
                // 0 = true, 1 = false (common convention)
                correctAnswer = rawCorrectAnswer === 0;
            }
        }
        else if (rawCorrectAnswer === undefined && assessment.visual) {
            // SPECIAL CASE: If no correct_answer but has visual, try to infer from question
            const questionText = String(assessment.question || '').toLowerCase();
            const visualContent = typeof assessment.visual === 'string'
                ? assessment.visual
                : assessment.visual?.content || assessment.visual?.text || '';
            // Count emojis in visual
            const emojiCount = (visualContent.match(/[\p{Emoji}]/gu) || []).length;
            // Check if question mentions a number
            const numberMatch = questionText.match(/there (?:are|is) (\d+)/);
            if (numberMatch) {
                const mentionedNumber = parseInt(numberMatch[1]);
                correctAnswer = emojiCount === mentionedNumber;
                console.log('🎯 Inferred TrueFalse answer from visual count:', {
                    emojiCount,
                    mentionedNumber,
                    correctAnswer
                });
            }
            else {
                // Default to false if we can't determine
                correctAnswer = false;
            }
        }
        else {
            // Default to false if we can't determine
            correctAnswer = false;
        }
        console.log('✅ TrueFalse conversion - output:', {
            correctAnswer,
            correctAnswerType: typeof correctAnswer,
            isBoolean: typeof correctAnswer === 'boolean'
        });
        // Ensure correctAnswer is always a boolean
        if (typeof correctAnswer !== 'boolean') {
            console.warn('⚠️ TrueFalse correctAnswer is not boolean, defaulting to false:', {
                assessment,
                correctAnswer
            });
            correctAnswer = false;
        }
        // Handle visual field - skip if it's the placeholder ❓
        let mediaObject = undefined;
        if (assessment.visual && assessment.visual !== '❓') {
            const visualContent = typeof assessment.visual === 'string'
                ? assessment.visual
                : assessment.visual.content || assessment.visual;
            console.log('🎨 Converting TrueFalse visual:', {
                original: assessment.visual,
                isPlaceholder: assessment.visual === '❓',
                extracted: visualContent,
                mediaObject: {
                    type: 'image',
                    url: visualContent,
                    alt: 'Question visual'
                }
            });
            mediaObject = {
                type: 'image',
                url: visualContent,
                alt: 'Question visual'
            };
        }
        // Extract the actual statement from the question
        // Remove "True or False:" prefix if present
        const fullQuestion = String(assessment.content || assessment.question || '');
        let statement = fullQuestion;
        // Common patterns to remove
        const prefixPatterns = [
            /^true or false:?\s*/i,
            /^t\/f:?\s*/i,
            /^is it true that:?\s*/i,
            /^is the following true:?\s*/i
        ];
        for (const pattern of prefixPatterns) {
            if (pattern.test(statement)) {
                statement = statement.replace(pattern, '');
                break;
            }
        }
        // If no pattern matched but we have "statement" field, use it
        if (statement === fullQuestion && assessment.statement) {
            statement = String(assessment.statement);
        }
        return {
            id: this.generateQuestionId('assessment'),
            type: 'true_false',
            content: fullQuestion,
            statement: statement.trim(),
            topic: skillInfo.skill_name,
            subject: skillInfo.subject,
            difficulty: 'easy',
            points: 5,
            correctAnswer,
            explanation: assessment.explanation,
            // Include visual as media if present
            media: mediaObject,
            metadata: {
                bloomsLevel: 'understand',
                estimatedTime: 20
            }
        };
    }
    toFillBlankQuestion(assessment, skillInfo) {
        // CRITICAL: Use the template and blanks from validator if they exist
        if (assessment.template && assessment.blanks) {
            console.log('🎯 Using validator-generated template and blanks');
            // Convert blanks format to match FillBlankQuestion structure
            const blanks = assessment.blanks.map((blank, index) => ({
                id: blank.id || `blank_${index}`,
                position: index * 10, // Approximate position
                correctAnswers: Array.isArray(blank.correctAnswers)
                    ? blank.correctAnswers
                    : [blank.correctAnswers || 'answer'],
                caseSensitive: false
            }));
            // Convert template format: _____ to {{blank_0}}
            let template = assessment.template;
            blanks.forEach((blank, index) => {
                template = template.replace(/_____/, `{{${blank.id}}}`);
            });
            return {
                id: `fb_${Date.now()}`,
                type: 'fill_blank',
                content: assessment.question || assessment.template || 'Fill in the blank',
                template: template,
                blanks: blanks,
                correctAnswers: blanks.map(b => b.correctAnswers[0]),
                acceptableAnswers: blanks.map(b => b.correctAnswers),
                difficulty: 'medium',
                points: 10,
                topic: skillInfo.skill_name,
                subject: skillInfo.subject,
                metadata: {
                    subject: skillInfo.subject,
                    grade: skillInfo.grade,
                    skill: skillInfo.skill_name,
                    difficulty: 'medium',
                    estimatedTime: 30
                }
            };
        }
        // Fallback: Extract all blank positions and create template
        const question = String(assessment.question || '');
        const blankMatches = question.match(/_{3,}/g); // Note the 'g' flag for multiple matches
        // Handle multiple blanks
        let template = question;
        const blanks = [];
        if (blankMatches && blankMatches.length > 0) {
            blankMatches.forEach((match, index) => {
                const blankId = `blank_${index}`;
                // Replace each occurrence with its placeholder
                template = template.replace(match, `{{${blankId}}}`);
                // Handle correct answers - if array, distribute among blanks
                let correctAnswersForBlank;
                if (Array.isArray(assessment.correct_answer)) {
                    correctAnswersForBlank = index < assessment.correct_answer.length
                        ? [String(assessment.correct_answer[index])]
                        : [String(assessment.correct_answer[0])]; // Fallback to first answer
                }
                else {
                    correctAnswersForBlank = [String(assessment.correct_answer)];
                }
                blanks.push({
                    id: blankId,
                    position: question.indexOf(match),
                    correctAnswers: correctAnswersForBlank,
                    caseSensitive: false
                });
            });
        }
        else {
            // No blanks found, create a default template
            template = question.replace(/_{3,}/g, '{{blank_0}}');
            blanks.push({
                id: 'blank_0',
                position: 0,
                correctAnswers: Array.isArray(assessment.correct_answer)
                    ? assessment.correct_answer.map(String)
                    : [String(assessment.correct_answer)],
                caseSensitive: false
            });
        }
        const result = {
            id: this.generateQuestionId('assessment'),
            type: 'fill_blank',
            content: question,
            topic: skillInfo.skill_name,
            subject: skillInfo.subject,
            difficulty: 'medium',
            points: 10,
            template,
            blanks,
            correctAnswers: blanks.map(b => b.correctAnswers[0]),
            acceptableAnswers: blanks.map(b => b.correctAnswers),
            explanation: assessment.explanation,
            metadata: {
                bloomsLevel: 'apply',
                estimatedTime: 60
            }
        };
        // Ensure difficulty and points are at top level
        result.difficulty = 'medium';
        result.points = 10;
        return result;
    }
    toNumericQuestion(assessment, skillInfo) {
        let correctAnswer;
        // Check multiple possible field names for the correct answer
        const answerField = assessment.correct_answer ??
            assessment.correctAnswer ??
            assessment.answer ??
            assessment.correct;
        if (typeof answerField === 'number') {
            correctAnswer = answerField;
        }
        else if (answerField !== undefined && answerField !== null) {
            // Parse string to number, handling various formats including negative numbers
            const answerStr = String(answerField).trim();
            // Better regex that preserves negative sign and decimal points
            const cleanedStr = answerStr.replace(/[^\d.-]/g, '');
            // Ensure we don't have multiple minus signs or decimal points
            const parsed = parseFloat(cleanedStr);
            if (isNaN(parsed)) {
                console.error('⚠️ Invalid numeric answer, defaulting to 0:', {
                    original: answerField,
                    cleaned: cleanedStr,
                    assessment,
                    skill: skillInfo.skill_name
                });
                correctAnswer = 0;
            }
            else {
                correctAnswer = parsed;
                console.log('✅ Parsed numeric answer:', {
                    original: answerField,
                    parsed: correctAnswer,
                    assessment,
                    skill: skillInfo.skill_name
                });
            }
        }
        else {
            console.error('⚠️ Missing correct_answer for numeric question, attempting to parse from question:', {
                assessment,
                skill: skillInfo.skill_name
            });
            // Try to extract answer from the question itself if it's like "largest integer"
            const questionText = String(assessment.content || assessment.question || '').toLowerCase();
            if (questionText.includes('largest') || questionText.includes('greatest') || questionText.includes('biggest')) {
                // Extract numbers from the question
                const numbers = (assessment.content || assessment.question || '').match(/-?\d+\.?\d*/g);
                if (numbers && numbers.length > 0) {
                    const parsedNumbers = numbers.map(n => parseFloat(n)).filter(n => !isNaN(n));
                    correctAnswer = Math.max(...parsedNumbers);
                    console.log('📊 Extracted largest number from question:', {
                        numbers: parsedNumbers,
                        largest: correctAnswer,
                        question: questionText
                    });
                }
                else {
                    correctAnswer = 0;
                }
            }
            else if (questionText.includes('smallest') || questionText.includes('least') || questionText.includes('minimum')) {
                // Extract numbers from the question
                const numbers = (assessment.content || assessment.question || '').match(/-?\d+\.?\d*/g);
                if (numbers && numbers.length > 0) {
                    const parsedNumbers = numbers.map(n => parseFloat(n)).filter(n => !isNaN(n));
                    correctAnswer = Math.min(...parsedNumbers);
                    console.log('📊 Extracted smallest number from question:', {
                        numbers: parsedNumbers,
                        smallest: correctAnswer,
                        question: questionText
                    });
                }
                else {
                    correctAnswer = 0;
                }
            }
            else {
                correctAnswer = 0;
            }
        }
        return {
            id: this.generateQuestionId('assessment'),
            type: 'numeric',
            content: String(assessment.content || assessment.question || ''),
            topic: skillInfo.skill_name,
            subject: skillInfo.subject,
            difficulty: 'medium',
            points: 10,
            correctAnswer,
            tolerance: 0.01,
            explanation: assessment.explanation,
            metadata: {
                bloomsLevel: 'apply',
                estimatedTime: 45
            }
        };
    }
    toShortAnswerQuestion(assessment, skillInfo) {
        const acceptableAnswers = Array.isArray(assessment.correct_answer) ?
            assessment.correct_answer.map(String) :
            [String(assessment.correct_answer)];
        return {
            id: this.generateQuestionId('assessment'),
            type: 'short_answer',
            content: String(assessment.content || assessment.question || ''),
            topic: skillInfo.skill_name,
            subject: skillInfo.subject,
            difficulty: 'medium',
            points: 10,
            acceptableAnswers,
            caseSensitive: false,
            maxLength: 100,
            explanation: assessment.explanation,
            metadata: {
                bloomsLevel: 'understand',
                estimatedTime: 60
            }
        };
    }
    toLongAnswerQuestion(assessment, skillInfo) {
        return {
            id: this.generateQuestionId('assessment'),
            type: 'long_answer',
            content: String(assessment.content || assessment.question || ''),
            topic: skillInfo.skill_name,
            subject: skillInfo.subject,
            difficulty: 'hard',
            points: 20,
            minWords: assessment.min_words || 50,
            maxWords: assessment.max_words || 200,
            rubric: assessment.rubric || {
                criteria: ['Content', 'Organization', 'Grammar'],
                maxPoints: 20
            },
            sampleAnswer: String(assessment.correct_answer || assessment.sample_answer || ''),
            explanation: assessment.explanation,
            metadata: {
                bloomsLevel: 'create',
                estimatedTime: 300
            }
        };
    }
    toMatchingQuestion(assessment, skillInfo) {
        // Support both formats: pairs array OR left_items/right_items
        const leftItems = assessment.left_items || assessment.leftItems || [];
        const rightItems = assessment.right_items || assessment.rightItems || [];
        const correctPairs = assessment.correct_pairs ||
            assessment.correctPairs || assessment.correct_answer || [];
        // If we have pairs array instead, convert it
        if (assessment.pairs && assessment.pairs.length > 0) {
            assessment.pairs.forEach((p, i) => {
                leftItems.push(p.left || p[0] || `Item ${i + 1}`);
                rightItems.push(p.right || p[1] || `Match ${i + 1}`);
            });
        }
        // Ensure we have valid data
        if (leftItems.length === 0 || rightItems.length === 0) {
            // Fallback data
            leftItems.push('Item 1', 'Item 2', 'Item 3');
            rightItems.push('Match A', 'Match B', 'Match C');
        }
        // Ensure correct pairs exist
        const finalPairs = correctPairs.length > 0 ? correctPairs :
            leftItems.map((_, i) => [i, i]);
        const leftColumn = leftItems.map((item, i) => ({
            id: `left-${i}`,
            text: String(item)
        }));
        const rightColumn = rightItems.map((item, i) => ({
            id: `right-${i}`,
            text: String(item)
        }));
        return {
            id: this.generateQuestionId('assessment'),
            type: 'matching',
            content: String(assessment.content || assessment.question || ''),
            topic: skillInfo.skill_name,
            subject: skillInfo.subject,
            difficulty: 'medium',
            points: 15,
            leftItems: leftColumn,
            rightItems: rightColumn,
            leftColumn: leftColumn, // Add for validator compatibility
            rightColumn: rightColumn, // Add for validator compatibility
            correctPairs: finalPairs,
            allowPartialCredit: true,
            explanation: assessment.explanation,
            metadata: {
                bloomsLevel: 'analyze',
                estimatedTime: 120
            }
        };
    }
    toOrderingQuestion(assessment, skillInfo) {
        const items = assessment.items || assessment.options || [];
        const correctOrder = assessment.correct_order || assessment.correct_answer || items.map((_, i) => i);
        // Determine order type from question text
        const questionText = (assessment.question || '').toLowerCase();
        let orderType = 'sequence'; // default
        if (questionText.includes('smallest to largest') || questionText.includes('ascending')) {
            orderType = 'ascending';
        }
        else if (questionText.includes('largest to smallest') || questionText.includes('descending')) {
            orderType = 'descending';
        }
        else if (questionText.includes('chronological') || questionText.includes('time')) {
            orderType = 'chronological';
        }
        return {
            id: this.generateQuestionId('assessment'),
            type: 'ordering',
            content: String(assessment.content || assessment.question || ''),
            topic: skillInfo.skill_name,
            subject: skillInfo.subject,
            difficulty: 'medium',
            points: 15,
            orderType: orderType,
            items: items.map((item, i) => ({
                id: `item-${i}`,
                text: String(item),
                correctPosition: correctOrder[i] || i
            })),
            correctOrder: correctOrder, // Add for compatibility
            allowPartialCredit: true,
            explanation: assessment.explanation,
            metadata: {
                bloomsLevel: 'understand',
                estimatedTime: 90
            }
        };
    }
    toClassificationQuestion(assessment, skillInfo) {
        const categories = assessment.categories || ['Category A', 'Category B'];
        const items = assessment.items || [];
        const correctClassification = assessment.correct_answer || {};
        return {
            id: this.generateQuestionId('assessment'),
            type: 'classification',
            content: String(assessment.content || assessment.question || ''),
            topic: skillInfo.skill_name,
            subject: skillInfo.subject,
            difficulty: 'medium',
            points: 15,
            categories: categories.map((cat) => ({
                id: cat.toLowerCase().replace(/\s+/g, '-'),
                name: cat
            })),
            items: items.map((item) => ({
                id: String(item.id || item),
                text: String(item.text || item),
                correctCategory: correctClassification[item] || categories[0]
            })),
            allowPartialCredit: true,
            explanation: assessment.explanation,
            metadata: {
                bloomsLevel: 'analyze',
                estimatedTime: 120
            }
        };
    }
    toVisualIdentificationQuestion(assessment, skillInfo) {
        const visual = assessment.visual || '🔲';
        const options = assessment.options || ['shape', 'color', 'pattern'];
        const correctAnswer = assessment.correct_answer;
        return {
            id: this.generateQuestionId('assessment'),
            type: 'visual_identification',
            content: String(assessment.content || assessment.question || ''),
            topic: skillInfo.skill_name,
            subject: skillInfo.subject,
            difficulty: 'easy',
            points: 10,
            visualContent: {
                type: 'emoji',
                content: String(visual)
            },
            options: options.map((opt, i) => ({
                id: `opt-${i}`,
                text: String(opt),
                isCorrect: i === correctAnswer || opt === correctAnswer
            })),
            targetFeature: assessment.target_feature || 'shape',
            explanation: assessment.explanation,
            metadata: {
                bloomsLevel: 'remember',
                estimatedTime: 30
            }
        };
    }
    toPatternRecognitionQuestion(assessment, skillInfo) {
        const pattern = assessment.pattern || [];
        const nextItem = assessment.correct_answer || assessment.next_item || '?';
        return {
            id: this.generateQuestionId('assessment'),
            type: 'pattern_recognition',
            content: String(assessment.content || assessment.question || ''),
            topic: skillInfo.skill_name,
            subject: skillInfo.subject,
            difficulty: 'medium',
            points: 15,
            pattern: pattern.map((item) => String(item)),
            nextItem: String(nextItem),
            patternType: assessment.pattern_type || 'sequence',
            options: assessment.options?.map((opt) => ({
                id: String(opt),
                value: String(opt)
            })),
            explanation: assessment.explanation,
            metadata: {
                bloomsLevel: 'analyze',
                estimatedTime: 90
            }
        };
    }
    toCodeCompletionQuestion(assessment, skillInfo) {
        const codeSnippet = assessment.code || assessment.snippet || '';
        const blanks = assessment.blanks || [{ position: 0, correctValue: 'answer' }];
        return {
            id: this.generateQuestionId('assessment'),
            type: 'code_completion',
            content: String(assessment.content || assessment.question || ''),
            topic: skillInfo.skill_name,
            subject: skillInfo.subject,
            difficulty: 'hard',
            points: 20,
            codeSnippet: String(codeSnippet),
            language: assessment.language || 'python',
            blanks: blanks.map((blank, i) => ({
                id: `blank-${i}`,
                position: blank.position || i,
                correctValue: String(blank.correctValue || blank.correct_answer || ''),
                hint: blank.hint
            })),
            syntaxHighlighting: true,
            explanation: assessment.explanation,
            metadata: {
                bloomsLevel: 'apply',
                estimatedTime: 180
            }
        };
    }
    toDiagramLabelingQuestion(assessment, skillInfo) {
        const labels = assessment.labels || [];
        const correctLabels = assessment.correct_answer || labels;
        return {
            id: this.generateQuestionId('assessment'),
            type: 'diagram_labeling',
            content: String(assessment.content || assessment.question || ''),
            topic: skillInfo.skill_name,
            subject: skillInfo.subject,
            difficulty: 'medium',
            points: 15,
            diagramUrl: assessment.diagram || assessment.visual || '📊',
            labels: labels.map((label, i) => ({
                id: `label-${i}`,
                position: label.position || { x: 50, y: 50 },
                correctText: String(correctLabels[i] || label.correct || label)
            })),
            allowPartialCredit: true,
            explanation: assessment.explanation,
            metadata: {
                bloomsLevel: 'understand',
                estimatedTime: 120
            }
        };
    }
    toOpenEndedQuestion(assessment, skillInfo) {
        return {
            id: this.generateQuestionId('assessment'),
            type: 'open_ended',
            content: String(assessment.content || assessment.question || ''),
            topic: skillInfo.skill_name,
            subject: skillInfo.subject,
            difficulty: 'hard',
            points: 25,
            promptType: assessment.prompt_type || 'creative',
            suggestedLength: assessment.suggested_length || 'paragraph',
            sampleResponses: assessment.sample_responses || [String(assessment.correct_answer || '')],
            evaluationCriteria: assessment.criteria || ['Creativity', 'Relevance', 'Clarity'],
            explanation: assessment.explanation,
            metadata: {
                bloomsLevel: 'create',
                estimatedTime: 300
            }
        };
    }
}
exports.AIContentConverter = AIContentConverter;
// Export singleton instance
exports.aiContentConverter = AIContentConverter.getInstance();
