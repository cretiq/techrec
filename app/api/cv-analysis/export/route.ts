import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PDFDocument } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun } from 'docx';
// Import necessary libraries for document generation later
// e.g., import { PDFDocument } from 'pdf-lib';
// e.g., import { Document, Packer, Paragraph, TextRun } from 'docx';
// Import Zod schema
import { CvExportRequestSchema } from '@/types/cv'; 
import { CvAnalysisData, Skill, ExperienceItem, EducationItem } from '@/types/cv';

// --- Helper function to format analysis data to TXT ---
const formatDataToTxt = (data: CvAnalysisData): string => {
    let txt = "";

    // Contact Info (check if contactInfo exists)
    txt += `${data.contactInfo?.name || 'Name Not Found'}\n`;
    txt += `====================\n`;
    if (data.contactInfo?.email) txt += `Email: ${data.contactInfo.email}\n`;
    if (data.contactInfo?.phone) txt += `Phone: ${data.contactInfo.phone}\n`;
    if (data.contactInfo?.location) txt += `Location: ${data.contactInfo.location}\n`;
    if (data.contactInfo?.linkedin) txt += `LinkedIn: ${data.contactInfo.linkedin}\n`;
    if (data.contactInfo?.github) txt += `GitHub: ${data.contactInfo.github}\n`;
    if (data.contactInfo?.website) txt += `Website: ${data.contactInfo.website}\n`;
    txt += `\n`;

    // About
    if (data.about) {
        txt += `ABOUT / SUMMARY\n`;
        txt += `--------------------\n`;
        txt += `${data.about}\n\n`;
    }

    // Skills
    if (data.skills && data.skills.length > 0) {
        txt += `SKILLS\n`;
        txt += `--------------------\n`;
        txt += data.skills.map((s: Skill) => s.name).join(', ') + '\n\n';
    }

    // Experience
    if (data.experience && data.experience.length > 0) {
        txt += `WORK EXPERIENCE\n`;
        txt += `--------------------\n`;
        data.experience.forEach((exp: ExperienceItem) => {
            txt += `${exp.title} at ${exp.company}\n`;
            if (exp.location) txt += `Location: ${exp.location}\n`;
            if (exp.startDate) txt += `Dates: ${exp.startDate} - ${exp.endDate || 'Present'}\n`;
            if (exp.responsibilities && exp.responsibilities.length > 0) {
                txt += `\nResponsibilities:\n`;
                exp.responsibilities.forEach((r: string) => txt += `- ${r}\n`);
            }
            txt += `\n`;
        });
    }
    
    // Education
    if (data.education && data.education.length > 0) {
        txt += `EDUCATION\n`;
        txt += `--------------------\n`;
        data.education.forEach((edu: EducationItem) => {
            txt += `${edu.institution}\n`;
            if (edu.degree) txt += `Degree: ${edu.degree}\n`;
            if (edu.location) txt += `Location: ${edu.location}\n`;
            if (edu.year || edu.startDate) txt += `Dates/Year: ${edu.year || (edu.startDate + (edu.endDate ? ` - ${edu.endDate}` : ''))}\n`;
            txt += `\n`;
        });
    }
    
    // Achievements (if added later)
    if (data.achievements && data.achievements.length > 0) {
        txt += `ACHIEVEMENTS\n`;
        txt += `--------------------\n`;
         data.achievements.forEach((ach: any) => {
            txt += `${ach.title}\n`;
            if (ach.date) txt += `Date: ${ach.date}\n`;
            if (ach.description) txt += `${ach.description}\n`;
            txt += `\n`;
        });
    }

    return txt;
};

export async function POST(request: Request) {
  try {
    console.log('Received CV export request...');
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // --- Validate Request Body ---
    let rawBody;
    try {
        rawBody = await request.json();
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    const validationResult = CvExportRequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
       console.error('Invalid export request data:', validationResult.error.flatten());
        return NextResponse.json(
            { error: 'Invalid export request format', details: validationResult.error.flatten().fieldErrors }, 
            { status: 400 }
        );
    }
    const { analysisData, originalFormat } = validationResult.data;

    console.log(`Exporting CV data in format: ${originalFormat}`);
    
    let fileBuffer: Buffer;
    let contentType: string;
    let filename: string = `CV_Export_${Date.now()}`;

    // --- Document Generation Logic --- 
    if (originalFormat === 'application/pdf') {
        contentType = 'application/pdf';
        filename += '.pdf';
        console.warn('PDF export generation not implemented yet.');
        // Access name via contactInfo for placeholder
        fileBuffer = Buffer.from(`PDF Export for ${analysisData.contactInfo?.name || 'CV'} - Not Implemented`); 
    } else if (originalFormat === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        filename += '.docx';
        console.warn('DOCX export generation not implemented yet.');
        // Access name via contactInfo for placeholder
        fileBuffer = Buffer.from(`DOCX Export for ${analysisData.contactInfo?.name || 'CV'} - Not Implemented`); 
    } else if (originalFormat === 'text/plain') {
        contentType = 'text/plain';
        filename += '.txt';
        const txtContent = formatDataToTxt(analysisData);
        fileBuffer = Buffer.from(txtContent, 'utf-8');
        console.log('Generated TXT content.');
    } else {
      return NextResponse.json({ error: `Unsupported export format: ${originalFormat}` }, { status: 400 });
    }

    // --- Return File --- 
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
    return response;

  } catch (error) {
    console.error('Error during CV export:', error);
    return NextResponse.json({ error: 'Failed to export CV' }, { status: 500 });
  }
} 