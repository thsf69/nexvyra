import { useTheme } from '../../context/ThemeContext';
import { ThemeTokens } from '../../theme/tokens';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Project } from '../../types';
import { ProjectStatusBadge } from './ProjectStatusBadge';

interface Props {
  project: Project;
  onPress: () => void;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const ProjectCard = ({ project, onPress }: Props) => {
  const { tokens, isDark } = useTheme();
  const styles = useMemo(() => createStyles(tokens, isDark), [tokens, isDark]);
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View project: ${project.name}`}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {project.name}
        </Text>
        <ProjectStatusBadge status={project.status} />
      </View>
      
      {project.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {project.description}
        </Text>
      ) : (
        <Text style={[styles.description, styles.emptyDescription]}>
          No description
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Start</Text>
          <Text style={styles.dateValue}>{formatDate(project.startDate)}</Text>
        </View>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>End</Text>
          <Text style={styles.dateValue}>{formatDate(project.endDate)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (tokens: ThemeTokens, isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: tokens.surface,
    borderRadius: 18,
    padding: 19,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: tokens.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: tokens.text,
    marginRight: 12,
  },
  description: {
    fontSize: 14,
    color: tokens.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyDescription: {
    fontStyle: 'italic',
    color: '#8593AF',
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: tokens.border,
    paddingTop: 12,
  },
  dateBlock: {
    marginRight: 24,
  },
  dateLabel: {
    fontSize: 12,
    color: '#9BAAC5',
    fontWeight: '500',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 13,
    color: '#263E59',
    fontWeight: '500',
  },
});
