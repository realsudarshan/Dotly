import {TagIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => [Rule.required().error('Category title is required')],
    }),
    defineField({
      name: 'color',
      type: 'string',
      description: 'Hex color for UI theming (optional)',
      validation: (Rule) => [
        Rule.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).warning(
          'Please use a valid hex color format like #FF6B6B',
        ),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      color: 'color',
    },
    prepare({title, color}: {title: string; color?: string}) {
      return {
        title: title,
        subtitle: color || 'No color',
      }
    },
  },
  orderings: [
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
  ],
})