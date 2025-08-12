# CV Extraction Manager Integration Guide

## 🎯 **Where to Add CVExtractionManager**

The `CVExtractionManager` should be integrated into the existing CV management flow. Here are the recommended integration points:

### **Option 1: Add to CV Management Page (Recommended)**

**File**: `/app/developer/cv-management/page.tsx`

Add a new tab or section after the existing analysis display:

```tsx
// Add import
import { CVExtractionManager } from '@/components/cv/CVExtractionManager';

// Add state for tab management
const [activeTab, setActiveTab] = useState<'analysis' | 'extraction'>('analysis');

// In the render section, replace or enhance the AnalysisResultDisplay area:
{currentAnalysisData && currentCV?.status === AnalysisStatus.COMPLETED && (
  <div className="space-y-6">
    {/* Tab Navigation */}
    <Card className="p-4">
      <div className="flex space-x-1 bg-base-200 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('analysis')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all',
            activeTab === 'analysis'
              ? 'bg-primary text-primary-content shadow-sm'
              : 'text-base-content opacity-70 hover:text-base-content hover:bg-base-300'
          )}
        >
          CV Analysis
        </button>
        <button
          onClick={() => setActiveTab('extraction')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all',
            activeTab === 'extraction'
              ? 'bg-primary text-primary-content shadow-sm'
              : 'text-base-content opacity-70 hover:text-base-content hover:bg-base-300'
          )}
        >
          Organize & Improve
        </button>
      </div>
    </Card>

    {/* Tab Content */}
    {activeTab === 'analysis' ? (
      <AnalysisResultDisplay originalMimeType={originalMimeType} />
    ) : (
      <CVExtractionManager
        cvId={currentCV.id}
        initialExperiences={currentAnalysisData?.experience || []}
        currentVersion={undefined} // You'll need to fetch this
      />
    )}
  </div>
)}
```

### **Option 2: Add as Separate Page**

**File**: `/app/developer/cv-extraction/page.tsx` (new)

Create a dedicated page for CV extraction management:

```tsx
'use client';

import { CVExtractionManager } from '@/components/cv/CVExtractionManager';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CVExtractionPage() {
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const cvId = searchParams.get('cvId');

  useEffect(() => {
    if (cvId) {
      fetchCVData(cvId);
    }
  }, [cvId]);

  const fetchCVData = async (id: string) => {
    try {
      // Fetch CV and experiences
      const [cvResponse, experienceResponse] = await Promise.all([
        fetch(`/api/cv/${id}`),
        fetch('/api/developer/me/experience')
      ]);

      const cv = await cvResponse.json();
      const experiences = await experienceResponse.json();

      setCvData({ cv, experiences });
    } catch (error) {
      console.error('Error fetching CV data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!cvData) return <div>CV not found</div>;

  return (
    <div className="container mx-auto py-6">
      <CVExtractionManager
        cvId={cvData.cv.id}
        initialExperiences={cvData.experiences}
        currentVersion={cvData.activeVersion}
      />
    </div>
  );
}
```

### **Option 3: Add Button to Launch Modal**

Add a button in the CV management page that opens the CVExtractionManager in a modal:

```tsx
// Add to the action buttons area
<Button
  variant="outline"
  onClick={() => setShowExtractionManager(true)}
  className="gap-2"
>
  <Settings className="h-4 w-4" />
  Organize CV Data
</Button>

// Add modal state and component
{showExtractionManager && (
  <Dialog open onOpenChange={setShowExtractionManager}>
    <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
      <CVExtractionManager
        cvId={currentCV.id}
        initialExperiences={currentAnalysisData?.experience || []}
        currentVersion={undefined}
      />
    </DialogContent>
  </Dialog>
)}
```

## 🔄 **Data Requirements**

The `CVExtractionManager` needs:

### **Required Props:**
1. **`cvId`** - Available from `currentCV.id`
2. **`initialExperiences`** - Fetch from `/api/developer/me/experience`
3. **`currentVersion`** - Fetch from `/api/cv/versions/${cvId}` (active version)

### **Data Fetching Helper:**
```tsx
const fetchCVExtractionData = async (cvId: string) => {
  try {
    const [experienceResponse, versionsResponse] = await Promise.all([
      fetch('/api/developer/me/experience'),
      fetch(`/api/cv/versions/${cvId}`)
    ]);

    const experiences = await experienceResponse.json();
    const versionsData = await versionsResponse.json();
    const activeVersion = versionsData.versions?.find(v => v.isActive);

    return {
      experiences: experiences || [],
      currentVersion: activeVersion,
    };
  } catch (error) {
    console.error('Error fetching extraction data:', error);
    return { experiences: [], currentVersion: undefined };
  }
};
```

## 🎯 **Recommended Implementation**

**Best approach**: **Option 1** - Add as tab to existing CV management page

**Why?**
- ✅ Keeps related functionality together
- ✅ Doesn't require new routing
- ✅ Natural user flow after CV analysis
- ✅ Maintains context of current CV

**Steps:**
1. Add import for `CVExtractionManager`
2. Add tab state management
3. Add tab navigation UI
4. Add data fetching for extraction manager
5. Integrate tab content switching

## 🚀 **Quick Start**

Want to test it quickly? Add this to your CV management page:

```tsx
// Add after line 771 (where AnalysisResultDisplay is rendered)
<div className="mt-8">
  <Card className="p-6">
    <h3 className="text-xl font-semibold mb-4">CV Data Organization</h3>
    <CVExtractionManager
      cvId={currentCV.id}
      initialExperiences={currentAnalysisData?.experience || []}
    />
  </Card>
</div>
```

This will render the extraction manager below the existing analysis display as a proof of concept.