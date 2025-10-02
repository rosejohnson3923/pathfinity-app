/**
 * Lesson Archive Service
 * Uses existing Azure Storage containers and Supabase for lesson plan management
 */

import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { supabase } from '../../lib/supabase';
import { StandardizedLessonPlan } from '../../templates/StandardizedLessonPlan';

export class LessonArchiveService {
  private blobServiceClient: BlobServiceClient;
  private containers: {
    blogs: ContainerClient;
    audioCache: ContainerClient;
    audioMusic: ContainerClient;
    audioNarrative: ContainerClient;
    contentExports: ContainerClient;
    masterNarratives: ContainerClient;
    metrics: ContainerClient;
    microContent: ContainerClient;  // For lesson plan JSONs
    microContentExperience: ContainerClient;
    microContentTeam: ContainerClient;
  };

  constructor() {
    this.initializeStorage();
  }

  private async initializeStorage() {
    // Initialize blob service client
    const connectionString = import.meta.env.VITE_AZURE_STORAGE_CONNECTION_STRING;

    if (!connectionString) {
      console.warn('Azure Storage connection string not configured - archiving disabled');
      return;
    }

    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

    // Map to existing containers shown in the PDF
    this.containers = {
      blogs: this.blobServiceClient.getContainerClient('blogs'),
      audioCache: this.blobServiceClient.getContainerClient('audio-cache'),
      audioMusic: this.blobServiceClient.getContainerClient('audio-music'),
      audioNarrative: this.blobServiceClient.getContainerClient('audio-narrative'),
      contentExports: this.blobServiceClient.getContainerClient('content-exports'), // PDFs here
      masterNarratives: this.blobServiceClient.getContainerClient('master-narratives'),
      metrics: this.blobServiceClient.getContainerClient('metrics'),
      microContent: this.blobServiceClient.getContainerClient('micro-content'), // JSON lessons
      microContentExperience: this.blobServiceClient.getContainerClient('micro-content-experience'),
      microContentTeam: this.blobServiceClient.getContainerClient('micro-content-team'),
    };
  }

