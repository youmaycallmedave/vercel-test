export default {
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 3
    },
    {
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower number = appears first'
    },
    {
      name: 'links',
      title: 'Links',
      type: 'object',
      fields: [
        { name: 'twitter', title: 'Twitter URL', type: 'url' },
        { name: 'linkedin', title: 'LinkedIn URL', type: 'url' },
        { name: 'github', title: 'GitHub URL', type: 'url' }
      ]
    }
  ],
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }]
    }
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'photo' }
  }
}
