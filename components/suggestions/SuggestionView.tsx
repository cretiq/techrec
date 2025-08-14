import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui-daisy/dialog";
import {  Button  } from '@/components/ui-daisy/button';
import { Loader2, AlertCircle, Check, X as XIcon } from 'lucide-react';
import {  Badge  } from '@/components/ui-daisy/badge';
import { ScrollArea } from '@/components/ui-daisy/scroll-area';
import { CvImprovementSuggestion } from '@/types/cv';

// Placeholder for a diff component
const DiffView = ({ original, improved }: { original?: string | null; improved?: string | null }) => (
    <div className="grid grid-cols-2 gap-2 text-xs border rounded p-2 my-1">
        <div className="text-red-600 line-through">{original || '[No Original Text]'}</div>
        <div className="text-green-600">{improved || '[No Suggested Text]'}</div>
    </div>
);

interface SuggestionViewProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isLoading: boolean;
  suggestionsData: { suggestions?: CvImprovementSuggestion[] } | null;
  error?: string | null;
  onAccept: (suggestion: CvImprovementSuggestion, index: number) => void; 
  onReject: (index: number) => void;
}

export function SuggestionView({
  isOpen,
  onOpenChange,
  isLoading,
  suggestionsData,
  error,
  onAccept,
  onReject,
}: SuggestionViewProps) {

  const [suggestionStatuses, setSuggestionStatuses] = React.useState<Record<number, 'accepted' | 'rejected' | 'pending'>>({});

  React.useEffect(() => {
    setSuggestionStatuses({});
  }, [suggestionsData]);

  const handleAcceptClick = (suggestion: CvImprovementSuggestion, index: number) => {
      onAccept(suggestion, index);
      setSuggestionStatuses(prev => ({ ...prev, [index]: 'accepted' }));
  };
  
  const handleRejectClick = (index: number) => {
      onReject(index);
      setSuggestionStatuses(prev => ({ ...prev, [index]: 'rejected' }));
  };

  const renderSuggestion = (suggestion: CvImprovementSuggestion, index: number) => {
    const status = suggestionStatuses[index] || 'pending';
    const isProcessed = status === 'accepted' || status === 'rejected';

    return (
      <div key={index} className={`p-3 border rounded-md mb-3 transition-colors ${isProcessed ? 'bg-muted/50 opacity-70' : 'bg-muted/20'}`}>
        <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{suggestion.section.replace(/_/g, ' ')}</span>
            <Badge variant="outline" className="text-xs">{suggestion.suggestionType}</Badge>
        </div>
        
        {/* Simple Diff Display */}
        {(suggestion.originalText || suggestion.suggestedText) && (
             <DiffView original={suggestion.originalText} improved={suggestion.suggestedText} />
        )}
       
        <p className="text-xs mt-1 italic">Reasoning: {suggestion.reasoning}</p>
        
         {/* Accept/Reject Buttons */} 
         <div className="flex justify-end gap-2 mt-2">
             {status === 'pending' && (
                <>
                    <Button variant="outline" size="sm" onClick={() => handleRejectClick(index)}> <XIcon className="h-4 w-4 mr-1"/> Reject</Button>
                    <Button variant="default" size="sm" onClick={() => handleAcceptClick(suggestion, index)}> <Check className="h-4 w-4 mr-1"/> Accept</Button>
                </>
             )}
             {status === 'accepted' && (
                 <Badge variant="default" className="bg-green-600"><Check className="h-4 w-4 mr-1"/> Accepted</Badge>
             )}
             {status === 'rejected' && (
                 <Badge variant="error"><XIcon className="h-4 w-4 mr-1"/> Rejected</Badge>
             )}
         </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>CV Improvement Suggestions</DialogTitle>
          <DialogDescription>
            Review the suggestions below to enhance your CV.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1 pr-4">
            {isLoading && (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Generating suggestions...</span>
                </div>
            )}
            {error && (
                 <div className="flex items-center justify-center h-40 text-destructive">
                    <AlertCircle className="h-8 w-8 mr-2" />
                    <span>Error: {error}</span>
                </div>
            )}
            {!isLoading && !error && suggestionsData?.suggestions && suggestionsData.suggestions.length > 0 && (
                 <div className="mt-4 space-y-2">
                     {suggestionsData.suggestions.map(renderSuggestion)}
                 </div>
            )}
             {!isLoading && !error && (!suggestionsData?.suggestions || suggestionsData.suggestions.length === 0) && (
                 <div className="flex items-center justify-center h-40 text-muted-foreground">
                    <span>No suggestions available.</span>
                </div>
             )}
        </ScrollArea>
        <DialogFooter>
           {/* Optional: Add global Accept All / Close buttons */}
          <DialogClose asChild>
            <Button type="button" variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 