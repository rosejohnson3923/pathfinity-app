import { supabase, getCurrentUserId, getCurrentTenantId, handleSupabaseError } from '../lib/supabase';
import { SearchResultItem } from '../types';

export class SearchService {
  static async searchAll(searchTerm: string, tenantId: string): Promise<SearchResultItem[]> {
    try {
      // Validate input parameters
      if (!searchTerm || !tenantId) {
        throw new Error('Missing required parameters: searchTerm or tenantId');
      }

      const searchTermLower = searchTerm.toLowerCase();
      const results: SearchResultItem[] = [];

      // Search lessons (skills_topics)
      const { data: lessonResults, error: lessonError } = await supabase
        .from('skills_topics')
        .select(`
          id,
          name,
          description,
          difficulty_level,
          estimated_duration_minutes,
          mastery_groups (
            id,
            name,
            subjects (
              id,
              name
            )
          )
        `)
        .eq('tenant_id', tenantId)
        .or(`name.ilike.%${searchTermLower}%,description.ilike.%${searchTermLower}%`)
        .limit(5);

      if (lessonError) throw lessonError;

      if (lessonResults) {
        lessonResults.forEach(lesson => {
          results.push({
            id: lesson.id,
            title: lesson.name,
            description: lesson.description || 'No description available',
            type: 'lesson',
            link: `/learn/lesson/${lesson.id}`,
            metadata: {
              subject: lesson.mastery_groups?.subjects?.name || 'General',
              difficulty: lesson.difficulty_level,
              duration: lesson.estimated_duration_minutes,
              category: 'skill'
            }
          });
        });
      }

      // Search projects
      const { data: projectResults, error: projectError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          project_type,
          difficulty_level,
          estimated_duration_days,
          creator_id,
          user_profiles:creator_id (
            full_name
          )
        `)
        .eq('tenant_id', tenantId)
        .or(`title.ilike.%${searchTermLower}%,description.ilike.%${searchTermLower}%`)
        .limit(5);

      if (projectError) throw projectError;

      if (projectResults) {
        projectResults.forEach(project => {
          results.push({
            id: project.id,
            title: project.title,
            description: project.description || 'No description available',
            type: 'project',
            link: `/projects/${project.id}`,
            metadata: {
              difficulty: project.difficulty_level,
              duration: project.estimated_duration_days * 24 * 60, // Convert days to minutes
              category: project.project_type,
              author: project.user_profiles?.full_name || 'Unknown'
            }
          });
        });
      }

      // Search content library
      const { data: contentResults, error: contentError } = await supabase
        .from('content_library')
        .select(`
          id,
          title,
          description,
          content_type,
          difficulty_level,
          duration_minutes,
          creator_id,
          user_profiles:creator_id (
            full_name
          )
        `)
        .eq('tenant_id', tenantId)
        .eq('is_published', true)
        .or(`title.ilike.%${searchTermLower}%,description.ilike.%${searchTermLower}%`)
        .limit(5);

      if (contentError) throw contentError;

      if (contentResults) {
        contentResults.forEach(content => {
          results.push({
            id: content.id,
            title: content.title,
            description: content.description || 'No description available',
            type: 'content',
            link: `/content/${content.id}`,
            metadata: {
              difficulty: content.difficulty_level,
              duration: content.duration_minutes,
              category: content.content_type,
              author: content.user_profiles?.full_name || 'Unknown'
            }
          });
        });
      }

      // Search users
      const { data: userResults, error: userError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          full_name,
          email,
          role,
          grade_level,
          subjects
        `)
        .eq('tenant_id', tenantId)
        .or(`full_name.ilike.%${searchTermLower}%,email.ilike.%${searchTermLower}%`)
        .limit(5);

      if (userError) throw userError;

      if (userResults) {
        userResults.forEach(user => {
          results.push({
            id: user.id,
            title: user.full_name,
            description: `${user.role} ${user.grade_level ? `- ${user.grade_level}` : ''}`,
            type: 'user',
            link: `/users/${user.id}`,
            metadata: {
              category: user.role,
              subject: Array.isArray(user.subjects) && user.subjects.length > 0 ? user.subjects[0] : undefined
            }
          });
        });
      }

      return results;
    } catch (error) {
      console.error('Error in searchAll:', error);
      return [];
    }
  }

  static async searchLessons(searchTerm: string, tenantId: string): Promise<SearchResultItem[]> {
    try {
      // Validate input parameters
      if (!searchTerm || !tenantId) {
        throw new Error('Missing required parameters: searchTerm or tenantId');
      }

      const searchTermLower = searchTerm.toLowerCase();
      const results: SearchResultItem[] = [];

      const { data, error } = await supabase
        .from('skills_topics')
        .select(`
          id,
          name,
          description,
          difficulty_level,
          estimated_duration_minutes,
          mastery_groups (
            id,
            name,
            subjects (
              id,
              name
            )
          )
        `)
        .eq('tenant_id', tenantId)
        .or(`name.ilike.%${searchTermLower}%,description.ilike.%${searchTermLower}%`);

      if (error) throw error;

      if (data) {
        data.forEach(lesson => {
          results.push({
            id: lesson.id,
            title: lesson.name,
            description: lesson.description || 'No description available',
            type: 'lesson',
            link: `/learn/lesson/${lesson.id}`,
            metadata: {
              subject: lesson.mastery_groups?.subjects?.name || 'General',
              difficulty: lesson.difficulty_level,
              duration: lesson.estimated_duration_minutes,
              category: 'skill'
            }
          });
        });
      }

      return results;
    } catch (error) {
      console.error('Error in searchLessons:', error);
      return [];
    }
  }

  static async searchContent(searchTerm: string, tenantId: string): Promise<SearchResultItem[]> {
    try {
      // Validate input parameters
      if (!searchTerm || !tenantId) {
        throw new Error('Missing required parameters: searchTerm or tenantId');
      }

      const searchTermLower = searchTerm.toLowerCase();
      const results: SearchResultItem[] = [];

      const { data, error } = await supabase
        .from('content_library')
        .select(`
          id,
          title,
          description,
          content_type,
          difficulty_level,
          duration_minutes,
          creator_id,
          user_profiles:creator_id (
            full_name
          )
        `)
        .eq('tenant_id', tenantId)
        .eq('is_published', true)
        .or(`title.ilike.%${searchTermLower}%,description.ilike.%${searchTermLower}%`);

      if (error) throw error;

      if (data) {
        data.forEach(content => {
          results.push({
            id: content.id,
            title: content.title,
            description: content.description || 'No description available',
            type: 'content',
            link: `/content/${content.id}`,
            metadata: {
              difficulty: content.difficulty_level,
              duration: content.duration_minutes,
              category: content.content_type,
              author: content.user_profiles?.full_name || 'Unknown'
            }
          });
        });
      }

      return results;
    } catch (error) {
      console.error('Error in searchContent:', error);
      return [];
    }
  }
}