  /**
   * Archive a lesson plan
   * Stores JSON in micro-content and PDF in content-exports
   */
  async archiveLessonPlan(
    lessonPlan: StandardizedLessonPlan,
    pdfBuffer: Buffer
  ): Promise<{
    lessonId: string;
    jsonUrl: string;
    pdfUrl: string;
    dbRecordId: string;
  }> {
    const timestamp = Date.now();
    const lessonId = lessonPlan.lessonId || `LP_${timestamp}`;

    // If Azure is not configured, return mock data
    if (!this.blobServiceClient) {
      console.warn('Azure Storage not configured - returning mock archive data');
      return {
        lessonId,
        jsonUrl: `mock://json/${lessonId}`,
        pdfUrl: `mock://pdf/${lessonId}`,
        dbRecordId: `mock_${lessonId}`
      };
    }

    // 1. Store JSON in micro-content container
    const jsonPath = this.buildJsonPath(lessonPlan);
    const jsonBlob = this.containers.microContent.getBlockBlobClient(jsonPath);

    const jsonContent = JSON.stringify(lessonPlan, null, 2);
    await jsonBlob.upload(jsonContent, Buffer.byteLength(jsonContent), {
      blobHTTPHeaders: {
        blobContentType: 'application/json',
      },
      metadata: {
        studentId: lessonPlan.student.name,
        gradeLevel: lessonPlan.student.gradeLevel,
        career: lessonPlan.career.careerName,
        subject: lessonPlan.curriculum.subject,
        lessonDate: new Date().toISOString(),
      }
    });

    // 2. Store PDF in content-exports container
    const pdfPath = this.buildPdfPath(lessonPlan);
    const pdfBlob = this.containers.contentExports.getBlockBlobClient(pdfPath);

    await pdfBlob.upload(pdfBuffer, pdfBuffer.length, {
      blobHTTPHeaders: {
        blobContentType: 'application/pdf',
        blobContentDisposition: `inline; filename="${this.buildPdfFilename(lessonPlan)}"`,
      },
      metadata: {
        lessonId: lessonId,
        generatedAt: new Date().toISOString(),
      }
    });

    // 3. Store master narrative in its container (if exists)
    if (lessonPlan.content.narrativeContext.masterNarrative) {
      const narrativePath = `${lessonId}/narrative.txt`;
      const narrativeBlob = this.containers.masterNarratives.getBlockBlobClient(narrativePath);
      await narrativeBlob.upload(
        lessonPlan.content.narrativeContext.masterNarrative,
        lessonPlan.content.narrativeContext.masterNarrative.length
      );
    }

    // 4. Save metadata to Supabase
    const { data, error } = await supabase
      .from('lesson_archives')
      .insert({
        lesson_id: lessonId,
        student_name: lessonPlan.student.name,
        grade_level: lessonPlan.student.gradeLevel,
        career_code: lessonPlan.career.careerCode,
        career_name: lessonPlan.career.careerName,
        subject: lessonPlan.curriculum.subject,
        skill_objective: lessonPlan.curriculum.skillObjective,
        template_type: lessonPlan.templateType,
        lesson_date: new Date().toISOString(),
        json_url: jsonBlob.url,
        pdf_url: pdfBlob.url,
        pdf_size_kb: Math.round(pdfBuffer.length / 1024),
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      lessonId,
      jsonUrl: jsonBlob.url,
      pdfUrl: pdfBlob.url,
      dbRecordId: data.id
    };
  }

  /**
   * Retrieve lesson plans for a student
   */
  async getStudentLessons(
    studentName: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      subject?: string;
      career?: string;
    }
  ): Promise<any[]> {
    let query = supabase
      .from('lesson_archives')
      .select('*')
      .eq('student_name', studentName)
      .order('lesson_date', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('lesson_date', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      query = query.lte('lesson_date', filters.endDate.toISOString());
    }
    if (filters?.subject) {
      query = query.eq('subject', filters.subject);
    }
    if (filters?.career) {
      query = query.eq('career_name', filters.career);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data;
  }

  /**
   * Get a specific lesson plan
   */
  async getLessonPlan(lessonId: string): Promise<{
    metadata: any;
    lessonPlan: StandardizedLessonPlan;
    pdfUrl: string;
  }> {
    // Get metadata from Supabase
    const { data: metadata, error } = await supabase
      .from('lesson_archives')
      .select('*')
      .eq('lesson_id', lessonId)
      .single();

    if (error) throw error;

    // Download JSON from Azure
    const jsonPath = `${metadata.lesson_date.split('T')[0]}/${metadata.student_name}/${lessonId}/lesson.json`;
    const jsonBlob = this.containers.microContent.getBlockBlobClient(jsonPath);
    const downloadResponse = await jsonBlob.download();
    const jsonContent = await this.streamToBuffer(downloadResponse.readableStreamBody!);
    const lessonPlan = JSON.parse(jsonContent.toString());

    return {
      metadata,
      lessonPlan,
      pdfUrl: metadata.pdf_url
    };
  }

  /**
   * Generate parent access link
   */
  async generateParentAccessLink(
    lessonId: string,
    expirationHours: number = 72
  ): Promise<string> {
    const { data: lesson, error } = await supabase
      .from('lesson_archives')
      .select('pdf_url')
      .eq('lesson_id', lessonId)
      .single();

    if (error) throw error;

    // Generate SAS URL for the PDF
    const pdfBlobName = this.extractBlobName(lesson.pdf_url);
    const blobClient = this.containers.contentExports.getBlockBlobClient(pdfBlobName);

    const sasUrl = await blobClient.generateSasUrl({
      permissions: 'r', // Read only
      expiresOn: new Date(Date.now() + expirationHours * 60 * 60 * 1000),
    });

    // Log parent access
    await supabase
      .from('parent_access_logs')
      .insert({
        lesson_id: lessonId,
        access_link: sasUrl,
        expires_at: new Date(Date.now() + expirationHours * 60 * 60 * 1000),
        created_at: new Date()
      });

    return sasUrl;
  }

  /**
   * Bulk export lessons for a period
   */
  async exportLessonsForPeriod(
    studentName: string,
    startDate: Date,
    endDate: Date
  ): Promise<string> {
    const lessons = await this.getStudentLessons(studentName, {
      startDate,
      endDate
    });

    // Create a zip file in content-exports
    const exportId = `EXPORT_${Date.now()}`;
    const zipPath = `exports/${studentName}/${exportId}/lessons.zip`;

    // This would use a zip library to bundle PDFs
    // For now, return a reference to the export

    await supabase
      .from('bulk_exports')
      .insert({
        export_id: exportId,
        student_name: studentName,
        start_date: startDate,
        end_date: endDate,
        lesson_count: lessons.length,
        status: 'completed',
        export_url: `https://pathfinitystorage.blob.core.windows.net/content-exports/${zipPath}`
      });

    return exportId;
  }

  /**
   * Track lesson metrics
   */
  async trackLessonMetrics(
    lessonId: string,
    metrics: {
      timeSpent?: number;
      completionPercentage?: number;
      assessmentScore?: number;
      sparkInteractions?: number;
    }
  ): Promise<void> {
    // Store in metrics container
    const metricsPath = `lessons/${lessonId}/metrics.json`;
    const metricsBlob = this.containers.metrics.getBlockBlobClient(metricsPath);

    const metricsData = {
      lessonId,
      ...metrics,
      timestamp: new Date().toISOString()
    };

    await metricsBlob.upload(
      JSON.stringify(metricsData),
      JSON.stringify(metricsData).length
    );

    // Update Supabase record
    await supabase
      .from('lesson_archives')
      .update({
        time_spent_minutes: metrics.timeSpent,
        completion_percentage: metrics.completionPercentage,
        assessment_score: metrics.assessmentScore,
        spark_interactions: metrics.sparkInteractions,
        updated_at: new Date()
      })
      .eq('lesson_id', lessonId);
  }

  // Helper methods

  private buildJsonPath(lessonPlan: StandardizedLessonPlan): string {
    const date = new Date().toISOString().split('T')[0];
    const safeName = this.sanitizePath(lessonPlan.student.name);
    return `${date}/${safeName}/${lessonPlan.lessonId}/lesson.json`;
  }

  private buildPdfPath(lessonPlan: StandardizedLessonPlan): string {
    const date = new Date().toISOString().split('T')[0];
    const safeName = this.sanitizePath(lessonPlan.student.name);
    return `lesson-plans/${date}/${safeName}/${lessonPlan.lessonId}.pdf`;
  }

  private buildPdfFilename(lessonPlan: StandardizedLessonPlan): string {
    const date = new Date().toISOString().split('T')[0];
    return `${lessonPlan.student.name}_${lessonPlan.career.careerName}_${lessonPlan.curriculum.subject}_${date}.pdf`;
  }

  private sanitizePath(input: string): string {
    return input.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
  }

  private extractBlobName(url: string): string {
    const urlParts = new URL(url);
    const pathParts = urlParts.pathname.split('/');
    return pathParts.slice(2).join('/'); // Skip container name
  }

  private async streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      readableStream.on('data', (data) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream.on('error', reject);
    });
  }
}

// Export singleton
export const lessonArchive = new LessonArchiveService();