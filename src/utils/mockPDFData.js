// Mock data para versiones de documento (solo para frontend testing)
const mockPDFVersions = {
  'orden-1': [
    {
      id: 'orden-1-v1702500000000',
      name: 'PDF - 24 dic 2024, 10:30',
      description: 'Versión final aprobada',
      author: 'Juan Pérez',
      createdAt: '2024-12-24T10:30:00Z',
      filename: 'orden-1.pdf',
      fileSize: 125000,
      downloadUrl: '/api/pdf-versions/orden-1/orden-1-v1702500000000/download',
      previewUrl: '/api/pdf-versions/orden-1/orden-1-v1702500000000/preview',
      isLatest: true
    },
    {
      id: 'orden-1-v1702400000000',
      name: 'PDF - 23 dic 2024, 15:45',
      description: 'Revisión de cambios',
      author: 'María García',
      createdAt: '2024-12-23T15:45:00Z',
      filename: 'orden-1.pdf',
      fileSize: 118000,
      downloadUrl: '/api/pdf-versions/orden-1/orden-1-v1702400000000/download',
      previewUrl: '/api/pdf-versions/orden-1/orden-1-v1702400000000/preview',
      isLatest: false
    }
  ],
  'orden-2': [
    {
      id: 'orden-2-v1702200000000',
      name: 'PDF - 21 dic 2024',
      description: 'Única versión',
      author: 'Sistema',
      createdAt: '2024-12-21T14:20:00Z',
      filename: 'orden-2.pdf',
      fileSize: 95000,
      downloadUrl: '/api/pdf-versions/orden-2/orden-2-v1702200000000/download',
      previewUrl: '/api/pdf-versions/orden-2/orden-2-v1702200000000/preview',
      isLatest: true
    }
  ]
}

function mockFetchVersions(documentId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const versions = mockPDFVersions[String(documentId)] || []
      resolve({ documentId: String(documentId), versions, count: versions.length })
    }, 200)
  })
}

export { mockFetchVersions }
