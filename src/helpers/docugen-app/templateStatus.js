export const TEMPLATE_STATUS_OPTIONS = [
  { title: 'Borrador', value: 'draft' },
  { title: 'Publicado', value: 'published' },
  { title: 'Archivado', value: 'archived' },
];

export const getTemplateStatusLabel = (status) =>
  TEMPLATE_STATUS_OPTIONS.find((option) => option.value === status)?.title ||
  status ||
  'Sin estado';

export const getTemplateStatusColor = (status) => {
  const colors = {
    draft: 'warning',
    published: 'success',
    archived: 'secondary',
  };

  return colors[status] || 'secondary';
};
