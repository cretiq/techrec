import React, { useState, useEffect, useRef } from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {  Button  } from '@/components/ui-daisy/button';
import { StarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackProps {
  onSubmit?: (comment: string, rating: number | undefined) => void;
  maxRating?: number;
  showRating?: boolean;
  showComment?: boolean;
  initialRating?: number;
  readOnly?: boolean;
}

interface StarRatingProps {
  value: number | undefined;
  onChange: (rating: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  value, 
  onChange, 
  max = 5,
  size = 'md',
  readOnly = false
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [focusedStar, setFocusedStar] = useState<number | null>(null);
  const starRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  }[size];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (readOnly) return;

    let newFocusIndex: number | null = null;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newFocusIndex = Math.max(0, index - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        newFocusIndex = Math.min(max - 1, index + 1);
        break;
      case ' ': // Space
      case 'Enter':
        e.preventDefault();
        onChange?.(index + 1);
        break;
    }

    if (newFocusIndex !== null) {
      setFocusedStar(newFocusIndex);
      starRefs.current[newFocusIndex]?.focus();
    }
  };

  useEffect(() => {
    // Initialize refs array
    starRefs.current = starRefs.current.slice(0, max);
  }, [max]);

  return (
    <div 
      className="flex items-center gap-1" 
      role="radiogroup"
      aria-label="Rating"
      aria-readonly={readOnly}
    >
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const filled = (hoverValue ?? value ?? 0) >= starValue;
        const isFocused = focusedStar === i;

        return (
          <button
            ref={(el) => { starRefs.current[i] = el; }}
            key={i}
            type="button"
            className={cn(
              "p-1 rounded focus:outline-none transition-colors",
              isFocused && "ring-2 ring-ring ring-offset-1 ring-offset-background",
              filled ? "text-amber-400 dark:text-amber-300" : "text-muted-foreground",
              readOnly ? "cursor-default" : "cursor-pointer"
            )}
            onMouseEnter={() => !readOnly && setHoverValue(starValue)}
            onMouseLeave={() => !readOnly && setHoverValue(null)}
            onClick={() => !readOnly && onChange?.(starValue)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onFocus={() => setFocusedStar(i)}
            onBlur={() => setFocusedStar(null)}
            role="radio"
            aria-checked={value === starValue}
            aria-label={`Rate ${starValue} out of ${max}`}
            tabIndex={!readOnly && (value === starValue || (value === undefined && i === 0)) ? 0 : -1}
            disabled={readOnly}
          >
            <StarIcon 
              className={cn(sizeClass)} 
              fill={filled ? "currentColor" : "none"} 
            />
          </button>
        );
      })}
    </div>
  );
};

export const Feedback: React.FC<FeedbackProps> = ({
  onSubmit,
  maxRating = 5,
  showRating = true,
  showComment = true,
  initialRating,
  readOnly = false
}) => {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number | undefined>(initialRating);

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const handleSubmit = () => {
    onSubmit?.(comment, rating);
  };

  return (
    <div className="grid w-full gap-4">
      {showRating && (
        <div className="grid gap-1.5">
          <Label>Rating</Label>
          <StarRating 
            value={rating}
            onChange={setRating}
            max={maxRating}
            readOnly={readOnly}
          />
        </div>
      )}

      {showComment && (
        <div className="grid w-full gap-1.5">
          <Label htmlFor="feedback-comment">Comment</Label>
          <Textarea
            placeholder="Provide your feedback..."
            id="feedback-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            readOnly={readOnly}
          />
        </div>
      )}
      {!readOnly && (
        <Button onClick={handleSubmit} disabled={!comment && rating === undefined}>
          Submit Feedback
        </Button>
      )}
    </div>
  );
}; 