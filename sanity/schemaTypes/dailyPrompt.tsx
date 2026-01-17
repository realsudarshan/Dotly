import {BulbOutlineIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const dailyPrompt = defineType({
  name: 'dailyPrompt',
  title: 'Daily Prompt',
  type: 'document',
  icon: BulbOutlineIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Prompt Title',
      type: 'string',
      description: 'A short, catchy title for the prompt',
      validation: (Rule) => [
        Rule.required().error('Prompt title is required'),
        Rule.max(60).warning('Keep titles under 60 characters for better display'),
      ],
    }),
    defineField({
      name: 'prompt',
      title: 'Prompt Text',
      type: 'text',
      rows: 3,
      description: 'The actual prompt text that will inspire journal entries',
      validation: (Rule) => [
        Rule.required().error('Prompt text is required'),
        Rule.min(10).error('Prompt should be at least 10 characters'),
        Rule.max(200).warning('Consider keeping prompts under 200 characters for clarity'),
      ],
    }),
    defineField({
      name: 'emoji',
      title: 'Emoji Icon',
      type: 'string',
      description: 'An emoji to display with the prompt (e.g., 💭, 🌟, ✨, 💡)',
      validation: (Rule) => [Rule.max(2).warning('Please use a single emoji')],
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
      description: 'Optional: Associate this prompt with a category',
    }),
    defineField({
      name: 'suggestedMood',
      title: 'Suggested Mood',
      type: 'string',
      description: 'Optional: Suggest a mood for entries created with this prompt',
      options: {
        list: [
          {title: '😢 Very Sad', value: 'very-sad'},
          {title: '😞 Sad', value: 'sad'},
          {title: '😐 Neutral', value: 'neutral'},
          {title: '😊 Happy', value: 'happy'},
          {title: '😄 Very Happy', value: 'very-happy'},
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Only active prompts will be shown to users',
      initialValue: true,
      validation: (Rule) => [Rule.required()],
    }),
    defineField({
      name: 'weight',
      title: 'Weight',
      type: 'number',
      description: 'Higher weights increase the chance of this prompt being selected (1-10)',
      initialValue: 5,
      validation: (Rule) => [
        Rule.required().error('Weight is required'),
        Rule.min(1).error('Weight must be at least 1'),
        Rule.max(10).error('Weight cannot exceed 10'),
        Rule.integer().error('Weight must be a whole number'),
      ],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      description:
        'Optional tags for filtering prompts (e.g., "morning", "reflection", "gratitude")',
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => [Rule.required()],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      prompt: 'prompt',
      emoji: 'emoji',
      isActive: 'isActive',
      weight: 'weight',
    },
    prepare({
      title,
      prompt,
      emoji,
      isActive,
      weight,
    }: {
      title: string
      prompt: string
      emoji?: string
      isActive: boolean
      weight: number
    }) {
      const statusIndicator = isActive ? '✓' : '✗'
      const displayEmoji = emoji || '💭'

      return {
        title: `${displayEmoji} ${title}`,
        subtitle: `${statusIndicator} Weight: ${weight} | ${prompt.slice(0, 60)}${prompt.length > 60 ? '...' : ''}`,
        media: BulbOutlineIcon,
      }
    },
  },
  orderings: [
    {
      title: 'Weight (High to Low)',
      name: 'weightDesc',
      by: [{field: 'weight', direction: 'desc'}],
    },
    {
      title: 'Created Date, New',
      name: 'createdAtDesc',
      by: [{field: 'createdAt', direction: 'desc'}],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
    {
      title: 'Active First',
      name: 'activeFirst',
      by: [
        {field: 'isActive', direction: 'desc'},
        {field: 'weight', direction: 'desc'},
      ],
    },
  ],
})