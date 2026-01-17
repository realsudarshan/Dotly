import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const journalEntry = defineType({
  name: 'journalEntry',
  title: 'Journal Entry',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      description: 'Optional title for your journal entry',
      validation: (Rule) => [
        Rule.max(100).warning(
          'Consider keeping titles under 100 characters for better readability',
        ),
      ],
    }),
    defineField({
      name: 'content',
      type: 'array',
      of: [
        {type: 'block'},
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              description: 'Important for accessibility and SEO',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
              description: 'Optional caption for the image',
            },
          ],
        },
      ],
      description: 'Your journal entry content with text and images',
      validation: (Rule) => [
        Rule.required().error('Journal content is required'),
        Rule.min(1).error('Please write something in your journal entry'),
      ],
    }),
    defineField({
      name: 'mood',
      type: 'string',
      description: 'How are you feeling?',
      options: {
        list: [
          {title: '😢 Very Sad', value: 'very-sad'},
          {title: '😞 Sad', value: 'sad'},
          {title: '😐 Neutral', value: 'neutral'},
          {title: '😊 Happy', value: 'happy'},
          {title: '😄 Very Happy', value: 'very-happy'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => [Rule.required().error('Please select your mood for this entry')],
    }),
    defineField({
      name: 'userId',
      type: 'string',
      title: 'User ID',
      description: 'Clerk user ID of the journal owner',
      validation: (Rule) => [Rule.required().error('User ID is required for authentication')],
    }),
    defineField({
      name: 'aiGeneratedCategory',
      type: 'reference',
      to: [{type: 'category'}],
      description: 'Category automatically assigned by AI',
      readOnly: true,
    }),
    defineField({
      name: 'createdAt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => [Rule.required().error('Creation date is required')],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      content: 'content',
      mood: 'mood',
      createdAt: 'createdAt',
    },
    prepare({
      title,
      content,
      mood,
      createdAt,
    }: {
      title?: string
      content?: Array<{
        _type: string
        children?: Array<{
          text?: string
        }>
      }>
      mood: string
      createdAt: string
    }) {
      const moodEmoji: Record<string, string> = {
        'very-sad': '😢',
        sad: '😞',
        neutral: '😐',
        happy: '😊',
        'very-happy': '😄',
      }
      const selectedEmoji = moodEmoji[mood] || '😐'

      const date = new Date(createdAt).toLocaleDateString()
      const preview = content?.[0]?.children?.[0]?.text?.slice(0, 50) || 'No content'

      return {
        title: title || `${selectedEmoji} ${date}`,
        subtitle: `${preview}${preview.length >= 50 ? '...' : ''}`,
      }
    },
  },
  orderings: [
    {
      title: 'Created Date, New',
      name: 'createdAtDesc',
      by: [{field: 'createdAt', direction: 'desc'}],
    },
    {
      title: 'Created Date, Old',
      name: 'createdAtAsc',
      by: [{field: 'createdAt', direction: 'asc'}],
    },
    {
      title: 'Mood',
      name: 'moodDesc',
      by: [{field: 'mood', direction: 'desc'}],
    },
  ],
})