declare module 'pdf-creator-node' {
  interface PDFOptions {
    format?: string
    orientation?: 'portrait' | 'landscape'
    border?: string
    header?: {
      height?: string
      contents?: string
    }
    footer?: {
      height?: string
      contents?: string
    }
  }

  interface PDFDocument {
    html: string
    data: Record<string, any>
    path: string
    type: 'buffer' | 'stream'
  }

  function create(document: PDFDocument, options: PDFOptions): Promise<Buffer>

  export = {
    create
  }
} 